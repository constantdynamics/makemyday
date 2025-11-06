#!/bin/bash

echo "🚀 Setting up Make My Day..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Install root dependencies
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install

# Install shared dependencies and build
echo -e "${BLUE}Setting up shared package...${NC}"
cd shared && npm install && npm run build && cd ..

# Install backend dependencies
echo -e "${BLUE}Setting up backend...${NC}"
cd backend && npm install && cd ..

# Install frontend dependencies
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend && npm install && cd ..

# Start Docker containers
echo -e "${BLUE}Starting Docker containers...${NC}"
npm run docker:up

# Wait for databases
echo -e "${BLUE}Waiting for databases to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
cd backend
psql $POSTGRES_URL -f src/database/schema.sql 2>/dev/null || echo "Postgres schema already applied"
cd ..

# Seed database
echo -e "${BLUE}Seeding database with challenges...${NC}"
cd backend && npm run seed && cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}Run 'npm run dev' to start the application${NC}"
