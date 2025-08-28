import React, { useState } from 'react';
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
import { Stack } from 'expo-router';
import { 
  Wrench, 
  DollarSign, 
  Clock, 
  MapPin,
  Settings,
  Plus,
  Edit3
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface ServiceSettings {
  defaultDuration: number;
  emergencyRate: number;
  travelTime: number;
  autoScheduling: boolean;
  requireSignature: boolean;
  allowPhotos: boolean;
  sendNotifications: boolean;
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
  });

  const [serviceTypes] = useState([
    { id: '1', name: 'AC Repair', duration: 90, rate: 125 },
    { id: '2', name: 'Furnace Maintenance', duration: 60, rate: 95 },
    { id: '3', name: 'Refrigerator Repair', duration: 75, rate: 110 },
    { id: '4', name: 'Installation', duration: 120, rate: 150 },
    { id: '5', name: 'Emergency Service', duration: 45, rate: 200 },
  ]);

  const handleAddServiceType = () => {
    Alert.alert(
      'Add Service Type',
      'This would open a form to add a new service type with custom rates and duration.',
      [{ text: 'OK' }]
    );
  };

  const handleEditServiceType = (serviceId: string) => {
    Alert.alert(
      'Edit Service Type',
      `Edit settings for service type ${serviceId}`,
      [{ text: 'OK' }]
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
              onPress={() => Alert.alert('Edit Duration', 'Set default job duration')}
            />
            <SettingRow
              label="Emergency Rate Multiplier"
              value={`${settings.emergencyRate}x`}
              onPress={() => Alert.alert('Edit Rate', 'Set emergency rate multiplier')}
            />
            <SettingRow
              label="Travel Time Buffer"
              value={`${settings.travelTime} minutes`}
              onPress={() => Alert.alert('Edit Travel Time', 'Set travel time buffer')}
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
              onSwitchChange={(value) => setSettings(prev => ({ ...prev, autoScheduling: value }))}
            />
            <SettingRow
              label="Require Customer Signature"
              hasSwitch
              switchValue={settings.requireSignature}
              onSwitchChange={(value) => setSettings(prev => ({ ...prev, requireSignature: value }))}
            />
            <SettingRow
              label="Allow Photo Uploads"
              hasSwitch
              switchValue={settings.allowPhotos}
              onSwitchChange={(value) => setSettings(prev => ({ ...prev, allowPhotos: value }))}
            />
            <SettingRow
              label="Send Job Notifications"
              hasSwitch
              switchValue={settings.sendNotifications}
              onSwitchChange={(value) => setSettings(prev => ({ ...prev, sendNotifications: value }))}
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
                <TouchableOpacity
                  onPress={() => handleEditServiceType(service.id)}
                  style={styles.editButton}
                >
                  <Edit3 size={16} color={Colors.text.secondary} />
                </TouchableOpacity>
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
              value="25 miles"
              onPress={() => Alert.alert('Edit Radius', 'Set service area radius')}
            />
            <SettingRow
              label="GPS Tracking"
              hasSwitch
              switchValue={true}
              onSwitchChange={() => {}}
            />
            <SettingRow
              label="Route Optimization"
              hasSwitch
              switchValue={true}
              onSwitchChange={() => {}}
            />
          </View>
        </View>

        {/* Pricing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Billing</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              label="Tax Rate"
              value="8.5%"
              onPress={() => Alert.alert('Edit Tax Rate', 'Set default tax rate')}
            />
            <SettingRow
              label="Payment Terms"
              value="Net 30"
              onPress={() => Alert.alert('Edit Terms', 'Set payment terms')}
            />
            <SettingRow
              label="Late Fee"
              value="$25"
              onPress={() => Alert.alert('Edit Late Fee', 'Set late payment fee')}
            />
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
});