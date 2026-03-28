import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import { HapticFeedback } from '@/utils/HapticFeedback';

interface AnimatedButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  disabled?: boolean;
  testID?: string;
}

export default function AnimatedButton({
  onPress,
  children,
  style,
  textStyle,
  hapticType = 'light',
  disabled = false,
  testID,
}: AnimatedButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();

    switch (hapticType) {
      case 'light':
        HapticFeedback.light();
        break;
      case 'medium':
        HapticFeedback.medium();
        break;
      case 'heavy':
        HapticFeedback.heavy();
        break;
      case 'selection':
        HapticFeedback.selection();
        break;
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      testID={testID}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleValue }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
