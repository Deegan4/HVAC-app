import React from 'react';
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
  Wrench
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { router } from 'expo-router';

export default function MoreScreen() {
  const { technicians, currentTechnicianId } = useAppStore();
  const currentTech = technicians.find(t => t.id === currentTechnicianId);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const { logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          logout();
          router.replace('/');
        }}
      ]
    );
  };

  const menuSections = [
    {
      title: 'Business',
      items: [
        { icon: Building, label: 'Company Info', onPress: () => router.push('/company-info') },
        { icon: Users, label: 'Team Management', onPress: () => router.push('/team-management') },
        { icon: BarChart3, label: 'Reports & Analytics', onPress: () => router.push('/reports-analytics') },
        { icon: Wrench, label: 'Service Settings', onPress: () => router.push('/service-settings') },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', onPress: () => router.push('/profile') },
        { icon: Bell, label: 'Notifications', hasSwitch: true },
        { icon: Shield, label: 'Privacy & Security', onPress: () => router.push('/privacy-security') },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', onPress: () => router.push('/help-center') },
        { icon: FileText, label: 'Terms & Conditions', onPress: () => router.push('/terms-conditions') },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={32} color={Colors.text.inverse} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentTech?.name || 'John Doe'}</Text>
            <Text style={styles.profileRole}>Service Technician</Text>
            <Text style={styles.profileEmail}>{currentTech?.email || 'john@olivarefrigeration.com'}</Text>
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
                  disabled={item.hasSwitch}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon size={20} color={Colors.text.secondary} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  {item.hasSwitch ? (
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
          <Text style={styles.logoutText}>Logout</Text>
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
});