import React from 'react';
import { TonConnect } from '@tonconnect/sdk';

interface TONWalletConnectProps {
  onConnect?: (wallet: any) => void;
  onDisconnect?: () => void;
}

export function TONWalletConnect({ onConnect, onDisconnect }: TONWalletConnectProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [wallet, setWallet] = React.useState<any>(null);

  const tonConnect = React.useMemo(() => {
    return new TonConnect({
      manifestUrl: '/tonconnect-manifest.json'
    });
  }, []);

  React.useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      const connectedWallets = await tonConnect.getConnectedWallets();
      if (connectedWallets.length > 0) {
        setWallet(connectedWallets[0]);
        setIsConnected(true);
        onConnect?.(connectedWallets[0]);
      }
    };

    checkConnection();

    // Listen for connection events
    const unsubscribe = tonConnect.onStatusChange((wallet) => {
      if (wallet) {
        setWallet(wallet);
        setIsConnected(true);
        onConnect?.(wallet);
      } else {
        setWallet(null);
        setIsConnected(false);
        onDisconnect?.();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnect, onConnect, onDisconnect]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      const wallets = await tonConnect.getWallets();
      if (wallets.length > 0) {
        await tonConnect.connect(wallets[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnect.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isConnected && wallet) {
    return (
      <div className="bg-telegram-secondary-bg rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-telegram-text">
              Wallet Connected
            </div>
            <div className="text-sm text-telegram-hint">
              {wallet.name}
            </div>
            <div className="text-xs text-telegram-hint font-mono">
              {wallet.account?.address?.slice(0, 8)}...{wallet.account?.address?.slice(-8)}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-telegram-secondary-bg rounded-lg p-4 mb-4">
      <div className="text-center">
        <div className="text-4xl mb-2">🔗</div>
        <div className="font-medium text-telegram-text mb-2">
          Connect TON Wallet
        </div>
        <div className="text-sm text-telegram-hint mb-4">
          Connect your TON wallet to enable trading features (Phase 2)
        </div>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-2 bg-telegram-button text-telegram-button-text rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
}
