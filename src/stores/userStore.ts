import { create } from 'zustand';
import { TelegramUser } from '../types';

interface UserState {
  user: TelegramUser | null;
  walletAddress: string | null;
  walletBalance: number; // in TON
  isWalletConnected: boolean;

  setUser: (user: TelegramUser) => void;
  setWalletAddress: (address: string | null) => void;
  setWalletBalance: (balance: number) => void;
  connectWallet: (address: string, balance: number) => void;
  disconnectWallet: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  walletAddress: null,
  walletBalance: 0,
  isWalletConnected: false,

  setUser: (user) => set({ user }),

  setWalletAddress: (address) => set({
    walletAddress: address,
    isWalletConnected: !!address
  }),

  setWalletBalance: (balance) => set({ walletBalance: balance }),

  connectWallet: (address, balance) => set({
    walletAddress: address,
    walletBalance: balance,
    isWalletConnected: true
  }),

  disconnectWallet: () => set({
    walletAddress: null,
    walletBalance: 0,
    isWalletConnected: false
  }),
}));
