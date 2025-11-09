import { Wallet } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { tonService } from '../services/ton';
import { formatTON, truncateAddress } from '../utils/formatters';

export function WalletButton() {
  const { isWalletConnected, walletAddress, walletBalance, connectWallet, disconnectWallet } = useUserStore();
  const { impact, notification } = useHapticFeedback();

  const handleConnect = async () => {
    impact('medium');
    try {
      const wallet = await tonService.connectWallet();
      if (wallet) {
        connectWallet(wallet.address, wallet.balance);
        notification('success');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      notification('error');
    }
  };

  const handleDisconnect = async () => {
    impact('light');
    try {
      await tonService.disconnectWallet();
      disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isWalletConnected && walletAddress) {
    return (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-2 px-4 py-2 bg-tg-secondary-bg rounded-xl btn-press"
      >
        <Wallet className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-tg-hint">
            {truncateAddress(walletAddress)}
          </span>
          <span className="text-sm font-medium text-tg-text">
            {formatTON(walletBalance)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-6 py-3 bg-tg-button text-tg-button-text rounded-xl font-medium shadow-lg btn-press fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
}
