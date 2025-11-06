import request from 'supertest';
import app from '../../index';
import { pgPool } from '../../database/connection';

describe('Session API Integration Tests', () => {
  let accessToken: string;
  let userId: string;
  let sessionId: string;

  beforeAll(async () => {
    // Create test user
    const email = `session-test-${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'TestPass123',
        displayName: 'Session Test User',
        language: 'en',
        country: 'NLD',
      });

    accessToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await pgPool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pgPool.end();
  });

  describe('POST /api/v1/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transport: 'WALKING',
          totalTime: 120,
          groupSize: 2,
          startLocation: {
            lat: 52.3676,
            lng: 4.9041,
          },
          filters: ['cultural-historical'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toHaveProperty('id');
      expect(response.body.data.session.config.transport).toBe('WALKING');

      sessionId = response.body.data.session.id;
    });

    it('should reject unauthorized request', async () => {
      const response = await request(app)
        .post('/api/v1/sessions')
        .send({
          transport: 'WALKING',
          totalTime: 120,
          groupSize: 2,
          startLocation: { lat: 52.3676, lng: 4.9041 },
        });

      expect(response.status).toBe(401);
    });

    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transport: 'INVALID',
          totalTime: 120,
          groupSize: 2,
          startLocation: { lat: 52.3676, lng: 4.9041 },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/sessions', () => {
    it('should get user sessions', async () => {
      const response = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
      expect(response.body.data.sessions.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/sessions/:sessionId', () => {
    it('should get specific session', async () => {
      const response = await request(app)
        .get(`/api/v1/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.session.id).toBe(sessionId);
    });

    it('should reject access to other user\'s session', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `other-${Date.now()}@example.com`,
          password: 'TestPass123',
          displayName: 'Other User',
          language: 'en',
          country: 'NLD',
        });

      const otherToken = otherUserResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get(`/api/v1/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      // Cleanup
      await pgPool.query('DELETE FROM users WHERE id = $1', [
        otherUserResponse.body.data.user.id,
      ]);
    });
  });
});
