export const LightColors = {
  primary: '#0A3D6B',
  primaryDark: '#072B4D',
  primaryLight: '#1565A0',
  secondary: '#1B8A5A',
  accent: '#D4853B',
  accentLight: '#F5E6D3',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#2E86C1',
  text: {
    primary: '#1A1A2E',
    secondary: '#5A6478',
    tertiary: '#8E99A8',
    light: '#8E99A8',
    inverse: '#FFFFFF',
  },
  status: {
    scheduled: '#2E86C1',
    inProgress: '#E67E22',
    completed: '#10B981',
    cancelled: '#EF4444',
    emergency: '#C0392B',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  border: '#D1D9E6',
  shadow: 'rgba(10, 61, 107, 0.1)',
};

export const DarkColors = {
  primary: '#4DA6E8',
  primaryDark: '#2E86C1',
  primaryLight: '#7EC8F0',
  secondary: '#2DD881',
  accent: '#E8A868',
  accentLight: '#3D3329',
  background: '#0D1117',
  surface: '#161B22',
  white: '#161B22',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  text: {
    primary: '#E6EDF3',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    light: '#6E7681',
    inverse: '#1A1A2E',
  },
  status: {
    scheduled: '#60A5FA',
    inProgress: '#FBBF24',
    completed: '#34D399',
    cancelled: '#F87171',
    emergency: '#EF4444',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
  },
  border: '#30363D',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export let Colors = LightColors;

export function updateColors(mode: 'light' | 'dark') {
  Colors = mode === 'dark' ? DarkColors : LightColors;
}