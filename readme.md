# Birdy - Crypto Trading Opportunities Mini App

## Overview

A blazing fast Telegram Mini App that displays real-time cryptocurrency trading opportunities using binary RPC streaming with Protocol Buffers. Built for mobile-first experience with TON blockchain integration.

## Architecture

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express + WebSocket
- **Protocol**: Binary RPC with Protocol Buffers over WebSocket
- **Data Source**: Redis (pub/sub for opportunities)
- **Telegram**: @telegram-apps/sdk + @tonconnect/ui-react
- **Deployment**: Frontend (Vercel), Backend (Railway/Render)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Redis (via Docker)

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Redis**
   ```bash
   docker-compose up -d
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Start mock data publisher** (in another terminal)
   ```bash
   cd scripts && npm install && npm start
   ```

5. **Open the app**
   - Frontend: http://localhost:3000
   - Backend: ws://localhost:3001
   - Redis Commander: http://localhost:8081

## Project Structure

```
birdy/
├── frontend/          # React + Vite app
├── backend/           # Node.js + Express API
├── shared/            # Shared TypeScript types + protobuf schemas
├── scripts/           # Mock data publisher
├── docker-compose.yml # Local Redis for development
└── package.json       # Root workspace config
```

## Features

### Phase 1 (Current)
- ✅ Real-time trading opportunities display
- ✅ Binary RPC streaming protocol
- ✅ Mobile-optimized responsive design
- ✅ Telegram Mini App integration
- ✅ TON wallet connection UI (prepared for Phase 2)
- ✅ Virtual scrolling for performance
- ✅ Connection status and error handling

### Phase 2 (Future)
- 🔄 Buy/sell execution
- 🔄 Smart contract integration
- 🔄 User authentication/sessions
- 🔄 Trading history and analytics
- 🔄 Premium features and monetization

## API Documentation

### WebSocket Binary RPC Protocol

**Connection**: `ws://localhost:3001`

**Message Format**:
```typescript
interface BinaryRPCMessage {
  version: number;
  messageType: MessageType;
  requestId: number;
  payload: Uint8Array;
}
```

**Stream Subscription**:
```typescript
// Subscribe to trading opportunities
const subscription = {
  streamType: StreamType.TRADING_OPPORTUNITIES,
  filters: {
    minProfitPotential: 0.5,
    maxSlippage: 2.0,
    tokens: ['TON', 'USDT'],
    dexNames: ['STON.fi', 'DeDust']
  }
};
```

**Trading Opportunity**:
```typescript
interface TradingOpportunity {
  id: string;
  timestamp: number;
  tokenIn: string;
  tokenOut: string;
  currentPrice: number;
  targetPrice: number;
  profitPotential: number;
  confidence: number;
  metadata: string;
  slippageTolerance: number;
  dexName: string;
}
```

## Redis Integration

### Publishing Opportunities

Publish trading opportunities to Redis channel:

```bash
# Using Redis CLI
redis-cli PUBLISH trading_opportunities '{"id":"opp_1","tokenIn":"TON","tokenOut":"USDT","currentPrice":2.5,"targetPrice":2.6,"profitPotential":4.0,"confidence":85,"dexName":"STON.fi"}'
```

### Mock Publisher

Use the included mock publisher for testing:

```bash
cd scripts
npm install
npm start
```

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Deploy

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set build command: `cd backend && npm run build`
3. Set start command: `cd backend && npm start`
4. Set environment variables:
   - `REDIS_URL`
   - `REDIS_CHANNEL`
   - `PORT`

### Environment Variables

**Backend**:
- `REDIS_URL` - Redis connection string
- `REDIS_CHANNEL` - Channel name for opportunities
- `PORT` - WebSocket server port

## Development

### Adding New Features

1. Update Protocol Buffers schemas in `shared/proto/`
2. Regenerate TypeScript bindings: `npm run proto:generate`
3. Update shared types in `shared/src/types/`
4. Implement backend logic in `backend/src/services/`
5. Implement frontend components in `frontend/src/components/`

### Testing

```bash
# Run all tests
npm test

# Run specific package tests
npm run test:frontend
npm run test:backend
npm run test:shared
```

## Performance Optimizations

- **Binary Protocol**: 50-70% smaller payloads vs JSON
- **Virtual Scrolling**: Handles 1000+ opportunities smoothly
- **Connection Pooling**: Efficient WebSocket management
- **Caching**: Redis for data persistence
- **Mobile-First**: Optimized for touch interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details