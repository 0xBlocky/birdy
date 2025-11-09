import { useCallback } from 'react';
import { telegramService } from '../services/telegram';

export function useHapticFeedback() {
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    telegramService.hapticFeedback(style);
  }, []);

  const notification = useCallback((type: 'error' | 'success' | 'warning') => {
    telegramService.hapticNotification(type);
  }, []);

  const selection = useCallback(() => {
    telegramService.hapticSelection();
  }, []);

  return {
    impact,
    notification,
    selection
  };
}
