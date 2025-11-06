import { GenerateActivityDto, ActivitySuggestion, Activity, ActivitySource } from '@makemyday/shared';
import { calculateDistance, calculateMaxDistance, TRANSPORT_SPEEDS } from '@makemyday/shared';
import { OSMService } from './OSMService';
import { RoutingService } from './RoutingService';
import { ChallengeService } from './ChallengeService';
import { ActivityModel } from '../database/models/Activity';
import { verifyOpeningHours, addMinutes } from '@makemyday/shared';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ActivityService {
  /**
   * Generate activity suggestion based on configuration
   * This is the core "spinning wheel" algorithm
   */
  static async generateSuggestion(data: GenerateActivityDto): Promise<ActivitySuggestion> {
    logger.info('Generating activity suggestion', {
      location: data.location,
      transport: data.transport,
      time: data.time,
    });

    // 1. Calculate search radius
    const maxDistance = calculateMaxDistance(
      TRANSPORT_SPEEDS[data.transport as keyof typeof TRANSPORT_SPEEDS],
      120 // max 2 hours travel time
    );

    // 2. Query nearby POIs from OpenStreetMap
    const pois = await OSMService.queryNearbyPOIs(data.location, maxDistance, data.filters);

    // 3. Query challenges
    const challenges = await ChallengeService.findSuitableChallenges({
      groupSize: data.groupSize,
      excludeIds: data.excludeIds || [],
      isPremium: data.isPremium,
      difficulty: 3, // default difficulty
    });

    // 4. Filter POIs based on criteria
    const suitablePOIs = await this.filterPOIs(pois, {
      currentLocation: data.location,
      maxDistance,
      excludeIds: data.excludeIds || [],
    });

    // 5. Combine POIs and challenges into weighted pool
    const candidates: Array<{ type: 'POI' | 'CHALLENGE'; data: any; weight: number }> = [];

    // Add POIs with weights
    for (const poi of suitablePOIs) {
      const distance = calculateDistance(data.location, poi.location);
      const weight = this.calculatePOIWeight(poi, distance);
      candidates.push({ type: 'POI', data: poi, weight });
    }

    // Add challenges with weights
    for (const challenge of challenges) {
      const weight = this.calculateChallengeWeight(challenge);
      candidates.push({ type: 'CHALLENGE', data: challenge, weight });
    }

    if (candidates.length === 0) {
      throw new AppError('No suitable activities found in your area', 404);
    }

    // 6. Select random activity with weighting
    const selected = this.weightedRandomSelect(candidates);

    // 7. Convert to Activity format
    let activity: Activity;

    if (selected.type === 'POI') {
      activity = await this.convertPOIToActivity(selected.data);
    } else {
      activity = await this.convertChallengeToActivity(selected.data, data.location);
    }

    // 8. Calculate route
    const route = await RoutingService.calculateRoute(
      data.location,
      { lat: activity.location.coordinates[1], lng: activity.location.coordinates[0] },
      data.transport as any
    );

    // 9. Estimate arrival time
    const estimatedArrival = RoutingService.estimateArrivalTime(route);

    // 10. Verify opening hours
    if (activity.openingHours) {
      const hoursCheck = verifyOpeningHours(activity.openingHours, estimatedArrival);
      if (!hoursCheck.meetsMinimum) {
        // Recursively try another suggestion
        logger.info('Activity does not meet opening hours requirement, trying another');
        return this.generateSuggestion({
          ...data,
          excludeIds: [...(data.excludeIds || []), activity.id],
        });
      }
    }

    return {
      activity,
      route: {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
      },
      estimatedArrival,
    };
  }

  private static async filterPOIs(
    pois: any[],
    criteria: {
      currentLocation: { lat: number; lng: number };
      maxDistance: number;
      excludeIds: string[];
    }
  ): Promise<any[]> {
    return pois.filter((poi) => {
      // Check distance
      const distance = calculateDistance(criteria.currentLocation, poi.location);
      if (distance > criteria.maxDistance) return false;

      // Check if not in exclude list
      if (criteria.excludeIds.includes(poi.osmId)) return false;

      // Check if has a name
      if (!poi.name || poi.name === 'Unknown Place') return false;

      return true;
    });
  }

  private static calculatePOIWeight(poi: any, distance: number): number {
    let weight = 1.0;

    // Prefer closer locations (but not too close)
    if (distance < 500) {
      weight *= 0.5; // Too close, less interesting
    } else if (distance < 2000) {
      weight *= 1.2; // Sweet spot
    } else if (distance > 10000) {
      weight *= 0.8; // Far, but okay
    }

    // Prefer certain types
    const preferredTypes = ['museum', 'attraction', 'viewpoint', 'castle', 'monument'];
    if (preferredTypes.includes(poi.type)) {
      weight *= 1.3;
    }

    // Prefer places with opening hours (means they're real venues)
    if (poi.openingHours) {
      weight *= 1.1;
    }

    return weight;
  }

  private static calculateChallengeWeight(challenge: any): number {
    let weight = 1.5; // Base weight higher than POIs for variety

    // Prefer less completed challenges
    if (challenge.timesCompleted < 10) {
      weight *= 1.3;
    } else if (challenge.timesCompleted > 100) {
      weight *= 0.8;
    }

    // Prefer higher rated challenges
    if (challenge.averageRating > 4) {
      weight *= 1.2;
    }

    return weight;
  }

  private static weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1]; // Fallback
  }

  private static async convertPOIToActivity(poi: any): Promise<Activity> {
    // Check if activity already exists in database
    let activity = await ActivityModel.findOne({ osmId: poi.osmId });

    if (!activity) {
      // Create new activity from POI
      activity = await ActivityModel.create({
        type: 'POI',
        source: 'OSM',
        osmId: poi.osmId,
        title: {
          en: poi.name,
          nl: poi.name,
        },
        description: {
          en: `Visit ${poi.name}`,
          nl: `Bezoek ${poi.name}`,
        },
        location: {
          type: 'Point',
          coordinates: [poi.location.lng, poi.location.lat],
          address: poi.tags['addr:full'] || '',
        },
        category: [poi.type],
        difficulty: 2,
        estimatedDuration: {
          min: 30,
          max: 120,
        },
        requirements: {
          weather: ['ANY'],
          timeOfDay: ['ANY'],
          season: ['ANY'],
          groupSize: { min: 1, max: 5 },
        },
        openingHours: poi.openingHours,
        metadata: {
          osmTags: poi.tags,
          website: poi.website,
          phone: poi.phone,
        },
        statistics: {
          timesCompleted: 0,
          averageRating: 0,
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        premium: false,
        active: true,
      });
    }

    return activity.toObject() as Activity;
  }

  private static async convertChallengeToActivity(
    challenge: any,
    nearLocation: { lat: number; lng: number }
  ): Promise<Activity> {
    // Challenges are location-flexible, so we use the current area
    return {
      id: challenge._id.toString(),
      type: 'CHALLENGE',
      source: ActivitySource.CUSTOM,
      title: challenge.title,
      description: challenge.description,
      location: {
        type: 'Point',
        coordinates: [nearLocation.lng, nearLocation.lat],
        radius: 1000, // Can be completed within 1km
      },
      category: [challenge.category],
      difficulty: challenge.difficulty,
      estimatedDuration: {
        min: challenge.estimatedDuration,
        max: challenge.estimatedDuration,
      },
      requirements: challenge.requirements,
      metadata: {
        images: [],
      },
      statistics: {
        timesCompleted: challenge.timesCompleted,
        averageRating: challenge.averageRating,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      premium: challenge.premium,
      active: challenge.active,
      created: challenge.created,
      lastUpdated: challenge.created,
    };
  }

  static async rateActivity(activityId: string, rating: number): Promise<void> {
    const activity = await ActivityModel.findById(activityId);

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    // Update statistics
    const ratings = activity.statistics.ratings as any;
    const totalRatings =
      (ratings['1'] || 0) +
      (ratings['2'] || 0) +
      (ratings['3'] || 0) +
      (ratings['4'] || 0) +
      (ratings['5'] || 0);

    const currentTotal = activity.statistics.averageRating * totalRatings;
    const newTotal = currentTotal + rating;
    const newCount = totalRatings + 1;

    activity.statistics.averageRating = newTotal / newCount;
    ratings[rating.toString()] = (ratings[rating.toString()] || 0) + 1;
    activity.statistics.timesCompleted += 1;

    await activity.save();
  }
}
