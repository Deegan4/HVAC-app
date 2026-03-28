import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

interface Snowflake {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  speed: number;
}

interface SnowingBackgroundProps {
  snowflakeCount?: number;
  children?: React.ReactNode;
}

function createSnowflakes(count: number, width: number, height: number): Snowflake[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-50 - Math.random() * height),
    opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
    size: Math.random() * 4 + 2,
    speed: Math.random() * 2 + 1,
  }));
}

export default function SnowingBackground({ 
  snowflakeCount = 50, 
  children 
}: SnowingBackgroundProps) {
  const { width, height } = Dimensions.get('window');
  const [snowflakes] = useState<Snowflake[]>(() => createSnowflakes(snowflakeCount, width, height));
  const animationsStarted = useRef(false);

  useEffect(() => {
    if (animationsStarted.current) return;
    animationsStarted.current = true;

    snowflakes.forEach((snowflake) => {
      snowflake.y.addListener(({ value }) => {
        if (value > height + 50) {
          snowflake.y.setValue(-50);
          snowflake.x.setValue(Math.random() * width);
        }
      });

      Animated.loop(
        Animated.timing(snowflake.y, {
          toValue: height + 50,
          duration: (height + 100) / snowflake.speed * 50,
          useNativeDriver: true,
        })
      ).start();

      const currentX = Math.random() * width;
      Animated.loop(
        Animated.sequence([
          Animated.timing(snowflake.x, {
            toValue: currentX + 20,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(snowflake.x, {
            toValue: currentX - 20,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(snowflake.opacity, {
            toValue: 0.2,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(snowflake.opacity, {
            toValue: 0.8,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => {
      snowflakes.forEach((snowflake) => {
        snowflake.x.removeAllListeners();
        snowflake.y.removeAllListeners();
        snowflake.opacity.removeAllListeners();
      });
    };
  }, [snowflakes, width, height]);

  return (
    <View style={styles.container}>
      {snowflakes.map((snowflake) => (
        <Animated.View
          key={snowflake.id}
          style={[
            styles.snowflake,
            {
              width: snowflake.size,
              height: snowflake.size,
              borderRadius: snowflake.size / 2,
              transform: [
                { translateX: snowflake.x },
                { translateY: snowflake.y },
              ],
              opacity: snowflake.opacity,
            },
          ]}
        />
      ))}
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a365d', // Dark blue winter background
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});