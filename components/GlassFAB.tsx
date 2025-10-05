import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';

interface GlassFABProps {
  icon: React.ReactNode;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  color?: string;
}

export default function GlassFAB({ 
  icon, 
  onPress, 
  position = 'bottom-right',
  color = Colors.primary 
}: GlassFABProps) {
  const positionStyles = {
    'bottom-right': { right: 16, bottom: 100 },
    'bottom-center': { alignSelf: 'center' as const, bottom: 100 },
    'bottom-left': { left: 16, bottom: 100 },
  };

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[
          styles.webFab,
          positionStyles[position],
          { backgroundColor: `${color}DD` }
        ]}
      >
        <View><View>{icon}</View></View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.fabWrapper, positionStyles[position]]}
    >
      <BlurView intensity={80} tint="light" style={styles.fab}>
        <View style={[styles.fabOverlay, { backgroundColor: `${color}CC` }]}>
          <View><View>{icon}</View></View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  fabOverlay: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});
