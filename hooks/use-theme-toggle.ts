import { useCallback } from 'react';
import { Appearance, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeToggle() {
  const colorScheme = useColorScheme() ?? 'light';

  const toggleTheme = useCallback(() => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';

    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(next);
      return;
    }

    // Fallback for platforms that do not support Appearance.setColorScheme.
    if (__DEV__) {
      console.warn(
        `Theme toggle is not supported on ${Platform.OS} in this environment.`
      );
    }
  }, [colorScheme]);

  return {
    colorScheme,
    toggleTheme,
  };
}


