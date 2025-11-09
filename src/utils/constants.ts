import { Token } from '../types';

// Trading constants
export const PRESET_BUY_AMOUNTS = [10, 50, 100]; // in TON
export const PRESET_SELL_PERCENTAGES = [25, 50, 75, 100];
export const SLIPPAGE_OPTIONS = [0.5, 1, 2]; // percentages
export const DEFAULT_SLIPPAGE = 1;

// Mock TON to USD rate (for demo purposes)
export const TON_USD_RATE = 2.5;

// WebSocket reconnect settings
export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RETRIES = 5;

// API endpoint
export const API_ENDPOINT = '/api';
export const WS_ENDPOINT = '/ws';

// UI constants
export const PULL_TO_REFRESH_THRESHOLD = 80;
export const PRICE_UPDATE_DEBOUNCE = 1000; // ms

// Mock token data for development
export const MOCK_TOKENS: Token[] = [
  {
    id: 'tonk',
    name: 'TONK Inu',
    ticker: 'TONK',
    logo: '',
    currentPrice: 0.000245,
    change1h: 12.5,
    change24h: 45.8,
    volume24h: 125000,
    marketCap: 5000000,
    high24h: 0.000267,
    low24h: 0.000198,
    priceHistory: generateMockPriceHistory(0.000245, 24)
  },
  {
    id: 'dedust',
    name: 'DeDust Coin',
    ticker: 'DD',
    logo: '',
    currentPrice: 0.0156,
    change1h: -3.2,
    change24h: 8.4,
    volume24h: 89000,
    marketCap: 3500000,
    high24h: 0.0165,
    low24h: 0.0142,
    priceHistory: generateMockPriceHistory(0.0156, 24)
  },
  {
    id: 'jetton',
    name: 'JettonSwap',
    ticker: 'JET',
    logo: '',
    currentPrice: 1.234,
    change1h: 5.7,
    change24h: -12.3,
    volume24h: 234000,
    marketCap: 12000000,
    high24h: 1.456,
    low24h: 1.123,
    priceHistory: generateMockPriceHistory(1.234, 24)
  },
  {
    id: 'scale',
    name: 'TON Scale',
    ticker: 'SCALE',
    logo: '',
    currentPrice: 0.567,
    change1h: 18.9,
    change24h: 67.4,
    volume24h: 456000,
    marketCap: 8900000,
    high24h: 0.612,
    low24h: 0.345,
    priceHistory: generateMockPriceHistory(0.567, 24)
  },
  {
    id: 'rocket',
    name: 'Rocket TON',
    ticker: 'ROCK',
    logo: '',
    currentPrice: 0.089,
    change1h: -8.4,
    change24h: -15.7,
    volume24h: 67000,
    marketCap: 2300000,
    high24h: 0.105,
    low24h: 0.082,
    priceHistory: generateMockPriceHistory(0.089, 24)
  },
  {
    id: 'memefi',
    name: 'MemeFi',
    ticker: 'MEME',
    logo: '',
    currentPrice: 0.00034,
    change1h: 25.6,
    change24h: 89.2,
    volume24h: 789000,
    marketCap: 15000000,
    high24h: 0.00041,
    low24h: 0.00018,
    priceHistory: generateMockPriceHistory(0.00034, 24)
  },
  {
    id: 'toncoin',
    name: 'Mini TON',
    ticker: 'mTON',
    logo: '',
    currentPrice: 2.456,
    change1h: 2.1,
    change24h: 5.6,
    volume24h: 567000,
    marketCap: 45000000,
    high24h: 2.567,
    low24h: 2.301,
    priceHistory: generateMockPriceHistory(2.456, 24)
  },
  {
    id: 'ston',
    name: 'STON Token',
    ticker: 'STON',
    logo: '',
    currentPrice: 0.789,
    change1h: -2.3,
    change24h: 12.8,
    volume24h: 345000,
    marketCap: 23000000,
    high24h: 0.845,
    low24h: 0.698,
    priceHistory: generateMockPriceHistory(0.789, 24)
  },
  {
    id: 'pepe',
    name: 'TON Pepe',
    ticker: 'TPEPE',
    logo: '',
    currentPrice: 0.00067,
    change1h: 45.2,
    change24h: 123.7,
    volume24h: 890000,
    marketCap: 34000000,
    high24h: 0.00089,
    low24h: 0.00031,
    priceHistory: generateMockPriceHistory(0.00067, 24)
  },
  {
    id: 'doge',
    name: 'TON Doge',
    ticker: 'TDOGE',
    logo: '',
    currentPrice: 0.0012,
    change1h: -5.6,
    change24h: -8.9,
    volume24h: 123000,
    marketCap: 6700000,
    high24h: 0.0014,
    low24h: 0.0011,
    priceHistory: generateMockPriceHistory(0.0012, 24)
  },
  {
    id: 'shib',
    name: 'TON Shiba',
    ticker: 'TSHIB',
    logo: '',
    currentPrice: 0.000089,
    change1h: 8.9,
    change24h: 34.5,
    volume24h: 234000,
    marketCap: 12000000,
    high24h: 0.000095,
    low24h: 0.000067,
    priceHistory: generateMockPriceHistory(0.000089, 24)
  },
  {
    id: 'floki',
    name: 'TON Floki',
    ticker: 'TFLOKI',
    logo: '',
    currentPrice: 0.00234,
    change1h: 15.3,
    change24h: 56.8,
    volume24h: 456000,
    marketCap: 28000000,
    high24h: 0.00267,
    low24h: 0.00156,
    priceHistory: generateMockPriceHistory(0.00234, 24)
  }
];

// Helper function to generate mock price history
function generateMockPriceHistory(currentPrice: number, hours: number): { timestamp: number; price: number }[] {
  const history = [];
  const now = Date.now();
  const hourMs = 3600000;

  for (let i = hours; i >= 0; i--) {
    const timestamp = now - (i * hourMs);
    // Generate random price variation (±15%)
    const variation = (Math.random() - 0.5) * 0.3;
    const price = currentPrice * (1 + variation);
    history.push({ timestamp, price });
  }

  return history;
}

// Get badge for token based on performance
export function getTokenBadge(change24h: number): { emoji: string; text: string; color: string } | null {
  if (change24h > 20) {
    return { emoji: '🔥', text: 'Hot', color: 'bg-warning' };
  }
  if (change24h < -10) {
    return { emoji: '📉', text: 'Dip', color: 'bg-danger' };
  }
  return null;
}

// Generate color for token logo placeholder
export function getTokenColor(ticker: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500'
  ];

  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
