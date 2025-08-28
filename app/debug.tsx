import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Bug,
  Database,
  Trash2,
  RefreshCw,
  Info,
  AlertTriangle,
  Copy,
  Download,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

export default function DebugScreen() {
  const { jobs, customers, invoices, technicians, currentTechnicianId } = useAppStore();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [customLog, setCustomLog] = useState('');

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    console.log('DEBUG:', logEntry);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
    addDebugLog('Debug logs cleared');
  };

  const addCustomLog = () => {
    if (customLog.trim()) {
      addDebugLog(`CUSTOM: ${customLog.trim()}`);
      setCustomLog('');
    }
  };

  const copyLogsToClipboard = async () => {
    try {
      const logsText = debugLogs.join('\n');
      await Clipboard.setStringAsync(logsText);
      addDebugLog('Logs copied to clipboard');
      Alert.alert('Success', 'Debug logs copied to clipboard');
    } catch (error) {
      addDebugLog(`Error copying logs: ${error}`);
      Alert.alert('Error', 'Failed to copy logs to clipboard');
    }
  };

  const exportAppData = async () => {
    try {
      const appData = {
        jobs,
        customers,
        invoices,
        technicians,
        currentTechnicianId,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      };
      
      const dataString = JSON.stringify(appData, null, 2);
      await Clipboard.setStringAsync(dataString);
      addDebugLog('App data exported to clipboard');
      Alert.alert('Success', 'App data exported to clipboard');
    } catch (error) {
      addDebugLog(`Error exporting data: ${error}`);
      Alert.alert('Error', 'Failed to export app data');
    }
  };

  const clearAsyncStorage = () => {
    Alert.alert(
      'Clear Storage',
      'This will clear ALL app data including profiles, settings, and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              addDebugLog('AsyncStorage cleared successfully');
              Alert.alert('Success', 'All app data cleared');
            } catch (error) {
              addDebugLog(`Error clearing storage: ${error}`);
              Alert.alert('Error', 'Failed to clear storage');
            }
          }
        }
      ]
    );
  };

  const testAppState = () => {
    addDebugLog('=== APP STATE TEST ===');
    addDebugLog(`Jobs count: ${jobs.length}`);
    addDebugLog(`Customers count: ${customers.length}`);
    addDebugLog(`Invoices count: ${invoices.length}`);
    addDebugLog(`Technicians count: ${technicians.length}`);
    addDebugLog(`Current technician ID: ${currentTechnicianId}`);
    addDebugLog(`Platform: ${Platform.OS}`);
    addDebugLog('=== END STATE TEST ===');
  };

  const simulateError = () => {
    try {
      // Intentionally cause an error for testing
      const obj: any = null;
      obj.nonExistentProperty.someMethod();
    } catch (error) {
      addDebugLog(`Simulated error caught: ${error}`);
      Alert.alert('Error Simulated', `Error: ${error}`);
    }
  };

  const checkAsyncStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      addDebugLog('=== ASYNC STORAGE KEYS ===');
      keys.forEach(key => addDebugLog(`Key: ${key}`));
      addDebugLog(`Total keys: ${keys.length}`);
      addDebugLog('=== END STORAGE KEYS ===');
    } catch (error) {
      addDebugLog(`Error getting storage keys: ${error}`);
    }
  };

  const debugActions = [
    {
      icon: Info,
      label: 'Test App State',
      description: 'Log current app state to debug console',
      onPress: testAppState,
      color: Colors.primary,
    },
    {
      icon: Database,
      label: 'Check Storage Keys',
      description: 'List all AsyncStorage keys',
      onPress: checkAsyncStorageKeys,
      color: Colors.primary,
    },
    {
      icon: Download,
      label: 'Export App Data',
      description: 'Copy all app data to clipboard',
      onPress: exportAppData,
      color: Colors.status.completed,
    },
    {
      icon: Copy,
      label: 'Copy Debug Logs',
      description: 'Copy all debug logs to clipboard',
      onPress: copyLogsToClipboard,
      color: Colors.status.completed,
    },
    {
      icon: AlertTriangle,
      label: 'Simulate Error',
      description: 'Test error handling',
      onPress: simulateError,
      color: Colors.status.emergency,
    },
    {
      icon: Trash2,
      label: 'Clear AsyncStorage',
      description: 'Remove all stored app data',
      onPress: clearAsyncStorage,
      color: Colors.status.emergency,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Debug Tools',
          headerStyle: {
            backgroundColor: Colors.surface,
          },
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Debug Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Actions</Text>
          <View style={styles.sectionContent}>
            {debugActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionItem,
                  index === debugActions.length - 1 && styles.lastItem
                ]}
                onPress={action.onPress}
              >
                <View style={styles.actionLeft}>
                  <action.icon size={20} color={action.color} />
                  <View style={styles.actionText}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Log Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Custom Log</Text>
          <View style={styles.sectionContent}>
            <View style={styles.logInputContainer}>
              <TextInput
                style={styles.logInput}
                value={customLog}
                onChangeText={setCustomLog}
                placeholder="Enter custom debug message..."
                placeholderTextColor={Colors.text.light}
                multiline
              />
              <TouchableOpacity
                style={styles.addLogButton}
                onPress={addCustomLog}
                disabled={!customLog.trim()}
              >
                <Text style={[
                  styles.addLogButtonText,
                  !customLog.trim() && styles.disabledText
                ]}>Add Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Debug Logs */}
        <View style={styles.section}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Debug Logs ({debugLogs.length})</Text>
            <TouchableOpacity onPress={clearDebugLogs} style={styles.clearButton}>
              <RefreshCw size={16} color={Colors.text.secondary} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logsContainer}>
            {debugLogs.length > 0 ? (
              debugLogs.map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <Text style={styles.logText}>{log}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyLogs}>
                <Bug size={32} color={Colors.text.light} />
                <Text style={styles.emptyLogsText}>No debug logs yet</Text>
                <Text style={styles.emptyLogsSubtext}>
                  Use the debug actions above to generate logs
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>{Platform.OS}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>Debug</Text>
            </View>
            <View style={[styles.infoItem, styles.lastItem]}>
              <Text style={styles.infoLabel}>Environment</Text>
              <Text style={styles.infoValue}>Development</Text>
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
  actionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  logInputContainer: {
    padding: 16,
  },
  logInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addLogButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addLogButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  disabledText: {
    color: Colors.text.light,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  logsContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    maxHeight: 300,
  },
  logItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyLogsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  emptyLogsSubtext: {
    fontSize: 13,
    color: Colors.text.light,
    textAlign: 'center',
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
});