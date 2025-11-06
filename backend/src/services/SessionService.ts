import { pgPool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { CreateSessionDto, Session, CompleteActivityDto } from '@makemyday/shared';
import { FREE_USER_SKIPS, PREMIUM_USER_SKIPS } from '@makemyday/shared';

export class SessionService {
  static async createSession(userId: string, data: CreateSessionDto, isPremium: boolean): Promise<Session> {
    const skipsAvailable = isPremium ? PREMIUM_USER_SKIPS : FREE_USER_SKIPS;

    const result = await pgPool.query(
      `INSERT INTO sessions (
        user_id, transport_mode, total_time, group_size,
        start_location, filters, skips_available
      ) VALUES (
        $1, $2, $3, $4,
        ST_SetSRID(ST_MakePoint($5, $6), 4326),
        $7, $8
      ) RETURNING *`,
      [
        userId,
        data.transport,
        data.totalTime,
        data.groupSize,
        data.startLocation.lng,
        data.startLocation.lat,
        JSON.stringify(data.filters || []),
        skipsAvailable,
      ]
    );

    return this.mapSessionFromDB(result.rows[0]);
  }

  static async getSession(sessionId: string, userId: string): Promise<Session> {
    const result = await pgPool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    return this.mapSessionFromDB(result.rows[0]);
  }

  static async getUserSessions(userId: string, limit: number = 10): Promise<Session[]> {
    const result = await pgPool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows.map(this.mapSessionFromDB);
  }

  static async addActivityToSession(
    sessionId: string,
    userId: string,
    activityId: string,
    activityType: 'LOCATION' | 'CHALLENGE'
  ): Promise<void> {
    // Verify session belongs to user
    await this.getSession(sessionId, userId);

    await pgPool.query(
      'INSERT INTO session_activities (session_id, activity_id, activity_type) VALUES ($1, $2, $3)',
      [sessionId, activityId, activityType]
    );
  }

  static async completeActivity(
    sessionId: string,
    userId: string,
    activityId: string,
    data: CompleteActivityDto
  ): Promise<void> {
    // Verify session belongs to user
    await this.getSession(sessionId, userId);

    await pgPool.query(
      `UPDATE session_activities
       SET completed = TRUE, rating = $1, photo_url = $2, feedback = $3, completed_at = CURRENT_TIMESTAMP
       WHERE session_id = $4 AND activity_id = $5`,
      [data.rating, data.photo, data.feedback, sessionId, activityId]
    );

    // Update user statistics
    await pgPool.query(
      `UPDATE users
       SET total_activities = total_activities + 1
       WHERE id = $1`,
      [userId]
    );
  }

  static async skipActivity(sessionId: string, userId: string, activityId: string): Promise<void> {
    const session = await this.getSession(sessionId, userId);

    // Check if user has skips available
    if (session.skips.used >= session.skips.available) {
      throw new AppError('No skips available', 400);
    }

    // Mark activity as skipped
    await pgPool.query(
      `UPDATE session_activities
       SET skipped = TRUE
       WHERE session_id = $1 AND activity_id = $2`,
      [sessionId, activityId]
    );

    // Increment skips used
    await pgPool.query(
      `UPDATE sessions
       SET skips_used = skips_used + 1
       WHERE id = $1`,
      [sessionId]
    );
  }

  static async completeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId, userId);

    if (session.status !== 'ACTIVE') {
      throw new AppError('Session is not active', 400);
    }

    // Get session activities
    const activitiesResult = await pgPool.query(
      'SELECT * FROM session_activities WHERE session_id = $1',
      [sessionId]
    );

    // Calculate total duration
    const startTime = new Date(session.startedAt);
    const endTime = new Date();
    const totalDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

    // Update session
    await pgPool.query(
      `UPDATE sessions
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, total_duration = $1
       WHERE id = $2`,
      [totalDuration, sessionId]
    );

    // Update user statistics
    await pgPool.query(
      `UPDATE users
       SET total_sessions = total_sessions + 1, total_time = total_time + $1
       WHERE id = $2`,
      [totalDuration, userId]
    );
  }

  private static mapSessionFromDB(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      config: {
        transport: row.transport_mode,
        totalTime: row.total_time,
        groupSize: row.group_size,
        startLocation: {
          type: 'Point',
          coordinates: [row.start_location.coordinates[0], row.start_location.coordinates[1]],
        },
        filters: row.filters,
      },
      activities: [], // Would need to join with session_activities
      skips: {
        available: row.skips_available,
        used: row.skips_used,
        skippedTypes: row.skipped_types,
      },
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalDistance: row.total_distance,
      totalDuration: row.total_duration,
    };
  }
}
