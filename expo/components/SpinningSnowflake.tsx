import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface SpinningSnowflakeProps {
  size?: number;
  color?: string;
  duration?: number;
}

export default function SpinningSnowflake({ 
  size = 48, 
  color = Colors.primary, 
  duration = 2000 
}: SpinningSnowflakeProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(() => spin());
    };
    
    spin();
  }, [spinValue, duration]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.snowflake,
          {
            width: size,
            height: size,
            transform: [{ rotate }],
          },
        ]}
      >
        <SnowflakeIcon size={size} color={color} />
      </Animated.View>
    </View>
  );
}

function SnowflakeIcon({ size, color }: { size: number; color: string }) {
  const strokeWidth = Math.max(1, size / 24);
  const center = size / 2;
  const radius = size * 0.35;
  
  return (
    <View style={[styles.svgContainer, { width: size, height: size }]}>
      {/* Main cross lines */}
      <View style={[
        styles.line,
        {
          width: size * 0.7,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          top: center - strokeWidth / 2,
          left: center - (size * 0.7) / 2,
        }
      ]} />
      
      <View style={[
        styles.line,
        {
          width: strokeWidth,
          height: size * 0.7,
          backgroundColor: color,
          position: 'absolute',
          top: center - (size * 0.7) / 2,
          left: center - strokeWidth / 2,
        }
      ]} />
      
      {/* Diagonal lines */}
      <View style={[
        styles.line,
        {
          width: size * 0.5,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          top: center - strokeWidth / 2,
          left: center - (size * 0.5) / 2,
          transform: [{ rotate: '45deg' }],
        }
      ]} />
      
      <View style={[
        styles.line,
        {
          width: size * 0.5,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          top: center - strokeWidth / 2,
          left: center - (size * 0.5) / 2,
          transform: [{ rotate: '-45deg' }],
        }
      ]} />
      
      {/* Small decorative elements */}
      {[0, 60, 120, 180, 240, 300].map((angle, index) => {
        const radian = (angle * Math.PI) / 180;
        const x = center + Math.cos(radian) * radius - strokeWidth / 2;
        const y = center + Math.sin(radian) * radius - strokeWidth / 2;
        
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: strokeWidth * 2,
                height: strokeWidth * 2,
                backgroundColor: color,
                borderRadius: strokeWidth,
                position: 'absolute',
                left: x,
                top: y,
              }
            ]}
          />
        );
      })}
      
      {/* Center circle */}
      <View style={[
        styles.centerDot,
        {
          width: strokeWidth * 3,
          height: strokeWidth * 3,
          backgroundColor: color,
          borderRadius: strokeWidth * 1.5,
          position: 'absolute',
          left: center - (strokeWidth * 1.5),
          top: center - (strokeWidth * 1.5),
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflake: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  line: {
    borderRadius: 1,
  },
  dot: {},
  centerDot: {},
});