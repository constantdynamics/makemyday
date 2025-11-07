import { AuthService } from '../AuthService';
import { pgPool } from '../../database/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mockCreateUserDto } from '../../__tests__/fixtures';

// Mock dependencies
jest.mock('../../database/connection');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockPgPool = pgPool as any;
mockPgPool.query = jest.fn();
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Mock database responses
      mockPgPool.query
        .mockResolvedValueOnce({ rows: [] } as any) // Check existing user
        .mockResolvedValueOnce({ // Create user
          rows: [{
            id: '123',
            email: mockCreateUserDto.email,
            password_hash: 'hashed',
            display_name: mockCreateUserDto.displayName,
            language: mockCreateUserDto.language,
            country: mockCreateUserDto.country,
            is_premium: false,
            total_sessions: 0,
            total_activities: 0,
            total_distance: 0,
            total_time: 0,
            average_rating: 0,
            preferences: {},
            created_at: new Date(),
            last_active: new Date(),
          }]
        } as any)
        .mockResolvedValueOnce({} as any); // Store refresh token

      mockBcrypt.hash.mockResolvedValue('hashed' as never);
      mockJwt.sign.mockReturnValue('mock-token' as never);

      const result = await AuthService.register(mockCreateUserDto);

      expect(result.user.email).toBe(mockCreateUserDto.email);
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
    });

    it('should throw error if user already exists', async () => {
      mockPgPool.query.mockResolvedValueOnce({
        rows: [{ id: '123' }]
      } as any);

      await expect(AuthService.register(mockCreateUserDto))
        .rejects
        .toThrow('User already exists');
    });

    it('should throw error for invalid email', async () => {
      const invalidDto = { ...mockCreateUserDto, email: 'invalid-email' };

      await expect(AuthService.register(invalidDto))
        .rejects
        .toThrow('Invalid email format');
    });

    it('should throw error for weak password', async () => {
      const weakDto = { ...mockCreateUserDto, password: 'weak' };

      await expect(AuthService.register(weakDto))
        .rejects
        .toThrow('Password must be at least 8 characters');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('SecurePass123', 10);

      mockPgPool.query
        .mockResolvedValueOnce({ // Find user
          rows: [{
            id: '123',
            email: 'test@example.com',
            password_hash: hashedPassword,
            display_name: 'Test User',
            language: 'en',
            country: 'NLD',
            is_premium: false,
            total_sessions: 0,
            total_activities: 0,
            total_distance: 0,
            total_time: 0,
            average_rating: 0,
            preferences: {},
            created_at: new Date(),
            last_active: new Date(),
          }]
        } as any)
        .mockResolvedValueOnce({} as any) // Update last active
        .mockResolvedValueOnce({} as any); // Store refresh token

      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('mock-token' as never);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'SecurePass123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('mock-token');
    });

    it('should throw error for non-existent user', async () => {
      mockPgPool.query.mockResolvedValueOnce({ rows: [] } as any);

      await expect(AuthService.login({
        email: 'nonexistent@example.com',
        password: 'password',
      }))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      mockPgPool.query.mockResolvedValueOnce({
        rows: [{
          id: '123',
          email: 'test@example.com',
          password_hash: 'hashed',
        }]
      } as any);

      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(AuthService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwt.verify.mockReturnValue({ userId: '123', type: 'refresh' } as never);
      mockPgPool.query
        .mockResolvedValueOnce({ // Check refresh token
          rows: [{ token: refreshToken }]
        } as any)
        .mockResolvedValueOnce({} as any) // Store new refresh token
        .mockResolvedValueOnce({} as any); // Delete old tokens

      mockJwt.sign.mockReturnValue('new-token' as never);

      const result = await AuthService.refreshToken(refreshToken);

      expect(result.accessToken).toBe('new-token');
      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String));
    });

    it('should throw error for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await expect(AuthService.refreshToken('invalid-token'))
        .rejects
        .toThrow('Invalid or expired refresh token');
    });

    it('should throw error for expired refresh token', async () => {
      mockJwt.verify.mockReturnValue({ userId: '123', type: 'refresh' } as never);
      mockPgPool.query.mockResolvedValueOnce({ rows: [] } as any);

      await expect(AuthService.refreshToken('expired-token'))
        .rejects
        .toThrow('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      const refreshToken = 'token-to-delete';

      mockPgPool.query.mockResolvedValueOnce({} as any);

      await AuthService.logout(refreshToken);

      expect(mockPgPool.query).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    });
  });
});
