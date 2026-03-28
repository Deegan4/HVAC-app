import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
}

export default function GlassHeader({ title, subtitle, leftAction, rightAction }: GlassHeaderProps) {
  const insets = useSafeAreaInsets();

  const renderContent = () => (
    <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          {leftAction && (
            <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
              <View>{leftAction.icon}</View>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        
        <View style={styles.rightSection}>
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
              <View>{rightAction.icon}</View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        {renderContent()}
      </View>
    );
  }

  return (
    <BlurView intensity={90} tint="light" style={styles.container}>
      <View style={styles.overlay}>
        {renderContent()}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  webContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
