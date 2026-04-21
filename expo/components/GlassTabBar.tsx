import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/theme-store';

interface GlassTabBarProps {
  tabs: {
    key: string;
    label: string;
    icon: React.ReactNode;
  }[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export default function GlassTabBar({ tabs, activeTab, onTabPress }: GlassTabBarProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, isDark && styles.webContainerDark]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.webTab,
              activeTab === tab.key && (isDark ? styles.webTabActiveDark : styles.webTabActive),
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <View style={styles.tabIcon}><View>{tab.icon}</View></View>
            <Text style={[
              styles.tabLabel,
              { color: colors.text.secondary },
              activeTab === tab.key && { color: colors.primary },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={[
      styles.container,
      isDark && styles.containerDark,
    ]}>
      <View style={[styles.overlay, isDark && styles.overlayDark]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && (isDark ? styles.tabActiveDark : styles.tabActive),
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <View style={styles.tabIcon}><View>{tab.icon}</View></View>
            <Text style={[
              styles.tabLabel,
              { color: colors.text.secondary },
              activeTab === tab.key && { color: colors.primary },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  containerDark: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  overlay: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlayDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabActiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabIcon: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  webContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  webContainerDark: {
    backgroundColor: 'rgba(30, 35, 45, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
  },
  webTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  webTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  webTabActiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
