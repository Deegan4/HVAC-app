import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';

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
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.webTab,
              activeTab === tab.key && styles.webTabActive,
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <View style={styles.tabIcon}><View>{tab.icon}</View></View>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <BlurView intensity={90} tint="light" style={styles.container}>
      <View style={styles.overlay}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <View style={styles.tabIcon}><View>{tab.icon}</View></View>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
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
  overlay: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  tabIcon: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.primary,
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
});
