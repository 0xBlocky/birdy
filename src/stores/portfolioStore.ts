import { create } from 'zustand';
import { Position, PortfolioSummary } from '../types';
import { TON_USD_RATE } from '../utils/constants';

interface PortfolioState {
  positions: Position[];
  summary: PortfolioSummary;
  isLoading: boolean;

  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (tokenId: string, updates: Partial<Position>) => void;
  removePosition: (tokenId: string) => void;
  calculateSummary: () => void;
  loadMockPositions: () => void;
  setLoading: (loading: boolean) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  positions: [],
  summary: {
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    positionsCount: 0
  },
  isLoading: false,

  setPositions: (positions) => {
    set({ positions });
    get().calculateSummary();
  },

  addPosition: (position) => {
    set((state) => ({ positions: [...state.positions, position] }));
    get().calculateSummary();
  },

  updatePosition: (tokenId, updates) => {
    set((state) => ({
      positions: state.positions.map(pos =>
        pos.tokenId === tokenId ? { ...pos, ...updates } : pos
      )
    }));
    get().calculateSummary();
  },

  removePosition: (tokenId) => {
    set((state) => ({
      positions: state.positions.filter(pos => pos.tokenId !== tokenId)
    }));
    get().calculateSummary();
  },

  calculateSummary: () => {
    const { positions } = get();
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalInvested = positions.reduce((sum, pos) => sum + (pos.entryPrice * pos.quantity), 0);
    const totalPnLPercentage = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    set({
      summary: {
        totalValue,
        totalPnL,
        totalPnLPercentage,
        positionsCount: positions.length
      }
    });
  },

  loadMockPositions: () => {
    // Mock positions using tokens from tokensStore
    const mockPositions: Position[] = [
      {
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
        quantity: 50000,
        entryPrice: 0.0002,
        currentValue: 12.25,
        unrealizedPnL: (12.25 - 10) * TON_USD_RATE,
        unrealizedPnLPercentage: 22.5
      },
      {
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
        quantity: 100000,
        entryPrice: 0.00025,
        currentValue: 34,
        unrealizedPnL: (34 - 25) * TON_USD_RATE,
        unrealizedPnLPercentage: 36
      },
      {
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
        quantity: 150,
        entryPrice: 0.4,
        currentValue: 85.05,
        unrealizedPnL: (85.05 - 60) * TON_USD_RATE,
        unrealizedPnLPercentage: 41.75
      }
    ];

    set({ positions: mockPositions });
    get().calculateSummary();
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
