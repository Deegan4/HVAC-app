import React, { useState, useEffect, useCallback } from 'react';
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
import { Stack, router } from 'expo-router';
import { Building, Mail, Phone, MapPin, Save, Edit3, Globe, FileText, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMountedRef } from '@/hooks/use-mounted-ref';

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  license: string;
  taxId: string;
  businessHours: string;
  emergencyPhone: string;
  description: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'address', 'license'];

export default function CompanyInfoScreen() {
  const mountedRef = useMountedRef();
  
  React.useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (!mountedRef.current) {
        return;
      }
      if (role === 'technician') {
        Alert.alert(
          'Access Denied',
          'This feature is only available to owners and managers.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };
    checkRole();
  }, [mountedRef]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'AGCC',
    email: 'info@agcc.com',
    phone: '(239) 722-0762',
    address: 'SW Florida',
    website: '',
    license: 'CBC1253967',
    taxId: '',
    businessHours: '',
    emergencyPhone: '',
    description: 'General contracting services including renovations, new builds, repairs, and remodels.',
  });
  const [originalInfo, setOriginalInfo] = useState<CompanyInfo>(companyInfo);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load company info on component mount
  const loadCompanyInfo = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('companyInfo');
      if (!mountedRef.current) {
        return;
      }
      if (saved) {
        const parsedInfo = JSON.parse(saved);
        setCompanyInfo(parsedInfo);
        setOriginalInfo(parsedInfo);
      }
    } catch (error) {
      console.log('Error loading company info:', error);
    }
  }, [mountedRef]);

  useEffect(() => {
    loadCompanyInfo();
  }, [loadCompanyInfo]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      const value = companyInfo[field as keyof CompanyInfo]?.trim();
      if (!value) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Validate email format
    if (companyInfo.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyInfo.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Validate phone format (basic validation)
    if (companyInfo.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(companyInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    
    // Validate emergency phone if provided
    if (companyInfo.emergencyPhone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(companyInfo.emergencyPhone.replace(/[\s\-\(\)]/g, ''))) {
        errors.emergencyPhone = 'Please enter a valid emergency phone number';
      }
    }
    
    // Validate website format if provided
    if (companyInfo.website.trim()) {
      const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!websiteRegex.test(companyInfo.website.trim())) {
        errors.website = 'Please enter a valid website URL';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors below before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    try {
      // Trim all string values before saving
      const trimmedInfo = Object.keys(companyInfo).reduce((acc, key) => {
        acc[key as keyof CompanyInfo] = companyInfo[key as keyof CompanyInfo].trim();
        return acc;
      }, {} as CompanyInfo);
      
      await AsyncStorage.setItem('companyInfo', JSON.stringify(trimmedInfo));
      if (!mountedRef.current) {
        return;
      }
      setCompanyInfo(trimmedInfo);
      setOriginalInfo(trimmedInfo);
      setValidationErrors({});
      Alert.alert('Success', 'Company information updated successfully!');
      setIsEditing(false);
    } catch (error) {
      if (mountedRef.current) {
        Alert.alert('Error', 'Failed to save company information. Please try again.');
      }
      console.log('Error saving company info:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setCompanyInfo(originalInfo);
    setValidationErrors({});
    setIsEditing(false);
  };

  const updateField = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const InfoField = ({ icon: Icon, label, value, onChangeText, multiline = false, keyboardType = 'default', fieldKey, required = false }: {
    icon: any;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
    fieldKey: string;
    required?: boolean;
  }) => {
    const hasError = validationErrors[fieldKey];
    
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Icon size={16} color={hasError ? Colors.status.error : Colors.text.secondary} />
          <Text style={[styles.fieldLabel, hasError && styles.fieldLabelError]}>
            {label}{required && ' *'}
          </Text>
          {hasError && (
            <AlertCircle size={14} color={Colors.status.error} style={styles.errorIcon} />
          )}
        </View>
        {isEditing ? (
          <>
            <TextInput
              style={[
                styles.input,
                multiline && styles.multilineInput,
                hasError && styles.inputError
              ]}
              value={value}
              onChangeText={onChangeText}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              keyboardType={keyboardType}
              autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'words'}
              autoCorrect={false}
              placeholder={required ? `Enter ${label.toLowerCase()}` : `Enter ${label.toLowerCase()} (optional)`}
              placeholderTextColor={Colors.text.tertiary}
            />
            {hasError && (
              <Text style={styles.errorText}>{validationErrors[fieldKey]}</Text>
            )}
          </>
        ) : (
          <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
        )}
      </View>
    );
  };

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
              onChangeText={(text) => updateField('name', text)}
              fieldKey="name"
              required
            />
            <InfoField
              icon={Mail}
              label="Email Address"
              value={companyInfo.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              fieldKey="email"
              required
            />
            <InfoField
              icon={Phone}
              label="Phone Number"
              value={companyInfo.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
              fieldKey="phone"
              required
            />
            <InfoField
              icon={Phone}
              label="Emergency Phone"
              value={companyInfo.emergencyPhone}
              onChangeText={(text) => updateField('emergencyPhone', text)}
              keyboardType="phone-pad"
              fieldKey="emergencyPhone"
            />
            <InfoField
              icon={MapPin}
              label="Address"
              value={companyInfo.address}
              onChangeText={(text) => updateField('address', text)}
              multiline
              fieldKey="address"
              required
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.sectionContent}>
            <InfoField
              icon={Globe}
              label="Website"
              value={companyInfo.website}
              onChangeText={(text) => updateField('website', text)}
              keyboardType="url"
              fieldKey="website"
            />
            <InfoField
              icon={FileText}
              label="License Number"
              value={companyInfo.license}
              onChangeText={(text) => updateField('license', text)}
              fieldKey="license"
              required
            />
            <InfoField
              icon={FileText}
              label="Tax ID"
              value={companyInfo.taxId}
              onChangeText={(text) => updateField('taxId', text)}
              fieldKey="taxId"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations</Text>
          <View style={styles.sectionContent}>
            <InfoField
              icon={Building}
              label="Business Hours"
              value={companyInfo.businessHours}
              onChangeText={(text) => updateField('businessHours', text)}
              fieldKey="businessHours"
            />
            <InfoField
              icon={FileText}
              label="Company Description"
              value={companyInfo.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              fieldKey="description"
            />
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
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
  inputError: {
    borderColor: Colors.status.error,
    borderWidth: 1.5,
  },
  fieldLabelError: {
    color: Colors.status.error,
  },
  errorIcon: {
    marginLeft: 'auto',
  },
  errorText: {
    fontSize: 12,
    color: Colors.status.error,
    marginTop: 4,
    marginLeft: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
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