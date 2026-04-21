import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/theme-store';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 80,
}: GlassCardProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.webGlassCard,
        isDark && styles.webGlassCardDark,
        style,
      ]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={[
      styles.glassCard,
      isDark && styles.glassCardDark,
      style,
    ]}>
      <View style={[styles.glassOverlay, isDark && styles.glassOverlayDark]}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassCardDark: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassOverlayDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  webGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  webGlassCardDark: {
    backgroundColor: 'rgba(30, 35, 45, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
  },
});
