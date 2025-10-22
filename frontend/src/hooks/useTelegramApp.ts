import { useEffect, useState } from 'react';

interface TelegramApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramApp;
    };
  }
}

export function useTelegramApp() {
  const [telegramApp, setTelegramApp] = useState<TelegramApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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
