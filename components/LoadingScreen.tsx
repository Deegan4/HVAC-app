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
      <View style={styles.logoContainer}>
        <SpinningSnowflake size={size} color={Colors.primary} duration={1500} />
        <View style={styles.logoTextContainer}>
          <Text style={styles.companyName}>OLIVA</Text>
          <Text style={styles.companySubtitle}>REFRIGERATION</Text>
          <Text style={styles.tagline}>24/7</Text>
        </View>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTextContainer: {
    marginLeft: 16,
    alignItems: 'flex-start' as const,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#E53E3E',
    letterSpacing: 1,
  },
  companySubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2D3748',
    letterSpacing: 2,
    marginTop: -2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#718096',
    marginTop: 2,
  },
  message: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#4A5568',
    textAlign: 'center' as const,
  },
});