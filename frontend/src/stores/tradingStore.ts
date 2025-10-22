import { create } from 'zustand';
import { TradingOpportunity } from 'shared';

interface TradingStore {
  opportunities: TradingOpportunity[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  streamId: string | null;
  error: string | null;
  
  // Actions
  addOpportunity: (opportunity: TradingOpportunity) => void;
  updateOpportunity: (id: string, opportunity: Partial<TradingOpportunity>) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  setStreamId: (streamId: string | null) => void;
  setError: (error: string | null) => void;
  clearOpportunities: () => void;
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  opportunities: [],
  connectionStatus: 'disconnected',
  streamId: null,
  error: null,

  addOpportunity: (opportunity) => {
    set((state) => {
      // Check if opportunity already exists
      const existingIndex = state.opportunities.findIndex(opp => opp.id === opportunity.id);
      
      if (existingIndex >= 0) {
        // Update existing opportunity
        const updatedOpportunities = [...state.opportunities];
        updatedOpportunities[existingIndex] = { ...updatedOpportunities[existingIndex], ...opportunity };
        return { opportunities: updatedOpportunities };
      } else {
        // Add new opportunity at the beginning
        const newOpportunities = [opportunity, ...state.opportunities];
        // Keep only the last 100 opportunities for performance
        return { opportunities: newOpportunities.slice(0, 100) };
      }
    });
  },

  updateOpportunity: (id, updates) => {
    set((state) => ({
      opportunities: state.opportunities.map(opp => 
        opp.id === id ? { ...opp, ...updates } : opp
      )
    }));
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  setStreamId: (streamId) => {
    set({ streamId });
  },

  setError: (error) => {
    set({ error });
  },

  clearOpportunities: () => {
    set({ opportunities: [] });
  }
}));
