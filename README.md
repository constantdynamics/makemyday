# Make My Day

Make My Day is een mobiele applicatie die gebruikers helpt om verrassende, nieuwe ervaringen te ontdekken in hun directe omgeving of op reis.

## 🎯 Features

### Core Functionaliteit
- **Configureerbare Sessies**: Kies vervoermiddel, beschikbare tijd, groepsgrootte
- **Spinning Wheel Mechanisme**: Laat het toeval beslissen waar je naartoe gaat
- **OpenStreetMap Integratie**: Ontdek POIs en verborgen plekken
- **Challenges**: 100+ uitdagende opdrachten op verschillende locaties
- **Turn-by-turn Navigatie**: Vind je weg naar elke activiteit
- **Foto Verificatie**: Bewijs dat je de challenge hebt voltooid
- **Community Feed**: Deel ervaringen met andere gebruikers

### Premium Features (€1-1.50/maand)
- Geen advertenties
- Onbeperkte filters
- Uitgebreide statistieken
- Daily Discovery Menu
- Themed Adventures
- Vacation Explorer (2x per jaar)
- Uitgebreide radius (25km → onbeperkt)

## 🏗️ Architectuur

### Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Databases**:
  - PostgreSQL (relationele data: users, sessions)
  - MongoDB (activities, challenges)
  - Redis (caching)
- **Maps**: OpenStreetMap + Mapbox SDK
- **Routing**: OSRM (Open Source Routing Machine)

### Project Structuur
```
makemyday/
├── backend/          # Node.js API
├── frontend/         # React Native app
├── shared/           # Gedeelde types en utilities
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose
- npm >= 9.0.0

### Installation

1. Clone de repository:
```bash
git clone <repository-url>
cd makemyday
```

2. Installeer dependencies:
```bash
npm install
```

3. Start de databases:
```bash
npm run docker:up
```

4. Start de development servers:
```bash
npm run dev
```

De backend API draait op http://localhost:3000
De Expo development server opent automatisch

### Environment Variables

Kopieer `.env.example` naar `.env` in de backend directory en pas aan:

```bash
cp backend/.env.example backend/.env
```

## 📱 Development

### Backend Development
```bash
npm run backend
```

### Frontend Development
```bash
npm run frontend
```

### Tests Uitvoeren
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

## 📚 API Documentation

API documentatie is beschikbaar op:
- Development: http://localhost:3000/api-docs
- Postman Collection: `docs/postman-collection.json`

## 🗄️ Database

### Migraties Uitvoeren
```bash
cd backend
npm run migrate
```

### Seed Data
```bash
cd backend
npm run seed
```

Dit vult de database met:
- 100+ challenges
- Test gebruikers
- Voorbeeld activiteiten

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📦 Deployment

### Docker Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## 🤝 Contributing

1. Maak een feature branch: `git checkout -b feature/amazing-feature`
2. Commit je changes: `git commit -m 'Add amazing feature'`
3. Push naar de branch: `git push origin feature/amazing-feature`
4. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 👥 Team

- Product Owner: TBD
- Lead Developer: TBD
- UI/UX Designer: TBD

## 📞 Contact

Voor vragen: info@makemyday.app
