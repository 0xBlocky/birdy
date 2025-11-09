import { create } from 'zustand';
import { TabType, Modal } from '../types';

interface UIState {
  activeTab: TabType;
  modals: Modal;
  selectedTokenId: string | null;
  isRefreshing: boolean;

  setActiveTab: (tab: TabType) => void;
  openModal: (modalName: keyof Modal) => void;
  closeModal: (modalName: keyof Modal) => void;
  closeAllModals: () => void;
  setSelectedToken: (tokenId: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'opportunities',
  modals: {
    tokenDetail: false,
    tradeHistory: false,
    walletConnect: false
  },
  selectedTokenId: null,
  isRefreshing: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),

  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),

  closeAllModals: () => set({
    modals: {
      tokenDetail: false,
      tradeHistory: false,
      walletConnect: false
    }
  }),

  setSelectedToken: (tokenId) => set({ selectedTokenId: tokenId }),

  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
}));
