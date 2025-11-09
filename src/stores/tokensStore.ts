import { create } from 'zustand';
import { Token } from '../types';
import { MOCK_TOKENS } from '../utils/constants';

interface TokensState {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;

  setTokens: (tokens: Token[]) => void;
  updateTokenPrice: (tokenId: string, price: number, change1h: number, change24h: number) => void;
  loadMockTokens: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getTokenById: (id: string) => Token | undefined;
}

export const useTokensStore = create<TokensState>((set, get) => ({
  tokens: [],
  isLoading: false,
  error: null,

  setTokens: (tokens) => set({ tokens, isLoading: false, error: null }),

  updateTokenPrice: (tokenId, price, change1h, change24h) => set((state) => ({
    tokens: state.tokens.map(token =>
      token.id === tokenId
        ? { ...token, currentPrice: price, change1h, change24h }
        : token
    )
  })),

  loadMockTokens: () => set({
    tokens: MOCK_TOKENS,
    isLoading: false,
    error: null
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  getTokenById: (id) => get().tokens.find(token => token.id === id),
}));
