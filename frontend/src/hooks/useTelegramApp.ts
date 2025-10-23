import { useEffect, useState } from 'react';
import { WebApp } from '@telegram-apps/sdk';

export function useTelegramApp() {
  const [telegramApp, setTelegramApp] = useState<WebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're in a Telegram Web App environment
    if (window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      
      // Initialize the app
      app.ready();
      
      // Expand the app to full height
      app.expand();
      
      setTelegramApp(app);
      setIsReady(true);
      
      console.log('📱 Telegram WebApp initialized:', {
        version: app.version,
        platform: app.platform,
        colorScheme: app.colorScheme,
        user: app.initDataUnsafe.user
      });
    } else {
      console.warn('⚠️ Telegram WebApp not available - running in development mode');
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      telegramApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      telegramApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      telegramApp?.HapticFeedback?.selectionChanged();
    }
  };

  const mainButton = {
    show: (text: string, onClick: () => void) => {
      if (telegramApp?.MainButton) {
        telegramApp.MainButton.setText(text);
        telegramApp.MainButton.onClick(onClick);
        telegramApp.MainButton.show();
      }
    },
    hide: () => {
      telegramApp?.MainButton?.hide();
    },
    setText: (text: string) => {
      telegramApp?.MainButton?.setText(text);
    }
  };

  const backButton = {
    show: (onClick: () => void) => {
      if (telegramApp?.BackButton) {
        telegramApp.BackButton.onClick(onClick);
        telegramApp.BackButton.show();
      }
    },
    hide: () => {
      telegramApp?.BackButton?.hide();
    }
  };

  return {
    telegramApp,
    isReady,
    isTelegram: !!telegramApp,
    user: telegramApp?.initDataUnsafe?.user,
    theme: telegramApp?.themeParams,
    colorScheme: telegramApp?.colorScheme || 'light',
    hapticFeedback,
    mainButton,
    backButton
  };
}
