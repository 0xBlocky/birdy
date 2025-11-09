import { TelegramUser, TelegramTheme } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        expand: () => void;
        close: () => void;
        ready: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

class TelegramService {
  private webApp = window.Telegram?.WebApp;

  /**
   * Initialize Telegram Mini App
   */
  init(): void {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
      this.webApp.enableClosingConfirmation();
    }
  }

  /**
   * Get Telegram user data
   */
  getUser(): TelegramUser | null {
    if (!this.webApp?.initDataUnsafe?.user) {
      // Return mock user for development
      return {
        id: 123456789,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        photoUrl: '',
        languageCode: 'en'
      };
    }

    const user = this.webApp.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      languageCode: user.language_code
    };
  }

  /**
   * Get Telegram theme colors
   */
  getTheme(): TelegramTheme {
    const params = this.webApp?.themeParams || {};
    return {
      bgColor: params.bg_color || '#ffffff',
      textColor: params.text_color || '#000000',
      hintColor: params.hint_color || '#999999',
      buttonColor: params.button_color || '#3390ec',
      buttonTextColor: params.button_text_color || '#ffffff',
      secondaryBgColor: params.secondary_bg_color || '#f4f4f5'
    };
  }

  /**
   * Get color scheme
   */
  getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  /**
   * Trigger haptic feedback
   */
  hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): void {
    this.webApp?.HapticFeedback?.impactOccurred(style);
  }

  /**
   * Trigger notification haptic
   */
  hapticNotification(type: 'error' | 'success' | 'warning'): void {
    this.webApp?.HapticFeedback?.notificationOccurred(type);
  }

  /**
   * Trigger selection haptic
   */
  hapticSelection(): void {
    this.webApp?.HapticFeedback?.selectionChanged();
  }

  /**
   * Close Mini App
   */
  close(): void {
    this.webApp?.close();
  }

  /**
   * Check if running in Telegram
   */
  isInTelegram(): boolean {
    return !!this.webApp;
  }
}

export const telegramService = new TelegramService();
