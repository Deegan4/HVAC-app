import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export default function GlassCard({ 
  children, 
  style, 
  intensity = 80,
  tint = 'light' 
}: GlassCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webGlassCard, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.glassCard, style]}>
      <View style={styles.glassOverlay}>
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
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
});
