# Make My Day - Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Expo CLI (for mobile development)

## Quick Setup (5 minutes)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd makemyday

# Run automated setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install all dependencies
- Start Docker containers (PostgreSQL, MongoDB, Redis)
- Run database migrations
- Seed the database with 100+ challenges

### 2. Start Development Servers

```bash
# Start both backend and frontend
npm run dev
```

Or separately:

```bash
# Terminal 1: Backend API
npm run backend

# Terminal 2: Frontend Mobile App
npm run frontend
```

### 3. Access the Application

- **Backend API**: http://localhost:3000
- **Frontend**: Expo Dev Tools will open automatically
  - Press `i` for iOS Simulator
  - Press `a` for Android Emulator
  - Scan QR code for physical device

## Architecture Overview

```
makemyday/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── models/    # Database models
│   │   └── middleware/
│   └── package.json
│
├── frontend/          # React Native (Expo)
│   ├── src/
│   │   ├── screens/   # App screens
│   │   ├── store/     # Redux state
│   │   └── services/  # API calls
│   └── package.json
│
├── shared/            # Shared TypeScript types
│   └── src/
│       ├── types/
│       ├── constants/
│       └── utils/
│
└── docker-compose.yml # Database services
```

## Core Features Implemented

### Backend ✅
- **Authentication**: JWT-based auth with refresh tokens
- **Session Management**: Create and manage adventure sessions
- **Activity Generation**: Smart suggestion engine using OSM data
- **Routing**: Turn-by-turn navigation with OSRM
- **Challenges**: 100+ pre-seeded challenges
- **Database**: PostgreSQL + MongoDB + Redis
- **API Rate Limiting**: Separate limits for free/premium users

### Frontend ✅
- **Welcome/Auth Flow**: Register, Login screens
- **Configuration**: Transport mode, time, group size selection
- **Spinning Wheel**: Animated wheel for activity discovery
- **Activity Details**: View activity info, distance, duration
- **Map Navigation**: Real-time navigation with route display
- **Completion**: Rate and review completed activities
- **State Management**: Redux Toolkit

## API Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Sessions
```
POST   /api/v1/sessions              # Create new session
GET    /api/v1/sessions              # Get user sessions
GET    /api/v1/sessions/:id          # Get session details
POST   /api/v1/sessions/:id/complete # Complete session
```

### Activities
```
POST /api/v1/activities/generate              # Generate suggestion
GET  /api/v1/activities/:id                   # Get activity
POST /api/v1/activities/:id/rate              # Rate activity
POST /api/v1/sessions/:sid/activities/:aid/complete  # Complete
POST /api/v1/sessions/:sid/activities/:aid/skip      # Skip
```

### Challenges
```
GET /api/v1/challenges              # List all challenges
GET /api/v1/challenges/:id          # Get challenge details
```

## Testing the Application

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@makemyday.app",
    "password": "Test1234",
    "displayName": "Test User",
    "language": "en",
    "country": "NLD"
  }'
```

### 2. Create a Session

```bash
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transport": "WALKING",
    "totalTime": 120,
    "groupSize": 2,
    "startLocation": {
      "lat": 52.3676,
      "lng": 4.9041
    }
  }'
```

### 3. Generate Activity

```bash
curl -X POST http://localhost:3000/api/v1/activities/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"lat": 52.3676, "lng": 4.9041},
    "transport": "WALKING",
    "time": 120,
    "groupSize": 2
  }'
```

## Development Tips

### Database Management

```bash
# View logs
docker-compose logs -f postgres
docker-compose logs -f mongodb

# Reset databases
docker-compose down -v
docker-compose up -d

# Run migrations again
cd backend
psql $POSTGRES_URL -f src/database/schema.sql
```

### Frontend Development

```bash
# Clear Expo cache
cd frontend
expo start -c

# Run on specific platform
expo start --ios
expo start --android
```

### Backend Development

```bash
# Watch mode (auto-restart on changes)
cd backend
npm run dev

# View logs
tail -f backend/logs/combined.log
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Issues
```bash
# Restart Docker containers
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

### Database Connection Issues
```bash
# Check if databases are running
docker ps

# Check database logs
docker-compose logs postgres
docker-compose logs mongodb
```

## Next Steps

1. **Add More Challenges**: Edit `backend/src/database/seed.ts`
2. **Premium Features**: Implement subscription logic
3. **Community Features**: Add social feed
4. **Photo Verification**: Integrate camera functionality
5. **Offline Mode**: Add offline caching
6. **Push Notifications**: Set up FCM

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Support

- 📧 Email: dev@makemyday.app
- 🐛 Issues: [GitHub Issues](https://github.com/makemyday/issues)
- 📖 Docs: [Full Documentation](./docs/)
