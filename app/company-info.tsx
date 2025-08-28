import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Building, Mail, Phone, MapPin, Save, Edit3 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  license: string;
  taxId: string;
}

export default function CompanyInfoScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'Oliva Refrigeration',
    email: 'info@olivarefrigeration.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, City, State 12345',
    website: 'www.olivarefrigeration.com',
    license: 'HVAC-2024-001',
    taxId: '12-3456789',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Company information updated successfully!');
    setIsEditing(false);
  };

  const InfoField = ({ icon: Icon, label, value, onChangeText, multiline = false }: {
    icon: any;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
  }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Icon size={16} color={Colors.text.secondary} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Company Info',
          headerRight: () => (
            <TouchableOpacity
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              style={styles.headerButton}
            >
              {isEditing ? (
                <Save size={20} color={Colors.primary} />
              ) : (
                <Edit3 size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.sectionContent}>
            <InfoField
              icon={Building}
              label="Company Name"
              value={companyInfo.name}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, name: text }))}
            />
            <InfoField
              icon={Mail}
              label="Email Address"
              value={companyInfo.email}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, email: text }))}
            />
            <InfoField
              icon={Phone}
              label="Phone Number"
              value={companyInfo.phone}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, phone: text }))}
            />
            <InfoField
              icon={MapPin}
              label="Address"
              value={companyInfo.address}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, address: text }))}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.sectionContent}>
            <InfoField
              icon={Building}
              label="Website"
              value={companyInfo.website}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, website: text }))}
            />
            <InfoField
              icon={Building}
              label="License Number"
              value={companyInfo.license}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, license: text }))}
            />
            <InfoField
              icon={Building}
              label="Tax ID"
              value={companyInfo.taxId}
              onChangeText={(text) => setCompanyInfo(prev => ({ ...prev, taxId: text }))}
            />
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerButton: {
    padding: 8,
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
  fieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  input: {
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});