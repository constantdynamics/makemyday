import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pgPool } from '../database/connection';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { CreateUserDto, LoginDto, AuthTokens, TokenPayload, User } from '@makemyday/shared';
import { isValidEmail, isValidPassword } from '@makemyday/shared';

export class AuthService {
  private static SALT_ROUNDS = 10;

  static async register(data: CreateUserDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate email
    if (!isValidEmail(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password
    if (!isValidPassword(data.password)) {
      throw new AppError(
        'Password must be at least 8 characters with uppercase, lowercase, and number',
        400
      );
    }

    // Check if user exists
    const existingUser = await pgPool.query('SELECT id FROM users WHERE email = $1', [data.email]);

    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const result = await pgPool.query(
      `INSERT INTO users (email, password_hash, display_name, language, country)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.email, passwordHash, data.displayName, data.language, data.country]
    );

    const user = this.mapUserFromDB(result.rows[0]);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, tokens };
  }

  static async login(data: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user
    const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [data.email]);

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const userRow = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, userRow.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = this.mapUserFromDB(userRow);

    // Update last active
    await pgPool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [
      user.id,
    ]);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, tokens };
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }

      // Check if refresh token exists in database
      const result = await pgPool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
        [refreshToken, decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Generate new tokens
      return await this.generateTokens(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new AppError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  private static async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId, type: 'access' } as TokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' } as TokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pgPool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );

    // Clean up expired tokens
    await pgPool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');

    return { accessToken, refreshToken };
  }

  private static mapUserFromDB(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      profile: {
        displayName: row.display_name,
        avatar: row.avatar,
        language: row.language,
        country: row.country,
      },
      preferences: row.preferences,
      premium: {
        status: row.is_premium,
        type: row.premium_type,
        startDate: row.premium_start_date,
        expiryDate: row.premium_expiry_date,
        autoRenew: row.premium_auto_renew,
      },
      homebase: row.homebase_location
        ? {
            coordinates: {
              type: 'Point',
              coordinates: [row.homebase_location.coordinates[0], row.homebase_location.coordinates[1]],
            },
            setAt: row.homebase_set_at,
          }
        : undefined,
      statistics: {
        totalSessions: row.total_sessions,
        totalActivities: row.total_activities,
        totalDistance: row.total_distance,
        totalTime: row.total_time,
        averageRating: parseFloat(row.average_rating),
      },
      created: row.created_at,
      lastActive: row.last_active,
    };
  }
}
