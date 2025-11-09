import { useEffect, useState } from 'react';
import { telegramService } from '../services/telegram';
import { TelegramTheme } from '../types';

export function useTelegramTheme() {
  const [theme] = useState<TelegramTheme>(telegramService.getTheme());
  const [colorScheme] = useState<'light' | 'dark'>(telegramService.getColorScheme());

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--tg-theme-bg-color', theme.bgColor);
    root.style.setProperty('--tg-theme-text-color', theme.textColor);
    root.style.setProperty('--tg-theme-hint-color', theme.hintColor);
    root.style.setProperty('--tg-theme-button-color', theme.buttonColor);
    root.style.setProperty('--tg-theme-button-text-color', theme.buttonTextColor);
    root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondaryBgColor);

    // Set color scheme class on body
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(colorScheme);
  }, [theme, colorScheme]);

  return { theme, colorScheme };
}
