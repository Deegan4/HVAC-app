import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';

interface LoadingScreenProps {
  message?: string;
  size?: number;
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  size = 64 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <SpinningSnowflake size={size} color={Colors.primary} duration={1500} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.brandText}>OLIVA REFRIGERATION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginTop: 24,
    textAlign: 'center' as const,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginTop: 8,
    letterSpacing: 1,
    textAlign: 'center' as const,
  },
});