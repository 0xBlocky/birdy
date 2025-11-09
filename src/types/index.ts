// User types
export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

// Token types
export interface Token {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  currentPrice: number; // in TON
  change1h: number; // percentage
  change24h: number; // percentage
  volume24h: number; // in TON
  marketCap?: number; // in TON
  high24h: number; // in TON
  low24h: number; // in TON
  priceHistory: PricePoint[]; // for charts
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

// Portfolio types
export interface Position {
  tokenId: string;
  token: Token;
  quantity: number;
  entryPrice: number; // in TON
  currentValue: number; // in TON
  unrealizedPnL: number; // in USD
  unrealizedPnLPercentage: number;
}

export interface PortfolioSummary {
  totalValue: number; // in TON
  totalPnL: number; // in USD
  totalPnLPercentage: number;
  positionsCount: number;
}

// Trade types
export type TradeType = 'buy' | 'sell';

export interface Trade {
  id: string;
  tokenId: string;
  token: Token;
  type: TradeType;
  amount: number; // quantity of tokens
  price: number; // price in TON
  totalValue: number; // in TON
  timestamp: number;
  realizedPnL?: number; // in USD, only for sells
  slippage: number; // percentage
  txHash?: string;
}

export interface TradeRequest {
  userId: number;
  walletAddress: string;
  tokenId: string;
  amount: number; // in TON for buy, in token quantity for sell
  type: TradeType;
  slippage: number;
}

// UI State types
export type TabType = 'opportunities' | 'portfolio';

export interface Modal {
  tokenDetail: boolean;
  tradeHistory: boolean;
  walletConnect: boolean;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GetTokensResponse {
  tokens: Token[];
}

export interface GetPositionsResponse {
  positions: Position[];
  summary: PortfolioSummary;
}

export interface GetTradeHistoryResponse {
  trades: Trade[];
}

export interface ExecuteTradeResponse {
  trade: Trade;
  newPosition?: Position;
}

// WebSocket message types
export interface WSPriceUpdate {
  type: 'price_update';
  tokenId: string;
  price: number;
  change1h: number;
  change24h: number;
  timestamp: number;
}

export interface WSMessage {
  type: string;
  data: any;
}

// Theme types
export interface TelegramTheme {
  bgColor: string;
  textColor: string;
  hintColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
}
