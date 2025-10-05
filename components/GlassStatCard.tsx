import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';

interface GlassStatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function GlassStatCard({ 
  value, 
  label, 
  icon, 
  color = Colors.primary,
  trend 
}: GlassStatCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.content}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <View>{icon}</View>
            </View>
          )}
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Text style={[
                styles.trendText,
                { color: trend.isPositive ? Colors.success : Colors.error }
              ]}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <BlurView intensity={70} tint="light" style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <View>{icon}</View>
            </View>
          )}
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Text style={[
                styles.trendText,
                { color: trend.isPositive ? Colors.success : Colors.error }
              ]}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </Text>
            </View>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 120,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  label: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  trendContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  webContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minHeight: 120,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
});
