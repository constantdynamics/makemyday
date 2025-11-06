import request from 'supertest';
import app from '../../index';

describe('Activity API Integration Tests', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const email = `activity-test-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'TestPass123',
        displayName: 'Activity Test User',
        language: 'en',
        country: 'NLD',
      });

    accessToken = response.body.data.tokens.accessToken;
    userId = response.body.data.user.id;
  });

  describe('POST /api/v1/activities/generate', () => {
    it('should generate activity suggestion', async () => {
      const response = await request(app)
        .post('/api/v1/activities/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          location: {
            lat: 52.3676,
            lng: 4.9041,
          },
          transport: 'WALKING',
          time: 120,
          groupSize: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestion).toHaveProperty('activity');
      expect(response.body.data.suggestion).toHaveProperty('route');
      expect(response.body.data.suggestion.activity).toHaveProperty('id');
      expect(response.body.data.suggestion.activity).toHaveProperty('title');
    }, 30000); // Increase timeout for OSM API

    it('should respect filters', async () => {
      const response = await request(app)
        .post('/api/v1/activities/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          location: { lat: 52.3676, lng: 4.9041 },
          transport: 'CYCLING',
          time: 180,
          groupSize: 1,
          filters: ['cultural-historical'],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.suggestion.activity).toBeDefined();
    }, 30000);

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/activities/generate')
        .send({
          location: { lat: 52.3676, lng: 4.9041 },
          transport: 'WALKING',
          time: 120,
          groupSize: 2,
        });

      expect(response.status).toBe(401);
    });

    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/v1/activities/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          location: { lat: 200, lng: 4.9041 }, // Invalid latitude
          transport: 'WALKING',
          time: 120,
          groupSize: 2,
        });

      expect(response.status).toBe(400);
    });
  });
});
