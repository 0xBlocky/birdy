# Testing the Price Feed Integration

## What Was Implemented

### 1. Data Structures (Phase 2 - Trading)

**New TypeScript Interfaces** (`shared/src/types/trading.ts`):
- `Token` - Real-time token data with prices, market cap, volume, liquidity
- `UserPosition` - Track user holdings and P&L calculations
- `TradeTransaction` - Trade history with on-chain data
- `OpportunityRow` - Enhanced UI state combining token + position

**New Protobuf Messages** (`shared/proto/Token.proto`):
- `Token`, `UserPosition`, `TradeTransaction` messages
- `TradeType` and `TransactionStatus` enums

**Token Constants** (`shared/src/constants/tokens.ts`):
- `TRADEABLE_TOKENS` - Whitelist of 6 TON tokens (STON, DOGS, NOT, HMSTR, SCALE, USDT)
- `TRADING_CONFIG` - Configuration for trading (amounts, slippage, intervals)
- `TON_NATIVE` - Native TON token metadata

### 2. Backend Services

**DEXScreenerClient** (`backend/src/services/DEXScreenerClient.ts`):
- Fetches real-time token prices from DEXScreener API
- Maps DEXScreener data to our Token interface
- Supports fetching by address or all tradeable tokens
- Rate limited to 300 requests/minute (API limit)

**PriceUpdateService** (`backend/src/services/PriceUpdateService.ts`):
- Polls DEXScreener every 30 seconds for price updates
- Caches token prices in Redis (5-minute expiration)
- Broadcasts price updates via WebSocket
- Emits 'priceUpdate' events with token array
- Supports force refresh and status queries

**Updated BinaryRPCService** (`backend/src/services/BinaryRPCService.ts`):
- Added `sendPriceUpdates()` for PRICE_UPDATES stream
- Added `sendPositionUpdates()` for BALANCE_UPDATES stream
- Added `sendTransactionUpdates()` for ORDER_STATUS stream

**Updated OpportunityStreamManager** (`backend/src/services/OpportunityStreamManager.ts`):
- Added `broadcastPriceUpdates()` method
- Filters tokens by client subscription preferences
- Broadcasts to all clients subscribed to PRICE_UPDATES stream

### 3. Server Integration

**Updated server.ts** (`backend/src/server.ts`):
- Integrated PriceUpdateService into server lifecycle
- Added `/api/prices` endpoint - Get all cached token prices
- Added `/api/prices/refresh` endpoint - Force refresh prices
- Updated `/health` endpoint to include price service status
- Graceful shutdown stops price polling

---

## Testing Instructions

### Prerequisites

1. **Start Redis**:
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies** (if not done already):
   ```bash
   npm install
   ```

3. **Build Packages**:
   ```bash
   npm run build
   ```

### Test 1: DEXScreener API Integration

Test the DEXScreener client directly:

```bash
cd backend
npx tsx src/test-dexscreener.ts
```

**Expected Output**:
```
🧪 Testing DEXScreener API Integration

1️⃣ Testing API health check...
   ✅ API is healthy

2️⃣ Fetching all tradeable tokens...
   ✅ Fetched 6 tokens

📊 Token Prices:

   🟢 STON (STON.fi Token)
      Price: $0.012345 (0.004321 TON)
      24h Change: +5.23%
      Volume 24h: $1,234,567
      Liquidity: $2,345,678
      DEX: STON.fi
      Last Updated: 10:30:45 AM

   🔴 DOGS (DOGS Token)
      Price: $0.000123 (0.000043 TON)
      24h Change: -2.15%
      Volume 24h: $567,890
      Liquidity: $1,234,567
      DEX: STON.fi
      Last Updated: 10:30:45 AM

   ... (more tokens)

3️⃣ Fetching single token (STON)...
   ✅ STON price: $0.012345
   Market Cap: $12,345,678

✅ All tests completed!
```

### Test 2: Backend Server with Price Feed

Start the backend server:

```bash
cd backend
npm run dev
```

**Expected Console Output**:
```
🚀 Server running on port 3001
✅ Redis connected
🚀 Starting price update service (interval: 30000ms)
✅ DEXScreener API health check passed
📊 Fetching token prices...
✅ Fetched prices for 6 tokens
  STON: $0.012345 (+5.23%)
  DOGS: $0.000123 (-2.15%)
  NOT: $0.001234 (+3.45%)
💾 Cached 6 tokens in Redis
✅ Services initialized
✅ Price update service started
```

Every 30 seconds, you should see:
```
📊 Fetching token prices...
✅ Fetched prices for 6 tokens
  STON: $0.012346 (+5.24%)
  DOGS: $0.000124 (-2.10%)
  NOT: $0.001235 (+3.50%)
💾 Cached 6 tokens in Redis
```

### Test 3: HTTP Endpoints

While the server is running, test the HTTP endpoints:

**Health Check**:
```bash
curl http://localhost:3001/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T14:30:45.123Z",
  "connections": 0,
  "priceService": {
    "isPolling": true,
    "lastFetchTime": 1729692645123,
    "timeSinceLastFetch": 5432
  }
}
```

