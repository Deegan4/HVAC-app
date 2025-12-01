import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { LightColors, DarkColors, updateColors } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof LightColors;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const queryClient = useQueryClient();

  const themeQuery = useQuery({
    queryKey: ['theme'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('theme');
      return (stored as ThemeMode) || 'light';
    },
  });

  const themeMutation = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem('theme', mode);
      return mode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] });
    },
  });
  const { mutateAsync: mutateTheme } = themeMutation;

  const mode = useMemo(() => {
    const currentMode = themeQuery.data ?? 'light';
    updateColors(currentMode);
    return currentMode;
  }, [themeQuery.data]);
  const colors = useMemo(() => mode === 'dark' ? DarkColors : LightColors, [mode]);

  const setTheme = useCallback(async (newMode: ThemeMode) => {
    await mutateTheme(newMode);
  }, [mutateTheme]);

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    await setTheme(newMode);
  }, [mode, setTheme]);

  return useMemo(() => ({
    mode,
    colors,
    toggleTheme,
    setTheme,
  }), [mode, colors, toggleTheme, setTheme]);
});
