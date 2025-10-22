# Development Commands

## Setup
```bash
# Install all dependencies
npm install

# Start Redis
docker-compose up -d

# Build shared package
cd shared && npm run build
```

## Development
```bash
# Start frontend + backend
npm run dev

# Start mock data publisher (separate terminal)
cd scripts && npm install && npm start
```

## Testing
```bash
# Run all tests
npm test

# Run specific tests
npm run test:frontend
npm run test:backend
npm run test:shared
```

## Building
```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
npm run build:shared
```

## Deployment
```bash
# Frontend: Deploy to Vercel
# Backend: Deploy to Railway/Render
# Redis: Use managed Redis service
```

## Environment Variables

### Backend (.env)
```
PORT=3001
REDIS_URL=redis://localhost:6379
REDIS_CHANNEL=trading_opportunities
NODE_ENV=development
```

### Frontend
- No environment variables needed for development
- Production: Set VITE_API_URL for backend URL
