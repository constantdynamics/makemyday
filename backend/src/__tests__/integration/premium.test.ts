import request from 'supertest';
import app from '../../index';
import { pgPool } from '../../database/connection';

describe('Premium API Integration Tests', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const email = `premium-test-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'TestPass123',
        displayName: 'Premium Test User',
        language: 'en',
        country: 'NLD',
      });

    accessToken = response.body.data.tokens.accessToken;
    userId = response.body.data.user.id;
  });

  afterAll(async () => {
    await pgPool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  describe('GET /api/v1/premium/status', () => {
    it('should return premium status', async () => {
      const response = await request(app)
        .get('/api/v1/premium/status')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isPremium');
      expect(response.body.data.isPremium).toBe(false); // New user, not premium
    });
  });

  describe('POST /api/v1/premium/trial', () => {
    it('should start premium trial', async () => {
      const response = await request(app)
        .post('/api/v1/premium/trial')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trialDays).toBe(7);
    });

    it('should verify premium status after trial', async () => {
      const response = await request(app)
        .get('/api/v1/premium/status')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isPremium).toBe(true);
    });

    it('should reject second trial attempt', async () => {
      const response = await request(app)
        .post('/api/v1/premium/trial')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/premium/daily-menu', () => {
    it('should generate daily menu for premium user', async () => {
      const response = await request(app)
        .post('/api/v1/premium/daily-menu')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          preferredDuration: 180,
          preferredTransport: 'WALKING',
          preferredTime: 'AFTERNOON',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.menu).toBeDefined();
      expect(Array.isArray(response.body.data.menu)).toBe(true);
    }, 30000);
  });

  describe('POST /api/v1/premium/themed-adventure', () => {
    it('should generate themed adventure', async () => {
      const response = await request(app)
        .post('/api/v1/premium/themed-adventure')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          theme: 'hidden-gems',
          duration: 240,
          location: { lat: 52.3676, lng: 4.9041 },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.adventure).toBeDefined();
      expect(response.body.data.adventure.theme).toBe('hidden-gems');
      expect(response.body.data.adventure.activities).toBeDefined();
    }, 60000); // Longer timeout for multiple activity generations
  });

  describe('GET /api/v1/premium/statistics', () => {
    it('should get premium statistics', async () => {
      const response = await request(app)
        .get('/api/v1/premium/statistics')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.statistics).toBeDefined();
    });
  });
});
