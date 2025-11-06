import { AppError } from '../middleware/errorHandler';
import { calculateDistance } from '@makemyday/shared';
import { logger } from '../utils/logger';
import crypto from 'crypto';

interface PhotoMetadata {
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  exif?: any;
}

interface VerificationResult {
  valid: boolean;
  reason?: string;
  warnings?: string[];
}

export class PhotoService {
  private static MAX_PHOTO_AGE_HOURS = 24;
  private static MAX_DISTANCE_METERS = 1000; // 1km

  /**
   * Verify photo meets requirements for activity completion
   */
  static async verifyPhoto(
    photoData: string | Buffer,
    metadata: PhotoMetadata,
    activityLocation: { lat: number; lng: number }
  ): Promise<VerificationResult> {
    const warnings: string[] = [];

    // 1. Check timestamp
    const timestampCheck = this.verifyTimestamp(metadata.timestamp);
    if (!timestampCheck.valid) {
      return timestampCheck;
    }
    if (timestampCheck.warnings) {
      warnings.push(...timestampCheck.warnings);
    }

    // 2. Check location if available
    if (metadata.location) {
      const locationCheck = this.verifyLocation(metadata.location, activityLocation);
      if (!locationCheck.valid) {
        return locationCheck;
      }
      if (locationCheck.warnings) {
        warnings.push(...locationCheck.warnings);
      }
    } else {
      warnings.push('Photo location data not available - verification limited');
    }

    // 3. Check for duplicate (hash-based)
    const duplicateCheck = await this.checkDuplicate(photoData);
    if (!duplicateCheck.valid) {
      return duplicateCheck;
    }

    // 4. Basic image validation
    const imageCheck = this.validateImage(photoData);
    if (!imageCheck.valid) {
      return imageCheck;
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Verify photo timestamp is recent enough
   */
  private static verifyTimestamp(timestamp: Date): VerificationResult {
    const now = new Date();
    const hoursSince = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (hoursSince > this.MAX_PHOTO_AGE_HOURS) {
      return {
        valid: false,
        reason: `Photo is too old (${Math.round(hoursSince)} hours). Must be taken within ${this.MAX_PHOTO_AGE_HOURS} hours.`,
      };
    }

    if (hoursSince < 0) {
      return {
        valid: false,
        reason: 'Photo timestamp is in the future. Check device time settings.',
      };
    }

    const warnings: string[] = [];
    if (hoursSince > 12) {
      warnings.push(`Photo is ${Math.round(hoursSince)} hours old - consider taking a fresh one`);
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Verify photo was taken near the activity location
   */
  private static verifyLocation(
    photoLocation: { lat: number; lng: number },
    activityLocation: { lat: number; lng: number }
  ): VerificationResult {
    const distance = calculateDistance(photoLocation, activityLocation);

    if (distance > this.MAX_DISTANCE_METERS) {
      return {
        valid: false,
        reason: `Photo taken too far from activity location (${Math.round(distance)}m away). Must be within ${this.MAX_DISTANCE_METERS}m.`,
      };
    }

    const warnings: string[] = [];
    if (distance > 500) {
      warnings.push(`Photo taken ${Math.round(distance)}m from location - verify you're at the right place`);
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Check if photo has been used before (duplicate detection)
   */
  private static async checkDuplicate(photoData: string | Buffer): Promise<VerificationResult> {
    try {
      const hash = this.generateImageHash(photoData);

      // TODO: Check hash against database
      // For now, we'll just log it
      logger.info(`Photo hash: ${hash}`);

      // In production, you would:
      // const existing = await PhotoHashModel.findOne({ hash });
      // if (existing) {
      //   return { valid: false, reason: 'This photo has already been used' };
      // }

      return { valid: true };
    } catch (error) {
      logger.error('Error checking photo duplicate:', error);
      return { valid: true }; // Don't block on technical errors
    }
  }

  /**
   * Validate image is not corrupted and meets basic requirements
   */
  private static validateImage(photoData: string | Buffer): VerificationResult {
    try {
      const buffer = typeof photoData === 'string' ? Buffer.from(photoData, 'base64') : photoData;

      // Check minimum size (at least 10KB)
      if (buffer.length < 10000) {
        return {
          valid: false,
          reason: 'Image file is too small or corrupted',
        };
      }

      // Check maximum size (10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return {
          valid: false,
          reason: 'Image file is too large (max 10MB)',
        };
      }

      // Check if it's a valid image format (basic check)
      const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;

      if (!isJPEG && !isPNG) {
        return {
          valid: false,
          reason: 'Invalid image format. Only JPEG and PNG are supported.',
        };
      }

      return { valid: true };
    } catch (error) {
      logger.error('Error validating image:', error);
      return {
        valid: false,
        reason: 'Failed to validate image',
      };
    }
  }

  /**
   * Generate hash for duplicate detection
   */
  private static generateImageHash(photoData: string | Buffer): string {
    const buffer = typeof photoData === 'string' ? Buffer.from(photoData, 'base64') : photoData;
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Extract EXIF data from image (simplified)
   */
  static extractExifData(photoData: Buffer): any {
    // TODO: Implement EXIF extraction using a library like 'exif-parser'
    // For now, return placeholder
    return {
      timestamp: new Date(),
      location: null,
      device: null,
    };
  }

  /**
   * Upload photo to storage (S3, etc.)
   */
  static async uploadPhoto(
    photoData: Buffer,
    userId: string,
    activityId: string
  ): Promise<string> {
    try {
      // Generate unique filename
      const filename = `${userId}/${activityId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`;

      // TODO: Implement actual S3 upload
      // For now, just return a placeholder URL
      logger.info(`Photo upload simulated: ${filename}`);

      const photoUrl = `https://photos.makemyday.app/${filename}`;

      return photoUrl;
    } catch (error) {
      logger.error('Error uploading photo:', error);
      throw new AppError('Failed to upload photo', 500);
    }
  }

  /**
   * Delete photo from storage
   */
  static async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // TODO: Implement actual S3 deletion
      logger.info(`Photo deletion simulated: ${photoUrl}`);
    } catch (error) {
      logger.error('Error deleting photo:', error);
      // Don't throw - photo deletion is not critical
    }
  }
}
