import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { User, Phone, Mail, MapPin, Save, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function NewCustomerScreen() {
  const { addCustomer } = useAppStore();
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (field: keyof CustomerForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Email address is required');
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert('Validation Error', 'Address is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      addCustomer({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim() || undefined,
      });
      
      Alert.alert(
        'Success',
        'Customer added successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error adding customer:', error);
      Alert.alert('Error', 'Failed to add customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(form).some(value => value.trim())) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'New Customer',
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.headerButton, { opacity: isSubmitting ? 0.5 : 1 }]}
              disabled={isSubmitting}
            >
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Customer Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <User size={32} color={Colors.text.inverse} />
              </View>
              <Text style={styles.avatarLabel}>New Customer</Text>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={form.name}
                  onChangeText={(text) => updateForm('name', text)}
                  placeholder="Enter customer name"
                  placeholderTextColor={Colors.text.light}
                  autoCapitalize="words"
                  testID="customer-name-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Mail size={16} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textInputWithIcon]}
                    value={form.email}
                    onChangeText={(text) => updateForm('email', text)}
                    placeholder="customer@email.com"
                    placeholderTextColor={Colors.text.light}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="customer-email-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <Phone size={16} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textInputWithIcon]}
                    value={form.phone}
                    onChangeText={(text) => updateForm('phone', text)}
                    placeholder="(555) 123-4567"
                    placeholderTextColor={Colors.text.light}
                    keyboardType="phone-pad"
                    testID="customer-phone-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address *</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={16} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textInputWithIcon, styles.textArea]}
                    value={form.address}
                    onChangeText={(text) => updateForm('address', text)}
                    placeholder="123 Main St, City, State 12345"
                    placeholderTextColor={Colors.text.light}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    testID="customer-address-input"
                  />
                </View>
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={form.notes}
                  onChangeText={(text) => updateForm('notes', text)}
                  placeholder="Special instructions, preferences, or notes about this customer..."
                  placeholderTextColor={Colors.text.light}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  testID="customer-notes-input"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { opacity: isSubmitting ? 0.5 : 1 }]}
              onPress={handleSave}
              disabled={isSubmitting}
              testID="save-customer-button"
            >
              <Save size={20} color={Colors.text.inverse} />
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Customer'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  form: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInputWithIcon: {
    paddingLeft: 40,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});