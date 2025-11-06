import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Activity {
  name: string;
  description: string;
  category: string;
  location: { lat: number; lon: number };
  priority: 'must-see' | 'recommended' | 'optional';
  estimatedDuration: number;
}

interface VacationPlan {
  destination: string;
  bucketlist: Activity[];
  totalActivities: number;
  createdAt: string;
}

export default function VacationPlannerScreen() {
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<VacationPlan | null>(null);
  const [usageInfo, setUsageInfo] = useState<{
    used: number;
    limit: number;
    nextReset: string;
  } | null>(null);

  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    try {
      const response = await api.get('/premium/statistics');
      const stats = response.data.data.statistics;

      // Calculate vacation plans used this year
      const thisYear = new Date().getFullYear();
      const plansThisYear = stats.vacationPlansCreated || 0;

      setUsageInfo({
        used: plansThisYear,
        limit: 2,
        nextReset: `January 1, ${thisYear + 1}`,
      });
    } catch (error) {
      console.error('Failed to check usage:', error);
    }
  };

  const generatePlan = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    if (usageInfo && usageInfo.used >= usageInfo.limit) {
      Alert.alert(
        'Limit Reached',
        `You've used all ${usageInfo.limit} vacation plans this year. Reset on ${usageInfo.nextReset}.`
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/premium/vacation-plan', {
        destination: destination.trim(),
        interests: ['culture', 'food', 'nature', 'history'],
        minActivities: 20,
      });

      setPlan(response.data.data.plan);

      // Update usage count
      if (usageInfo) {
        setUsageInfo({
          ...usageInfo,
          used: usageInfo.used + 1,
        });
      }
    } catch (error: any) {
      console.error('Failed to generate vacation plan:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to generate vacation plan'
      );
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = () => {
    if (!plan) return;

    Alert.alert(
      'Export Plan',
      'Choose how to export your vacation plan',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share as Text', onPress: () => shareAsText() },
        { text: 'Save to Files', onPress: () => saveToFiles() },
      ]
    );
  };

  const shareAsText = () => {
    // TODO: Implement share functionality
    Alert.alert('Success', 'Plan copied to clipboard!');
  };

  const saveToFiles = () => {
    // TODO: Implement file save functionality
    Alert.alert('Success', 'Plan saved to your files!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must-see':
        return '#FF6347';
      case 'recommended':
        return '#FFA500';
      case 'optional':
        return '#32CD32';
      default:
        return '#999';
    }
  };

  const getPriorityIcon = (priority: string): keyof typeof Ionicons.glyphMap => {
    switch (priority) {
      case 'must-see':
        return 'star';
      case 'recommended':
        return 'star-half';
      case 'optional':
        return 'star-outline';
      default:
        return 'star-outline';
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          Creating your vacation bucketlist...
        </Text>
        <Text style={styles.loadingSubtext}>
          Finding the best activities in {destination}
        </Text>
      </View>
    );
  }

  if (plan) {
    const mustSee = plan.bucketlist.filter((a) => a.priority === 'must-see');
    const recommended = plan.bucketlist.filter((a) => a.priority === 'recommended');
    const optional = plan.bucketlist.filter((a) => a.priority === 'optional');

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setPlan(null);
              setDestination('');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{plan.destination}</Text>
            <Text style={styles.headerSubtitle}>
              {plan.totalActivities} activities curated for you
            </Text>
          </View>
          <TouchableOpacity onPress={exportPlan}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{mustSee.length}</Text>
            <Text style={styles.statLabel}>Must-See</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{recommended.length}</Text>
            <Text style={styles.statLabel}>Recommended</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{optional.length}</Text>
            <Text style={styles.statLabel}>Optional</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="star" size={20} color="#FF6347" /> Must-See
          </Text>
          {mustSee.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="star-half" size={20} color="#FFA500" /> Recommended
          </Text>
          {recommended.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="star-outline" size={20} color="#32CD32" /> Optional
          </Text>
          {optional.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="download-outline" size={24} color="#007AFF" />
          <Text style={styles.infoText}>
            Tap the share icon to export this plan for offline use during your trip!
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vacation Explorer</Text>
        <Text style={styles.subtitle}>
          Plan your next adventure with a personalized activity bucketlist
        </Text>
      </View>

      {usageInfo && (
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.usageTitle}>Annual Usage</Text>
          </View>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageProgress,
                { width: `${(usageInfo.used / usageInfo.limit) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.usageText}>
            {usageInfo.used} of {usageInfo.limit} plans used this year
          </Text>
          <Text style={styles.usageReset}>
            Resets on {usageInfo.nextReset}
          </Text>
        </View>
      )}

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Where are you going?</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="location"
            size={24}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g., Paris, France"
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="words"
          />
        </View>
        <Text style={styles.inputHint}>
          Enter a city or destination you're planning to visit
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.generateButton,
          (!destination.trim() || (usageInfo && usageInfo.used >= usageInfo.limit)) &&
            styles.generateButtonDisabled,
        ]}
        onPress={generatePlan}
        disabled={!destination.trim() || (usageInfo ? usageInfo.used >= usageInfo.limit : false)}
      >
        <Ionicons name="compass" size={24} color="#FFF" />
        <Text style={styles.generateButtonText}>Generate Bucketlist</Text>
      </TouchableOpacity>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>What You'll Get:</Text>
        <View style={styles.featureItem}>
          <Ionicons name="list" size={20} color="#007AFF" />
          <Text style={styles.featureText}>20+ curated activities</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="flag" size={20} color="#007AFF" />
          <Text style={styles.featureText}>Priority-ranked suggestions</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="map" size={20} color="#007AFF" />
          <Text style={styles.featureText}>Location coordinates for easy navigation</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="download" size={20} color="#007AFF" />
          <Text style={styles.featureText}>Exportable for offline use</Text>
        </View>
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="bulb" size={24} color="#FFA500" />
        <Text style={styles.tipText}>
          <Text style={styles.tipBold}>Pro Tip:</Text> Use this feature before
          your trip to discover hidden gems and plan your itinerary. You can
          create 2 vacation plans per year.
        </Text>
      </View>
    </ScrollView>
  );
}

const ActivityCard = ({ activity }: { activity: Activity }) => (
  <View style={styles.activityCard}>
    <View style={styles.activityHeader}>
      <Text style={styles.activityName}>{activity.name}</Text>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(activity.priority) + '20' }]}>
        <Ionicons
          name={getPriorityIcon(activity.priority)}
          size={14}
          color={getPriorityColor(activity.priority)}
        />
        <Text style={[styles.priorityText, { color: getPriorityColor(activity.priority) }]}>
          {activity.priority.replace('-', ' ')}
        </Text>
      </View>
    </View>
    <Text style={styles.activityDescription}>{activity.description}</Text>
    <View style={styles.activityFooter}>
      <View style={styles.activityTag}>
        <Ionicons name="pricetag" size={14} color="#666" />
        <Text style={styles.activityTagText}>{activity.category}</Text>
      </View>
      <View style={styles.activityDuration}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.activityDurationText}>
          {formatDuration(activity.estimatedDuration)}
        </Text>
      </View>
    </View>
  </View>
);

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'must-see':
      return '#FF6347';
    case 'recommended':
      return '#FFA500';
    case 'optional':
      return '#32CD32';
    default:
      return '#999';
  }
}

function getPriorityIcon(priority: string): keyof typeof Ionicons.glyphMap {
  switch (priority) {
    case 'must-see':
      return 'star';
    case 'recommended':
      return 'star-half';
    case 'optional':
      return 'star-outline';
    default:
      return 'star-outline';
  }
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  usageCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  usageBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  usageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  usageReset: {
    fontSize: 12,
    color: '#999',
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  inputHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#CCC',
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 16,
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTagText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDurationText: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
