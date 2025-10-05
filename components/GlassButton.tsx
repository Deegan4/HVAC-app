import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

export default function GlassButton({ 
  title, 
  onPress, 
  icon,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium'
}: GlassButtonProps) {
  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 20 },
    large: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const variantColors = {
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
  };

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[
          styles.webButton,
          sizeStyles[size],
          { backgroundColor: `${variantColors[variant]}CC` },
          style
        ]}
      >
        {icon && <View style={styles.iconContainer}><View>{icon}</View></View>}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonWrapper, style]}>
      <BlurView intensity={60} tint="light" style={[styles.button, sizeStyles[size]]}>
        <View style={[styles.buttonOverlay, { backgroundColor: `${variantColors[variant]}99` }]}>
          {icon && <View style={styles.iconContainer}><View>{icon}</View></View>}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    marginRight: 4,
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
