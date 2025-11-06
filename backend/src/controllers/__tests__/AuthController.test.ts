import { Request, Response } from 'express';
import { AuthController } from '../AuthController';
import { AuthService } from '../../services/AuthService';

// Mock AuthService
jest.mock('../../services/AuthService');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: statusMock as any,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user and return 201', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        profile: { displayName: 'Test' },
        premium: { status: false },
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test',
        language: 'en',
        country: 'NLD',
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser as any,
        tokens: mockTokens,
      });

      await AuthController.register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            email: 'test@example.com',
          }),
          tokens: mockTokens,
        },
      });
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        profile: { displayName: 'Test' },
        premium: { status: false },
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockAuthService.login.mockResolvedValue({
        user: mockUser as any,
        tokens: mockTokens,
      });

      await AuthController.login(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object),
          tokens: mockTokens,
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockRequest.body = {
        refreshToken: 'old-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);

      await AuthController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { tokens: mockTokens },
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockRequest.body = {
        refreshToken: 'token-to-invalidate',
      };

      mockAuthService.logout.mockResolvedValue();

      await AuthController.logout(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    });
  });
});