**Get Cached Prices**:
```bash
curl http://localhost:3001/api/prices
```

**Expected Response**:
```json
{
  "tokens": [
    {
      "id": "STON",
      "symbol": "STON",
      "name": "STON.fi Token",
      "contractAddress": "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO",
      "decimals": 9,
      "currentPriceUSD": 0.012345,
      "currentPriceTON": 0.004321,
      "priceChange24h": 5.23,
      "volume24h": 1234567,
      "marketCap": 12345678,
      "liquidity": 2345678,
      "dexName": "STON.fi",
      "pairAddress": "EQD8TJ8xEWB1SpnRE4d4iwBaWcyk7E0GRlEd8Eu1K1meJkCb",
      "logoUrl": "https://...",
      "lastUpdated": 1729692645123
    },
    // ... more tokens
  ],
  "count": 6
}
```

**Force Refresh Prices**:
```bash
curl -X POST http://localhost:3001/api/prices/refresh
```

**Expected Response**:
```json
{
  "success": true,
  "tokens": [ /* array of tokens */ ],
  "count": 6
}
```

### Test 4: WebSocket Price Streaming

Use a WebSocket client to test price streaming. Here's a simple Node.js test:

```javascript
// test-websocket.js
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to server');

  // Subscribe to price updates
  const subscription = {
    streamType: 2, // PRICE_UPDATES
    filters: {
      tokens: ['STON', 'DOGS'] // Optional: filter specific tokens
    }
  };

  // Send subscription request (Binary RPC format)
  const payload = new TextEncoder().encode(JSON.stringify(subscription));
  ws.send(payload);
});

ws.on('message', (data) => {
  // Decode binary RPC message
  const message = JSON.parse(data.toString());
  console.log('📊 Received:', message);

  if (message.tokens) {
    console.log(`💰 Price update for ${message.tokens.length} tokens`);
    message.tokens.forEach(token => {
      console.log(`  ${token.symbol}: $${token.currentPriceUSD.toFixed(6)} (${token.priceChange24h >= 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%)`);
    });
  }
});

ws.on('close', () => {
  console.log('🔌 Disconnected');
});
```

Run with:
```bash
node test-websocket.js
```

**Expected Output**:
```
✅ Connected to server
📡 Client subscribed to stream stream_1_1729692645123
📊 Received: { streamId: 'stream_1_1729692645123', streamType: 2, tokens: [...] }
💰 Price update for 2 tokens
  STON: $0.012345 (+5.23%)
  DOGS: $0.000123 (-2.15%)

[30 seconds later]
📊 Received: { streamId: 'stream_1_1729692645123', streamType: 2, tokens: [...] }
💰 Price update for 2 tokens
  STON: $0.012346 (+5.24%)
  DOGS: $0.000124 (-2.10%)
```

---

## Verification Checklist

- [ ] DEXScreener API health check passes
- [ ] Backend server starts without errors
- [ ] Price updates fetch successfully every 30 seconds
- [ ] Prices are cached in Redis
- [ ] `/health` endpoint returns price service status
- [ ] `/api/prices` endpoint returns cached tokens
- [ ] `/api/prices/refresh` forces a price refresh
- [ ] WebSocket clients can subscribe to PRICE_UPDATES
- [ ] Price updates are broadcast to subscribed clients
- [ ] Server shuts down gracefully (stops price polling)

---

## Troubleshooting

### Issue: DEXScreener API returns 403 Forbidden

**Cause**: Network restrictions or proxy blocking external APIs.

**Solution**:
- Ensure your network allows HTTPS requests to `api.dexscreener.com`
- Try running from a different network or disable proxy settings
- DEXScreener may rate limit or block certain IPs - try again later

### Issue: Redis connection failed

**Cause**: Redis is not running.

**Solution**:
```bash
docker-compose up -d
# Or start Redis manually:
redis-server
```

### Issue: No price updates after 30 seconds

**Cause**: DEXScreener API may be down or rate limiting.

**Solution**:
- Check server logs for errors
- Try force refresh: `curl -X POST http://localhost:3001/api/prices/refresh`
- Verify DEXScreener API status: https://status.dexscreener.com

### Issue: Prices are stale (not updating)

**Cause**: Price service may have stopped due to repeated errors.

**Solution**:
- Restart the backend server
- Check Redis connectivity
- Verify DEXScreener API is accessible

---

## Next Steps

Now that the data structures and price feed are working:

1. **Update Frontend Stores** - Add stores for tokens and positions
2. **Implement TON Wallet Integration** - Add `useTonWallet` hook
3. **Update UI Components** - Transform OpportunityCard to TokenCard
4. **Add Buy/Sell Buttons** - Implement trading UI
5. **Integrate STON.fi SDK** - Add swap transaction building
6. **Add Position Tracking** - Store and display user positions
7. **Add Transaction Monitoring** - Track on-chain confirmations

See the main analysis document for the full implementation roadmap.
