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
  MessageCircle,
  Link2,
  FileUp,
  CreditCard,
} from 'lucide-react-native';
import { useAppStore } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { router } from 'expo-router';
import { useTranslation } from '@/constants/translations';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MoreScreen() {
  const { technicians, currentTechnicianId, logout, userRole, profileUpdateTrigger, getUnreadCount, language, canAccess } = useAppStore();
  const { colors, mode, toggleTheme } = useTheme();
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
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(mode === 'dark');
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

  useEffect(() => {
    setDarkModeEnabled(mode === 'dark');
  }, [mode]);

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkModeEnabled(value);
    await toggleTheme();
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      t.logoutConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.logout, style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
        }}
      ]
    );
  };

  const menuSections = [
    {
      title: t.communication,
      items: canAccess('canAccessMessaging') ? [
        { icon: MessageCircle, label: t.teamMessages, onPress: () => router.push('/messaging'), badge: unreadCount },
      ] : []
    },
    {
      title: t.business,
      items: [
        { icon: Building, label: t.companyInfo, onPress: () => router.push('/company-info') },
        ...(canAccess('canManageTeam') ? [{ icon: Users, label: t.teamManagement, onPress: () => router.push('/team-management') }] : []),
        ...(canAccess('canViewPricing') ? [{ icon: DollarSign, label: t.priceBook, onPress: () => router.push('/price-book') }] : []),
        ...(canAccess('canImportExport') ? [{ icon: FileUp, label: 'Import Apple Notes', onPress: () => router.push('/import-notes') }] : []),
        ...(userRole === 'owner' ? [{ icon: Shield, label: 'Technician Permissions', onPress: () => router.push('/technician-permissions') }] : []),
        ...(userRole === 'owner' ? [{ icon: Link2, label: t.quickbooksIntegration, onPress: () => router.push('/quickbooks-integration') }] : []),
        ...(canAccess('canViewReports') ? [{ icon: BarChart3, label: t.reportsAnalytics, onPress: () => router.push('/reports-analytics') }] : []),
        ...(userRole === 'owner' ? [{ icon: Wrench, label: t.serviceSettings, onPress: () => router.push('/service-settings') }] : []),
      ]
    },
    {
      title: t.technician,
      items: userRole === 'technician' ? [
        { icon: MapPin, label: t.locationStatus, onPress: () => router.push('/technician-location') },
      ] : []
    },
    {
      title: t.account,
      items: [
        { icon: User, label: userRole === 'owner' ? t.ownerProfile : t.profile, onPress: () => router.push('/profile') },
        { icon: Bell, label: t.notifications, hasSwitch: true, switchType: 'notifications' as const },
        { icon: Shield, label: t.privacySecurity, onPress: () => router.push('/privacy-security') },
        ...(userRole === 'owner' ? [{ icon: CreditCard, label: 'Subscription Plans', onPress: () => router.push('/subscription-plans') }] : []),
      ]
    },
    {
      title: 'Appearance',
      items: [
        { icon: Bell, label: 'Dark Mode', hasSwitch: true, switchType: 'darkMode' as const },
      ]
    },
    {
      title: t.support,
      items: [
        ...(userRole === 'owner' ? [{ icon: Phone, label: t.aiAnsweringService, onPress: () => router.push('/ai-answering-service') }] : []),
        { icon: HelpCircle, label: t.helpCenter, onPress: () => router.push('/help-center') },
        { icon: FileText, label: t.termsConditions, onPress: () => router.push('/terms-conditions') },
      ]
    },
    {
      title: t.developer,
      items: [
        { icon: Bug, label: t.debugTools, onPress: () => router.push('/debug') },
      ]
    }
  ].filter(section => section.items.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.text.inverse} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text.primary }]}>
              {profileData?.name || currentTech?.name || (userRole === 'owner' ? 'Owner' : '')}
            </Text>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              {userRole === 'owner' ? 'Owner/Manager' : 'Service Technician'}
            </Text>
            {(profileData?.email || currentTech?.email) && (
              <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>
                {profileData?.email || currentTech?.email}
              </Text>
            )}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    { borderBottomColor: colors.border },
                    itemIndex === section.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={'onPress' in item ? item.onPress : undefined}
                  disabled={'hasSwitch' in item && item.hasSwitch}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon size={20} color={colors.text.secondary} />
                    <Text style={[styles.menuItemLabel, { color: colors.text.primary }]}>{item.label}</Text>
                    {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.badgeText, { color: colors.text.inverse }]}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  {'hasSwitch' in item && item.hasSwitch ? (
                    <Switch
                      value={'switchType' in item && item.switchType === 'darkMode' ? darkModeEnabled : notificationsEnabled}
                      onValueChange={'switchType' in item && item.switchType === 'darkMode' ? handleDarkModeToggle : setNotificationsEnabled}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={('switchType' in item && item.switchType === 'darkMode' ? darkModeEnabled : notificationsEnabled) ? colors.primary : '#f4f3f4'}
                    />
                  ) : (
                    <ChevronRight size={20} color={colors.text.light} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.status.emergency }]} onPress={handleLogout}>
          <LogOut size={20} color={colors.status.emergency} />
          <Text style={[styles.logoutText, { color: colors.status.emergency }]}>{t.logout}</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.text.light }]}>
          {t.appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  },
  profileRole: {
    fontSize: 14,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 32,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  badge: {
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
  },
});