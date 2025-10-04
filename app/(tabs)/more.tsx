import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Building,
  Users,
  FileText,
  BarChart3,
  Wrench,
  Bug,
  DollarSign,
  MapPin,
  Phone,
  MessageCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { router } from 'expo-router';
import { useTranslation } from '@/constants/translations';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MoreScreen() {
  const { technicians, currentTechnicianId, logout, userRole, profileUpdateTrigger, getUnreadCount, language } = useAppStore();
  const t = useTranslation(language);
  const unreadCount = getUnreadCount();
  
  // For technician role, use the most recent technician if currentTechnicianId is not set
  // For owner role, show owner info
  const currentTech = currentTechnicianId 
    ? technicians.find(t => t.id === currentTechnicianId)
    : (userRole === 'technician' && technicians.length > 0) 
      ? technicians[technicians.length - 1] // Most recently added technician
      : null;
      
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Load profile data to get the updated name
  const loadProfileData = useCallback(async () => {
    try {
      const profileId = userRole === 'owner' ? 'owner' : currentTech?.id;
      console.log('Loading profile data for more tab, profileId:', profileId);
      const savedProfile = await AsyncStorage.getItem(`profile_${profileId}`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        console.log('Loaded profile data:', parsed);
        setProfileData(parsed);
      } else {
        console.log('No saved profile found');
        setProfileData(null);
      }
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  }, [currentTech?.id, userRole]);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Reload profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // Also reload when technicians array changes (when new technician is added)
  useEffect(() => {
    loadProfileData();
  }, [technicians.length, loadProfileData]);

  // Reload when profile update is triggered
  useEffect(() => {
    if (profileUpdateTrigger > 0) {
      console.log('Profile update detected, reloading profile data');
      loadProfileData();
    }
  }, [profileUpdateTrigger, loadProfileData]);

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      'Are you sure you want to logout?',
      [
        { text: t.cancel, style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
        }}
      ]
    );
  };

  const menuSections = [
    {
      title: 'Communication',
      items: [
        { icon: MessageCircle, label: 'Team Messages', onPress: () => router.push('/messaging'), badge: unreadCount },
      ]
    },
    {
      title: 'Business',
      items: [
        { icon: Building, label: t.companyInfo, onPress: () => router.push('/company-info') },
        { icon: Users, label: t.teamManagement, onPress: () => router.push('/team-management') },
        { icon: DollarSign, label: t.priceBook, onPress: () => router.push('/price-book') },
        { icon: BarChart3, label: t.reportsAnalytics, onPress: () => router.push('/reports-analytics') },
        { icon: Wrench, label: 'Service Settings', onPress: () => router.push('/service-settings') },
      ]
    },
    {
      title: 'Technician',
      items: userRole === 'technician' ? [
        { icon: MapPin, label: 'Location & Status', onPress: () => router.push('/technician-location') },
      ] : []
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: userRole === 'owner' ? 'Owner Profile' : t.profile, onPress: () => router.push('/profile') },
        { icon: Bell, label: 'Notifications', hasSwitch: true },
        { icon: Shield, label: t.privacySecurity, onPress: () => router.push('/privacy-security') },
      ]
    },
    {
      title: 'Support',
      items: [
        ...(userRole === 'owner' ? [{ icon: Phone, label: 'AI Answering Service', onPress: () => router.push('/ai-answering-service') }] : []),
        { icon: HelpCircle, label: t.helpCenter, onPress: () => router.push('/help-center') },
        { icon: FileText, label: t.termsConditions, onPress: () => router.push('/terms-conditions') },
      ]
    },
    {
      title: 'Developer',
      items: [
        { icon: Bug, label: 'Debug Tools', onPress: () => router.push('/debug') },
      ]
    }
  ].filter(section => section.items.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={32} color={Colors.text.inverse} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profileData?.name || currentTech?.name || (userRole === 'owner' ? 'Owner' : '')}
            </Text>
            <Text style={styles.profileRole}>
              {userRole === 'owner' ? 'Owner/Manager' : 'Service Technician'}
            </Text>
            <Text style={styles.profileEmail}>
              {profileData?.email || currentTech?.email || 'user@olivarefrigeration.com'}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={item.onPress}
                  disabled={'hasSwitch' in item && item.hasSwitch}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon size={20} color={Colors.text.secondary} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    {'badge' in item && item.badge && item.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  {'hasSwitch' in item && item.hasSwitch ? (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                      thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
                    />
                  ) : (
                    <ChevronRight size={20} color={Colors.text.light} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.emergency} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>
          Oliva Refrigeration v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 32,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.status.emergency,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.status.emergency,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 24,
    marginBottom: 40,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});