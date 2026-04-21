import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Wrench, 
  DollarSign, 
  Clock, 
  MapPin,
  Settings,
  Plus,
  Edit3,
  X,
  Save
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceSettings {
  defaultDuration: number;
  emergencyRate: number;
  travelTime: number;
  autoScheduling: boolean;
  requireSignature: boolean;
  allowPhotos: boolean;
  sendNotifications: boolean;
  taxRate: number;
  paymentTerms: string;
  lateFee: number;
  serviceRadius: number;
}

export default function ServiceSettingsScreen() {
  const [settings, setSettings] = useState<ServiceSettings>({
    defaultDuration: 60,
    emergencyRate: 1.5,
    travelTime: 30,
    autoScheduling: true,
    requireSignature: true,
    allowPhotos: true,
    sendNotifications: true,
    taxRate: 8.5,
    paymentTerms: 'Net 30',
    lateFee: 25,
    serviceRadius: 25,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');

  // Load settings on component mount
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('serviceSettings');
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: ServiceSettings) => {
    try {
      await AsyncStorage.setItem('serviceSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
      console.log('Error saving settings:', error);
    }
  };

  const handleEditField = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditingValue(currentValue.toString());
    setShowEditModal(true);
  };

  const handleSaveField = async () => {
    const numericFields = ['defaultDuration', 'emergencyRate', 'travelTime', 'taxRate', 'lateFee', 'serviceRadius'];
    const value = numericFields.includes(editingField) ? parseFloat(editingValue) : editingValue;
    
    if (numericFields.includes(editingField) && isNaN(value as number)) {
      Alert.alert('Error', 'Please enter a valid number.');
      return;
    }

    const newSettings = { ...settings, [editingField]: value };
    await saveSettings(newSettings);
    setShowEditModal(false);
    Alert.alert('Success', 'Setting updated successfully!');
  };

  const SettingRow = ({ label, value, onPress, hasSwitch = false, switchValue, onSwitchChange }: {
    label: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
          thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Project Settings',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Default Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Settings</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Default Project Duration"
              value={`${settings.defaultDuration} minutes`}
              onPress={() => handleEditField('defaultDuration', settings.defaultDuration)}
            />
            <SettingRow
              label="Emergency Rate Multiplier"
              value={`${settings.emergencyRate}x`}
              onPress={() => handleEditField('emergencyRate', settings.emergencyRate)}
            />
            <SettingRow
              label="Travel Time Buffer"
              value={`${settings.travelTime} minutes`}
              onPress={() => handleEditField('travelTime', settings.travelTime)}
            />
          </View>
        </View>

        {/* Job Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Settings</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Auto-scheduling"
              hasSwitch
              switchValue={settings.autoScheduling}
              onSwitchChange={(value) => saveSettings({ ...settings, autoScheduling: value })}
            />
            <SettingRow
              label="Require Customer Signature"
              hasSwitch
              switchValue={settings.requireSignature}
              onSwitchChange={(value) => saveSettings({ ...settings, requireSignature: value })}
            />
            <SettingRow
              label="Allow Photo Uploads"
              hasSwitch
              switchValue={settings.allowPhotos}
              onSwitchChange={(value) => saveSettings({ ...settings, allowPhotos: value })}
            />
            <SettingRow
              label="Send Project Notifications"
              hasSwitch
              switchValue={settings.sendNotifications}
              onSwitchChange={(value) => saveSettings({ ...settings, sendNotifications: value })}
            />
          </View>
        </View>

        {/* Location Settings */}
        {/* Pricing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Billing</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Tax Rate"
              value={`${settings.taxRate}%`}
              onPress={() => handleEditField('taxRate', settings.taxRate)}
            />
            <SettingRow
              label="Payment Terms"
              value={settings.paymentTerms}
              onPress={() => handleEditField('paymentTerms', settings.paymentTerms)}
            />
            <SettingRow
              label="Late Fee"
              value={`${settings.lateFee}`}
              onPress={() => handleEditField('lateFee', settings.lateFee)}
            />
          </View>
        </View>

        {/* Edit Field Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {editingField}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.textInput}
                value={editingValue}
                onChangeText={setEditingValue}
                placeholder="Enter value"
                keyboardType={['defaultDuration', 'emergencyRate', 'travelTime', 'taxRate', 'lateFee', 'serviceRadius'].includes(editingField) ? 'numeric' : 'default'}
                autoFocus
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveField}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

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
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});