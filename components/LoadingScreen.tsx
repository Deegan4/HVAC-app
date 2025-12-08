import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/theme-store';
import { Wrench } from 'lucide-react-native';

interface LoadingScreenProps {
  message?: string;
  size?: number;
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  size = 64 
}: LoadingScreenProps) {
  const { colors } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const dots = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 3,
        duration: 1500,
        useNativeDriver: false,
      })
    );

    spin.start();
    pulse.start();
    dots.start();

    return () => {
      spin.stop();
      pulse.stop();
      dots.stop();
    };
  }, [spinAnim, pulseAnim, dotsAnim]);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.primary + '15',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconInner,
            {
              backgroundColor: colors.primary + '25',
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <Wrench size={size} color={colors.primary} />
        </Animated.View>
      </Animated.View>

      <Text style={[styles.appName, { color: colors.text.primary }]}>HANDYHERO</Text>
      <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
      
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                opacity: dotsAnim.interpolate({
                  inputRange: [i, i + 0.5, i + 1],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});