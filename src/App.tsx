import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { OpportunitiesTab } from './components/tabs/OpportunitiesTab';
import { PortfolioTab } from './components/tabs/PortfolioTab';
import { TokenDetailModal } from './components/TokenDetailModal';
import { TradeHistoryModal } from './components/TradeHistoryModal';
import { WalletButton } from './components/WalletButton';
import { useUIStore } from './stores/uiStore';
import { useUserStore } from './stores/userStore';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import { telegramService } from './services/telegram';

function App() {
  const activeTab = useUIStore(state => state.activeTab);
  const setUser = useUserStore(state => state.setUser);

  // Initialize Telegram theme
  useTelegramTheme();

  useEffect(() => {
    // Initialize Telegram Mini App
    telegramService.init();

    // Get Telegram user
    const user = telegramService.getUser();
    if (user) {
      setUser(user);
    }
  }, [setUser]);

  return (
    <div className="min-h-screen bg-tg-bg">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: 'var(--tg-theme-bg-color)',
            color: 'var(--tg-theme-text-color)',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#F44336',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <Header />

      {/* Tab Bar */}
      <TabBar />

      {/* Tab Content */}
      <main className="relative">
        {activeTab === 'opportunities' && <OpportunitiesTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
      </main>

      {/* Wallet Connection Button */}
      <WalletButton />

      {/* Modals */}
      <TokenDetailModal />
      <TradeHistoryModal />
    </div>
  );
}

export default App;
