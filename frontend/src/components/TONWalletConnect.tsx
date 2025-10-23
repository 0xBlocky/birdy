import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';

interface TONWalletConnectProps {
  onConnect?: (wallet: any) => void;
  onDisconnect?: () => void;
}

export function TONWalletConnect({ onConnect, onDisconnect }: TONWalletConnectProps) {
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
        <TonConnectButton />
      </div>
    </div>
  );
}
