export const LightColors = {
  primary: '#0066CC',
  primaryDark: '#004499',
  primaryLight: '#3385D6',
  secondary: '#00A651',
  accent: '#FF6B35',
  accentLight: '#FFE5DB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    light: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  status: {
    scheduled: '#3B82F6',
    inProgress: '#F59E0B',
    completed: '#10B981',
    cancelled: '#EF4444',
    emergency: '#DC2626',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const DarkColors = {
  primary: '#3B9AFF',
  primaryDark: '#2E7ECC',
  primaryLight: '#64B5FF',
  secondary: '#2DD881',
  accent: '#FF8A5B',
  accentLight: '#3D3329',
  background: '#0F0F0F',
  surface: '#1C1C1E',
  white: '#1C1C1E',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    light: '#71717A',
    inverse: '#1A1A1A',
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
  border: '#2C2C2E',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export let Colors = LightColors;

export function updateColors(mode: 'light' | 'dark') {
  Colors = mode === 'dark' ? DarkColors : LightColors;
}