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
  gpsTracking: boolean;
  routeOptimization: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  duration: number;
  rate: number;
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
    gpsTracking: true,
    routeOptimization: true,
  });

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([
    { id: '1', name: 'AC Repair', duration: 90, rate: 125 },
    { id: '2', name: 'Furnace Maintenance', duration: 60, rate: 95 },
    { id: '3', name: 'Refrigerator Repair', duration: 75, rate: 110 },
    { id: '4', name: 'Installation', duration: 120, rate: 150 },
    { id: '5', name: 'Emergency Service', duration: 45, rate: 200 },
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [newService, setNewService] = useState({ name: '', duration: '', rate: '' });

  // Load settings on component mount
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('serviceSettings');
      const savedServiceTypes = await AsyncStorage.getItem('serviceTypes');
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      if (savedServiceTypes) {
        setServiceTypes(JSON.parse(savedServiceTypes));
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

  const saveServiceTypes = async (newServiceTypes: ServiceType[]) => {
    try {
      await AsyncStorage.setItem('serviceTypes', JSON.stringify(newServiceTypes));
      setServiceTypes(newServiceTypes);
    } catch (error) {
      Alert.alert('Error', 'Failed to save service types.');
      console.log('Error saving service types:', error);
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

  const handleAddServiceType = () => {
    setEditingService(null);
    setNewService({ name: '', duration: '', rate: '' });
    setShowServiceModal(true);
  };

  const handleEditServiceType = (service: ServiceType) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      duration: service.duration.toString(),
      rate: service.rate.toString(),
    });
    setShowServiceModal(true);
  };

  const handleSaveServiceType = async () => {
    if (!newService.name.trim() || !newService.duration || !newService.rate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const duration = parseInt(newService.duration);
    const rate = parseFloat(newService.rate);

    if (isNaN(duration) || isNaN(rate)) {
      Alert.alert('Error', 'Please enter valid numbers for duration and rate.');
      return;
    }

    let updatedServiceTypes;
    if (editingService) {
      updatedServiceTypes = serviceTypes.map(service => 
        service.id === editingService.id 
          ? { ...service, name: newService.name.trim(), duration, rate }
          : service
      );
    } else {
      const newServiceType: ServiceType = {
        id: `service${Date.now()}`,
        name: newService.name.trim(),
        duration,
        rate,
      };
      updatedServiceTypes = [...serviceTypes, newServiceType];
    }

    await saveServiceTypes(updatedServiceTypes);
    setShowServiceModal(false);
    Alert.alert('Success', `Service type ${editingService ? 'updated' : 'added'} successfully!`);
  };

  const handleDeleteServiceType = (serviceId: string) => {
    const service = serviceTypes.find(s => s.id === serviceId);
    Alert.alert(
      'Delete Service Type',
      `Are you sure you want to delete "${service?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedServiceTypes = serviceTypes.filter(s => s.id !== serviceId);
            await saveServiceTypes(updatedServiceTypes);
            Alert.alert('Success', 'Service type deleted successfully!');
          }
        }
      ]
    );
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
          title: 'Service Settings',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Default Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Settings</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Default Job Duration"
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
          <Text style={styles.sectionTitle}>Job Settings</Text>
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
              label="Send Job Notifications"
              hasSwitch
              switchValue={settings.sendNotifications}
              onSwitchChange={(value) => saveSettings({ ...settings, sendNotifications: value })}
            />
          </View>
        </View>

        {/* Service Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Types</Text>
            <TouchableOpacity onPress={handleAddServiceType} style={styles.addButton}>
              <Plus size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            {serviceTypes.map((service, index) => (
              <View
                key={service.id}
                style={[
                  styles.serviceTypeItem,
                  index === serviceTypes.length - 1 && styles.lastItem
                ]}
              >
                <View style={styles.serviceTypeInfo}>
                  <Text style={styles.serviceTypeName}>{service.name}</Text>
                  <View style={styles.serviceTypeDetails}>
                    <View style={styles.serviceTypeDetail}>
                      <Clock size={12} color={Colors.text.secondary} />
                      <Text style={styles.serviceTypeDetailText}>{service.duration}min</Text>
                    </View>
                    <View style={styles.serviceTypeDetail}>
                      <DollarSign size={12} color={Colors.text.secondary} />
                      <Text style={styles.serviceTypeDetailText}>${service.rate}/hr</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    onPress={() => handleEditServiceType(service)}
                    style={styles.editButton}
                  >
                    <Edit3 size={16} color={Colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteServiceType(service.id)}
                    style={styles.editButton}
                  >
                    <X size={16} color={Colors.status.emergency} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Routing</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Service Area Radius"
              value={`${settings.serviceRadius} miles`}
              onPress={() => handleEditField('serviceRadius', settings.serviceRadius)}
            />
            <SettingRow
              label="GPS Tracking"
              hasSwitch
              switchValue={settings.gpsTracking}
              onSwitchChange={(value) => saveSettings({ ...settings, gpsTracking: value })}
            />
            <SettingRow
              label="Route Optimization"
              hasSwitch
              switchValue={settings.routeOptimization}
              onSwitchChange={(value) => saveSettings({ ...settings, routeOptimization: value })}
            />
          </View>
        </View>

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

        {/* Service Type Modal */}
        <Modal
          visible={showServiceModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service Type' : 'Add Service Type'}
              </Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newService.name}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., AC Repair"
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newService.duration}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, duration: text }))}
                  placeholder="e.g., 90"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rate ($/hour)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newService.rate}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, rate: text }))}
                  placeholder="e.g., 125"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveServiceType}
              >
                <Text style={styles.modalSaveText}>
                  {editingService ? 'Save Changes' : 'Add Service'}
                </Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
  },
  addButton: {
    padding: 4,
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
  serviceTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  serviceTypeInfo: {
    flex: 1,
  },
  serviceTypeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  serviceTypeDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceTypeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceTypeDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  editButton: {
    padding: 8,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
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