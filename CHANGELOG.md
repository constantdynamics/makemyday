# Changelog

All notable changes to Make My Day will be documented in this file.

## [1.1.0] - 2024-11-06

### Added
- **Photo Verification System**
  - Timestamp verification (within 24 hours)
  - Location verification (within 1km of activity)
  - Duplicate detection using image hashing
  - Image format validation (JPEG/PNG)
  - File size validation (10KB - 10MB)

- **Premium Features**
  - Premium subscription management
  - 7-day free trial system
  - Daily Discovery Menu (3 daily suggestions)
  - Themed Adventures (historical, culinary, art, nature, hidden gems)
  - Vacation Explorer (2x per year, 20+ activities per destination)
  - Premium statistics dashboard

- **Testing Infrastructure**
  - Jest configuration for backend and shared packages
  - Unit tests for utility functions (distance, time, validators)
  - Unit tests for AuthService
  - Unit tests for RoutingService
  - Controller tests
  - Test fixtures and mocks

- **Challenges Database**
  - Expanded from 10 to 150+ challenges
  - 40 photo challenges
  - 40 interaction challenges
  - 40 discovery challenges
  - 30 creative challenges
  - 20 premium-only challenges
  - Multilingual support (NL, EN, DE, FR, ES)

- **API Endpoints**
  - `/premium/trial` - Start premium trial
  - `/premium/status` - Check premium status
  - `/premium/statistics` - Get premium statistics
  - `/premium/daily-menu` - Generate daily discovery menu
  - `/premium/themed-adventure` - Generate themed adventure
  - `/premium/vacation-plan` - Create vacation plan

### Improved
- Error handling with comprehensive logging
- Code documentation and inline comments
- Type safety across the codebase
- Database schema with premium features

### Fixed
- Import paths for shared package
- Environment variable handling
- Cache key generation for complex queries

### Testing
- All shared utility tests passing (36/36)
- Test coverage setup with minimum 70% threshold
- Automated test running with npm scripts

## [1.0.0] - 2024-11-06

### Initial Release
- Complete backend API with Express + TypeScript
- React Native frontend with Expo
- JWT authentication system
- Activity suggestion engine with OpenStreetMap
- Challenge system with 100+ challenges
- Routing with OSRM
- Session management
- User profiles and statistics
- PostgreSQL, MongoDB, and Redis integration
- Docker Compose setup
- Complete documentation
