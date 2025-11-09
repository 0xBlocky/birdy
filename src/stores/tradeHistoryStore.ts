import { create } from 'zustand';
import { Trade } from '../types';
import { TON_USD_RATE } from '../utils/constants';

interface TradeHistoryState {
  trades: Trade[];
  isLoading: boolean;

  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  loadMockTrades: () => void;
  setLoading: (loading: boolean) => void;
  getFilteredTrades: (filter: 'all' | 'buy' | 'sell') => Trade[];
}

export const useTradeHistoryStore = create<TradeHistoryState>((set, get) => ({
  trades: [],
  isLoading: false,

  setTrades: (trades) => set({ trades, isLoading: false }),

  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades]
  })),

  loadMockTrades: () => {
    const now = Date.now();
    const mockTrades: Trade[] = [
      {
        id: '1',
        tokenId: 'tonk',
        token: {
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
          priceHistory: []
        },
        type: 'buy',
        amount: 50000,
        price: 0.0002,
        totalValue: 10,
        timestamp: now - 86400000 * 3, // 3 days ago
        slippage: 1,
        txHash: '0x123...'
      },
      {
        id: '2',
        tokenId: 'memefi',
        token: {
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
          priceHistory: []
        },
        type: 'buy',
        amount: 100000,
        price: 0.00025,
        totalValue: 25,
        timestamp: now - 86400000 * 5, // 5 days ago
        slippage: 1,
        txHash: '0x456...'
      },
      {
        id: '3',
        tokenId: 'rocket',
        token: {
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
          priceHistory: []
        },
        type: 'sell',
        amount: 20000,
        price: 0.095,
        totalValue: 19,
        timestamp: now - 86400000 * 2, // 2 days ago
        realizedPnL: 2.5 * TON_USD_RATE,
        slippage: 1,
        txHash: '0x789...'
      },
      {
        id: '4',
        tokenId: 'scale',
        token: {
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
          priceHistory: []
        },
        type: 'buy',
        amount: 150,
        price: 0.4,
        totalValue: 60,
        timestamp: now - 86400000 * 7, // 7 days ago
        slippage: 1,
        txHash: '0xabc...'
      },
      {
        id: '5',
        tokenId: 'pepe',
        token: {
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
          priceHistory: []
        },
        type: 'buy',
        amount: 75000,
        price: 0.0003,
        totalValue: 22.5,
        timestamp: now - 86400000 * 4, // 4 days ago
        slippage: 1,
        txHash: '0xdef...'
      },
      {
        id: '6',
        tokenId: 'pepe',
        token: {
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
          priceHistory: []
        },
        type: 'sell',
        amount: 75000,
        price: 0.00065,
        totalValue: 48.75,
        timestamp: now - 3600000, // 1 hour ago
        realizedPnL: (48.75 - 22.5) * TON_USD_RATE,
        slippage: 1,
        txHash: '0xghi...'
      }
    ];

    set({ trades: mockTrades, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getFilteredTrades: (filter) => {
    const { trades } = get();
    if (filter === 'all') return trades;
    return trades.filter(trade => trade.type === filter);
  },
}));
