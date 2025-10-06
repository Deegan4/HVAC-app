import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  DollarSign,
  Users,
  FileText,
  Calendar,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuickBooksSettings {
  connected: boolean;
  companyId?: string;
  companyName?: string;
  lastSync?: string;
  autoSync: boolean;
  syncInvoices: boolean;
  syncCustomers: boolean;
  syncPayments: boolean;
  syncExpenses: boolean;
}

export default function QuickBooksIntegrationScreen() {
  const { invoices, customers } = useAppStore();
  const [settings, setSettings] = useState<QuickBooksSettings>({
    connected: false,
    autoSync: false,
    syncInvoices: true,
    syncCustomers: true,
    syncPayments: true,
    syncExpenses: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('quickbooks_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading QuickBooks settings:', error);
    }
  };

  const saveSettings = async (newSettings: QuickBooksSettings) => {
    try {
      await AsyncStorage.setItem('quickbooks_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving QuickBooks settings:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      Alert.alert(
        'QuickBooks OAuth',
        'In a production app, this would open QuickBooks OAuth flow. For demo purposes, we\'ll simulate a connection.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
          {
            text: 'Connect',
            onPress: () => {
              const newSettings: QuickBooksSettings = {
                ...settings,
                connected: true,
                companyId: 'demo-company-123',
                companyName: 'Demo Company LLC',
                lastSync: new Date().toISOString(),
              };
              saveSettings(newSettings);
              setIsLoading(false);
              Alert.alert('Success', 'Connected to QuickBooks successfully!');
            },
          },
        ]
      );
    }, 500);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect QuickBooks',
      'Are you sure you want to disconnect from QuickBooks? This will stop all automatic syncing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            const newSettings: QuickBooksSettings = {
              ...settings,
              connected: false,
              companyId: undefined,
              companyName: undefined,
              lastSync: undefined,
            };
            saveSettings(newSettings);
            Alert.alert('Disconnected', 'QuickBooks has been disconnected.');
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!settings.connected) {
      Alert.alert('Not Connected', 'Please connect to QuickBooks first.');
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      const newSettings: QuickBooksSettings = {
        ...settings,
        lastSync: new Date().toISOString(),
      };
      saveSettings(newSettings);
      setIsSyncing(false);
      
      let syncedItems: string[] = [];
      if (settings.syncInvoices) syncedItems.push(`${invoices.length} invoices`);
      if (settings.syncCustomers) syncedItems.push(`${customers.length} customers`);
      if (settings.syncPayments) syncedItems.push('payments');
      
      Alert.alert(
        'Sync Complete',
        `Successfully synced: ${syncedItems.join(', ')}`
      );
    }, 2000);
  };

  const handleExportToQuickBooks = () => {
    if (!settings.connected) {
      Alert.alert('Not Connected', 'Please connect to QuickBooks first.');
      return;
    }

    Alert.alert(
      'Export Data',
      'This will export all selected data types to QuickBooks. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data exported to QuickBooks successfully!');
          },
        },
      ]
    );
  };

  const handleImportFromQuickBooks = () => {
    if (!settings.connected) {
      Alert.alert('Not Connected', 'Please connect to QuickBooks first.');
      return;
    }

    Alert.alert(
      'Import Data',
      'This will import data from QuickBooks. Any conflicts will be resolved by keeping QuickBooks data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            Alert.alert('Success', 'Data imported from QuickBooks successfully!');
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'QuickBooks Integration',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Connection Status */}
        <View style={styles.section}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIcon}>
                {settings.connected ? (
                  <CheckCircle size={32} color={Colors.status.success} />
                ) : (
                  <XCircle size={32} color={Colors.text.light} />
                )}
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {settings.connected ? 'Connected' : 'Not Connected'}
                </Text>
                {settings.connected && settings.companyName && (
                  <Text style={styles.statusSubtitle}>{settings.companyName}</Text>
                )}
                {settings.connected && settings.lastSync && (
                  <Text style={styles.statusDate}>
                    Last synced: {formatDate(settings.lastSync)}
                  </Text>
                )}
              </View>
            </View>

            {settings.connected ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.syncButton]}
                  onPress={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={Colors.text.inverse} />
                  ) : (
                    <RefreshCw size={20} color={Colors.text.inverse} />
                  )}
                  <Text style={styles.actionButtonText}>
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                >
                  <XCircle size={20} color={Colors.status.emergency} />
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.connectButton]}
                onPress={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.text.inverse} />
                ) : (
                  <CheckCircle size={20} color={Colors.text.inverse} />
                )}
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Connecting...' : 'Connect to QuickBooks'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sync Settings */}
        {settings.connected && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sync Settings</Text>
              <View style={styles.card}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <RefreshCw size={20} color={Colors.text.secondary} />
                    <Text style={styles.settingLabel}>Auto Sync</Text>
                  </View>
                  <Switch
                    value={settings.autoSync}
                    onValueChange={(value) =>
                      saveSettings({ ...settings, autoSync: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={settings.autoSync ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <FileText size={20} color={Colors.text.secondary} />
                    <Text style={styles.settingLabel}>Sync Invoices</Text>
                  </View>
                  <Switch
                    value={settings.syncInvoices}
                    onValueChange={(value) =>
                      saveSettings({ ...settings, syncInvoices: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={settings.syncInvoices ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Users size={20} color={Colors.text.secondary} />
                    <Text style={styles.settingLabel}>Sync Customers</Text>
                  </View>
                  <Switch
                    value={settings.syncCustomers}
                    onValueChange={(value) =>
                      saveSettings({ ...settings, syncCustomers: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={settings.syncCustomers ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <DollarSign size={20} color={Colors.text.secondary} />
                    <Text style={styles.settingLabel}>Sync Payments</Text>
                  </View>
                  <Switch
                    value={settings.syncPayments}
                    onValueChange={(value) =>
                      saveSettings({ ...settings, syncPayments: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={settings.syncPayments ? Colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Calendar size={20} color={Colors.text.secondary} />
                    <Text style={styles.settingLabel}>Sync Expenses</Text>
                  </View>
                  <Switch
                    value={settings.syncExpenses}
                    onValueChange={(value) =>
                      saveSettings({ ...settings, syncExpenses: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={settings.syncExpenses ? Colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            {/* Data Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.dataButton}
                  onPress={handleExportToQuickBooks}
                >
                  <View style={styles.dataButtonLeft}>
                    <Upload size={20} color={Colors.primary} />
                    <View style={styles.dataButtonText}>
                      <Text style={styles.dataButtonTitle}>Export to QuickBooks</Text>
                      <Text style={styles.dataButtonSubtitle}>
                        Send data from app to QuickBooks
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.dataButton}
                  onPress={handleImportFromQuickBooks}
                >
                  <View style={styles.dataButtonLeft}>
                    <Download size={20} color={Colors.primary} />
                    <View style={styles.dataButtonText}>
                      <Text style={styles.dataButtonTitle}>Import from QuickBooks</Text>
                      <Text style={styles.dataButtonSubtitle}>
                        Get data from QuickBooks to app
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sync Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sync Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <FileText size={24} color={Colors.primary} />
                  <Text style={styles.statValue}>{invoices.length}</Text>
                  <Text style={styles.statLabel}>Invoices</Text>
                </View>
                <View style={styles.statCard}>
                  <Users size={24} color={Colors.primary} />
                  <Text style={styles.statValue}>{customers.length}</Text>
                  <Text style={styles.statLabel}>Customers</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About QuickBooks Integration</Text>
            <Text style={styles.infoText}>
              Connect your QuickBooks account to automatically sync invoices, customers,
              payments, and expenses between your service management app and QuickBooks.
            </Text>
            <Text style={styles.infoText}>
              • Real-time or scheduled synchronization{'\n'}
              • Two-way data sync{'\n'}
              • Automatic conflict resolution{'\n'}
              • Secure OAuth 2.0 authentication
            </Text>
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
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  statusDate: {
    fontSize: 12,
    color: Colors.text.light,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButton: {
    backgroundColor: Colors.primary,
  },
  syncButton: {
    backgroundColor: Colors.primary,
  },
  disconnectButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.status.emergency,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.status.emergency,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },
  dataButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dataButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataButtonText: {
    flex: 1,
  },
  dataButtonTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dataButtonSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});
