import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Save, Shield, Users, FileText, DollarSign, Settings, MessageCircle } from 'lucide-react-native';
import { useAppStore } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { TechnicianPermissions } from '@/types';
import { useTranslation } from '@/constants/translations';

export default function TechnicianPermissionsScreen() {
  const { technicianPermissions, updateTechnicianPermissions, language } = useAppStore();
  const { colors } = useTheme();
  const t = useTranslation(language);
  const [permissions, setPermissions] = useState<TechnicianPermissions>(technicianPermissions);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof TechnicianPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateTechnicianPermissions(permissions);
      Alert.alert('Success', 'Crew permissions updated successfully');
      setHasChanges(false);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update permissions');
    }
  };

  const permissionSections = [
    {
      title: 'Customer Management',
      icon: Users,
      items: [
        { key: 'canViewCustomers' as keyof TechnicianPermissions, label: 'View Customers', description: 'Access customer list and details' },
        { key: 'canAddEditCustomers' as keyof TechnicianPermissions, label: 'Add/Edit Customers', description: 'Create and modify customer information' },
        { key: 'canDeleteCustomers' as keyof TechnicianPermissions, label: 'Delete Customers', description: 'Remove customers from the system' },
      ],
    },
    {
      title: 'Invoice Management',
      icon: FileText,
      items: [
        { key: 'canViewInvoices' as keyof TechnicianPermissions, label: 'View Invoices', description: 'Access invoice list and details' },
        { key: 'canCreateInvoices' as keyof TechnicianPermissions, label: 'Create Invoices', description: 'Generate new invoices' },
        { key: 'canEditInvoices' as keyof TechnicianPermissions, label: 'Edit Invoices', description: 'Modify existing invoices' },
        { key: 'canDeleteInvoices' as keyof TechnicianPermissions, label: 'Delete Invoices', description: 'Remove invoices from the system' },
      ],
    },
    {
      title: 'Job Management',
      icon: Settings,
      items: [
        { key: 'canViewAllJobs' as keyof TechnicianPermissions, label: 'View All Projects', description: 'See all scheduled projects, not just assigned ones' },
        { key: 'canEditAllJobs' as keyof TechnicianPermissions, label: 'Edit All Projects', description: 'Modify any project details' },
      ],
    },
    {
      title: 'Business Operations',
      icon: DollarSign,
      items: [
        { key: 'canViewReports' as keyof TechnicianPermissions, label: 'View Reports', description: 'Access business reports and analytics' },
        { key: 'canManageTeam' as keyof TechnicianPermissions, label: 'Manage Team', description: 'Add, edit, or remove team members' },
        { key: 'canViewPricing' as keyof TechnicianPermissions, label: 'View Pricing', description: 'Access price book and rates' },
        { key: 'canEditPricing' as keyof TechnicianPermissions, label: 'Edit Pricing', description: 'Modify prices and rates' },
      ],
    },
    {
      title: 'Communication & Data',
      icon: MessageCircle,
      items: [
        { key: 'canAccessMessaging' as keyof TechnicianPermissions, label: 'Team Messaging', description: 'Send and receive team messages' },
        { key: 'canImportExport' as keyof TechnicianPermissions, label: 'Import/Export', description: 'Import data from notes or export data' },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Crew Permissions',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text.primary,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges}
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
            >
              <Save size={20} color={hasChanges ? colors.primary : colors.text.light} />
              <Text style={[styles.saveButtonText, { color: hasChanges ? colors.primary : colors.text.light }]}>
                {t.save}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Shield size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Control Crew Access</Text>
          <Text style={[styles.headerDescription, { color: colors.text.secondary }]}>
            Configure what features and data crew members can access. These permissions apply to all crew member accounts.
          </Text>
        </View>

        {permissionSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <section.icon size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{section.title}</Text>
            </View>

            <View style={[styles.permissionsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.permissionItem,
                    { borderBottomColor: colors.border },
                    itemIndex === section.items.length - 1 && styles.lastPermissionItem,
                  ]}
                >
                  <View style={styles.permissionInfo}>
                    <Text style={[styles.permissionLabel, { color: colors.text.primary }]}>{item.label}</Text>
                    <Text style={[styles.permissionDescription, { color: colors.text.secondary }]}>{item.description}</Text>
                  </View>
                  <Switch
                    value={permissions[item.key]}
                    onValueChange={() => handleToggle(item.key)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={permissions[item.key] ? colors.primary : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={[styles.infoBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Shield size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Owners always have full access to all features. These permissions only affect crew member accounts.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  permissionsList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lastPermissionItem: {
    borderBottomWidth: 0,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 16,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
