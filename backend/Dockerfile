FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Build shared types
WORKDIR /app/shared
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
