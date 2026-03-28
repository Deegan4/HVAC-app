import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/hooks/app-store';
// import * as LocalAuthentication from 'expo-local-authentication';

export default function PrivacySecurityScreen() {
  const { customers, jobs, invoices, technicians } = useAppStore();
  const [settings, setSettings] = useState({
    biometricAuth: true,
    autoLock: true,
    dataEncryption: true,
    locationTracking: true,
    crashReporting: false,
    analytics: false,
    autoLockTimeout: 5, // minutes
  });

  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  // Load settings and check biometric support
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Check biometric support (simulated for now)
      setBiometricSupported(Platform.OS !== 'web');
      setBiometricType(Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint');
    } catch (error) {
      console.log('Error loading privacy settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
      console.log('Error saving privacy settings:', error);
    }
  };

  const handleChangePin = () => {
    Alert.alert(
      'Change PIN',
      'To change your PIN, you will need to verify your current PIN first.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // In a real app, this would navigate to PIN change screen
            Alert.alert('PIN Change', 'PIN change functionality would be implemented here.');
          }
        }
      ]
    );
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricSupported) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Your device does not support biometric authentication or no biometrics are enrolled.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (enabled) {
      // Simulate biometric authentication
      Alert.alert(
        'Enable Biometric Authentication',
        `Would you like to enable ${biometricType} authentication?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              await saveSettings({ ...settings, biometricAuth: true });
              Alert.alert('Success', `${biometricType} authentication enabled.`);
            }
          }
        ]
      );
    } else {
      await saveSettings({ ...settings, biometricAuth: false });
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset App Data',
      'This will permanently delete all local data including jobs, customers, invoices, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Clear all app data
              const keys = [
                'customers', 'jobs', 'invoices', 'technicians', 'equipment',
                'serviceSettings', 'privacySettings', 'companyInfo', 'userPin'
              ];
              
              await AsyncStorage.multiRemove(keys);
              Alert.alert('Data Reset', 'All app data has been permanently deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data.');
              console.log('Error resetting data:', error);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        customers,
        jobs,
        invoices,
        technicians,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };
      
      const jsonData = JSON.stringify(exportData, null, 2);
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oliva-refrigeration-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        // For mobile, use Share API
        await Share.share({
          message: jsonData,
          title: 'Oliva Refrigeration Data Export',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
      console.log('Error exporting data:', error);
    }
  };

  const SecurityItem = ({ icon: Icon, title, description, hasSwitch = false, switchValue, onSwitchChange, onPress, status }: {
    icon: any;
    title: string;
    description: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
    status?: 'secure' | 'warning' | 'info';
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'secure': return Colors.status.completed;
        case 'warning': return Colors.status.emergency;
        case 'info': return Colors.primary;
        default: return Colors.text.secondary;
      }
    };

    return (
      <TouchableOpacity
        style={styles.securityItem}
        onPress={onPress}
        disabled={hasSwitch}
      >
        <View style={styles.securityItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}20` }]}>
            <Icon size={20} color={getStatusColor()} />
          </View>
          <View style={styles.securityItemContent}>
            <Text style={styles.securityItemTitle}>{title}</Text>
            <Text style={styles.securityItemDescription}>{description}</Text>
          </View>
        </View>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
          />
        ) : (
          status && (
            <View style={styles.statusIndicator}>
              {status === 'secure' && <CheckCircle size={16} color={Colors.status.completed} />}
              {status === 'warning' && <AlertTriangle size={16} color={Colors.status.emergency} />}
            </View>
          )
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Privacy & Security',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Security Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Shield size={24} color={Colors.status.completed} />
              <Text style={styles.statusTitle}>Your account is secure</Text>
            </View>
            <Text style={styles.statusDescription}>
              All security features are enabled and your data is protected.
            </Text>
          </View>
        </View>

        {/* Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.sectionContent}>
            <SecurityItem
              icon={Key}
              title="Change PIN"
              description="Update your 4-digit security PIN"
              onPress={handleChangePin}
              status="info"
            />
            <SecurityItem
              icon={Smartphone}
              title={`${biometricType} Authentication`}
              description={biometricSupported ? `Use ${biometricType.toLowerCase()} to unlock the app` : 'Not available on this device'}
              hasSwitch
              switchValue={settings.biometricAuth && biometricSupported}
              onSwitchChange={handleBiometricToggle}
            />
            <SecurityItem
              icon={Lock}
              title="Auto-Lock"
              description={`Lock app after ${settings.autoLockTimeout} minutes of inactivity`}
              hasSwitch
              switchValue={settings.autoLock}
              onSwitchChange={(value) => saveSettings({ ...settings, autoLock: value })}
            />
          </View>
        </View>

        {/* Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection</Text>
          <View style={styles.sectionContent}>
            <SecurityItem
              icon={Shield}
              title="Data Encryption"
              description="Encrypt sensitive data on device"
              hasSwitch
              switchValue={settings.dataEncryption}
              onSwitchChange={(value) => saveSettings({ ...settings, dataEncryption: value })}
            />
            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => setShowSensitiveData(!showSensitiveData)}
            >
              <View style={styles.securityItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${Colors.text.secondary}20` }]}>
                  {showSensitiveData ? (
                    <EyeOff size={20} color={Colors.text.secondary} />
                  ) : (
                    <Eye size={20} color={Colors.text.secondary} />
                  )}
                </View>
                <View style={styles.securityItemContent}>
                  <Text style={styles.securityItemTitle}>
                    {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
                  </Text>
                  <Text style={styles.securityItemDescription}>
                    {showSensitiveData ? 'Hide customer and financial information' : 'Display customer and financial information'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.sectionContent}>
            <SecurityItem
              icon={Shield}
              title="Location Tracking"
              description="Allow location tracking for job routing and technician dispatch"
              hasSwitch
              switchValue={settings.locationTracking}
              onSwitchChange={(value) => saveSettings({ ...settings, locationTracking: value })}
            />
            <SecurityItem
              icon={AlertTriangle}
              title="Crash Reporting"
              description="Send crash reports to improve app stability"
              hasSwitch
              switchValue={settings.crashReporting}
              onSwitchChange={(value) => saveSettings({ ...settings, crashReporting: value })}
            />
            <SecurityItem
              icon={Shield}
              title="Analytics"
              description="Share anonymous usage data to improve the app"
              hasSwitch
              switchValue={settings.analytics}
              onSwitchChange={(value) => saveSettings({ ...settings, analytics: value })}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.sectionContent}>
            <SecurityItem
              icon={Download}
              title="Export Data"
              description={`Export ${customers.length} customers, ${jobs.length} jobs, and ${invoices.length} invoices`}
              onPress={handleExportData}
              status="info"
            />
            <SecurityItem
              icon={Trash2}
              title="Reset App Data"
              description="Permanently delete all local data and settings"
              onPress={handleResetData}
              status="warning"
            />
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.status.completed} />
              <Text style={styles.tipText}>Use a unique PIN that&apos;s not easily guessed (avoid 1234, 0000)</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.status.completed} />
              <Text style={styles.tipText}>Enable {biometricType.toLowerCase()} authentication for faster, secure access</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.status.completed} />
              <Text style={styles.tipText}>Regularly export your data as a backup</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.status.completed} />
              <Text style={styles.tipText}>Keep location tracking enabled for accurate job routing</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle size={16} color={Colors.status.completed} />
              <Text style={styles.tipText}>Log out when using shared or public devices</Text>
            </View>
          </View>
        </View>
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
  statusCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityItemContent: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  securityItemDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});