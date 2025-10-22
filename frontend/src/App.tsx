import React from 'react';
import { OpportunityList } from './components/OpportunityList';
import { TONWalletConnect } from './components/TONWalletConnect';
import { useTradingStream } from './hooks/useTradingStream';
import { useTelegramApp } from './hooks/useTelegramApp';
import { TradingOpportunity } from 'shared';

function App() {
  const { opportunities, connectionStatus, error, reconnect } = useTradingStream();
  const { isTelegram, user, theme, hapticFeedback } = useTelegramApp();

  const handleOpportunityClick = (opportunity: TradingOpportunity) => {
    hapticFeedback.selection();
    console.log('Opportunity clicked:', opportunity);
    // TODO: In phase 2, this will open a trading modal
  };

  const handleRefresh = async () => {
    hapticFeedback.impact('light');
    await reconnect();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-telegram-bg border-b border-telegram-secondary-bg">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Birdy</h1>
              <p className="text-sm text-telegram-hint">Crypto Trading Opportunities</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </div>
                {isTelegram && user && (
                  <div className="text-xs text-telegram-hint">
                    {user.first_name}
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-full bg-telegram-button text-telegram-button-text hover:opacity-80 transition-opacity"
                disabled={connectionStatus === 'connecting'}
              >
                <svg 
                  className={`w-5 h-5 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-red-800">Connection Error</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pb-20">
        {/* TON Wallet Connect (Phase 2 preparation) */}
        <div className="px-4 pt-4">
          <TONWalletConnect />
        </div>
        
        <OpportunityList
          opportunities={opportunities}
          onOpportunityClick={handleOpportunityClick}
          height={window.innerHeight - 300}
        />
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-telegram-bg border-t border-telegram-secondary-bg p-4">
        <div className="text-center text-sm text-telegram-hint">
          {isTelegram ? (
            <div>
              Powered by TON blockchain • Phase 1: Read-only
            </div>
          ) : (
            <div>
              Development Mode • Connect to Telegram for full experience
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
