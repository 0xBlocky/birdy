// TypeScript interfaces matching protobuf schemas

// ============================================================================
// LEGACY: Trading Opportunity (Phase 1 - Read-only)
// ============================================================================
export interface TradingOpportunity {
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

// ============================================================================
// NEW: Token (Phase 2 - Trading)
// ============================================================================
export interface Token {
  // Core identification
  id: string;                          // e.g., "STON"
  symbol: string;                      // e.g., "STON"
  name: string;                        // e.g., "STON.fi Token"
  contractAddress: string;             // TON blockchain address
  decimals: number;                    // Token decimals (usually 9 for TON tokens)

  // Pricing (real-time)
  currentPriceUSD: number;            // Current price in USD
  currentPriceTON: number;            // Current price in TON
  priceChange24h: number;             // % change in 24h

  // Market data
  volume24h: number;                  // 24h trading volume in USD
  marketCap: number;                  // Market capitalization in USD
  liquidity: number;                  // Available liquidity in USD

  // DEX info
  dexName: string;                    // "STON.fi" or "DeDust"
  pairAddress: string;                // DEX pair contract address

  // Metadata
  logoUrl?: string;                   // Token logo URL
  lastUpdated: number;                // Timestamp of last price update
}

// ============================================================================
// NEW: User Position (Track Holdings)
// ============================================================================
export interface UserPosition {
  id: string;                         // Position ID (userId_tokenId)
  userId: string;                     // User's wallet address
  tokenId: string;                    // References Token.id

  // Position details
  amountHeld: number;                 // Amount of tokens held
  averageEntryPriceTON: number;       // Average buy price in TON
  averageEntryPriceUSD: number;       // Average buy price in USD
  totalInvestedTON: number;           // Total TON invested
  totalInvestedUSD: number;           // Total USD invested (at time of purchase)

  // P&L calculations (computed in real-time)
  currentValueTON: number;            // Current value in TON
  currentValueUSD: number;            // Current value in USD
  unrealizedPnLTON: number;           // Profit/Loss in TON
  unrealizedPnLUSD: number;           // Profit/Loss in USD
  unrealizedPnLPercent: number;       // % gain/loss

  // Tracking
  firstPurchaseAt: number;            // Timestamp of first buy
  lastTransactionAt: number;          // Timestamp of last trade
  transactionCount: number;           // Number of trades
}

// ============================================================================
// NEW: Trade Transaction (Trade History)
// ============================================================================
export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export interface TradeTransaction {
  id: string;                         // Transaction ID
  userId: string;                     // User's wallet address
  tokenId: string;                    // Token traded

  // Transaction details
  type: TradeType;                    // Trade type
  amountToken: number;                // Amount of tokens
  amountTON: number;                  // Amount of TON spent/received
  pricePerTokenTON: number;           // Price per token in TON
  pricePerTokenUSD: number;           // Price per token in USD

  // Fees & slippage
  slippage: number;                   // Actual slippage %
  feeTON: number;                     // Transaction fee in TON

  // On-chain data
  txHash: string;                     // Blockchain transaction hash
  status: TransactionStatus;          // Transaction status
  blockNumber?: number;               // Block number

  // DEX info
  dexName: string;                    // Which DEX was used

  // Timestamps
  createdAt: number;                  // When trade was initiated
  confirmedAt?: number;               // When trade was confirmed on-chain
}

// ============================================================================
// NEW: Enhanced Opportunity Row (UI State)
// ============================================================================
export interface OpportunityRow {
  token: Token;                       // Token info + real-time price
  position?: UserPosition;            // User's position (if they own the token)
  isConnected: boolean;               // Wallet connection status

  // UI state
  isTrading: boolean;                 // Currently executing trade
  lastTransaction?: TradeTransaction; // Most recent trade
  errorMessage?: string;              // Trading error message
}

// ============================================================================
// Stream & RPC Types
// ============================================================================
export interface StreamFilters {
  minProfitPotential?: number;
  maxSlippage?: number;
  tokens?: string[];
  dexNames?: string[];
}

export interface StreamSubscription {
  streamType: StreamType;
  filters?: StreamFilters;
}

export enum MessageType {
  REQUEST = 0,
  RESPONSE = 1,
  STREAM = 2
}

export enum StreamType {
  TRADING_OPPORTUNITIES = 1,
  PRICE_UPDATES = 2,
  ORDER_STATUS = 3,
  BALANCE_UPDATES = 4
}

export interface BinaryRPCMessage {
  version: number;
  messageType: MessageType;
  requestId: number;
  payload: Uint8Array;
}

export interface StreamData {
  streamId: string;
  streamType: StreamType;
  opportunities?: TradingOpportunity[];  // Legacy
  tokens?: Token[];                      // New: for PRICE_UPDATES
  positions?: UserPosition[];            // New: for BALANCE_UPDATES
  transactions?: TradeTransaction[];     // New: for ORDER_STATUS
}

export interface ErrorResponse {
  code: number;
  message: string;
}
