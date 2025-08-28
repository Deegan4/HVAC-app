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
import { User, Mail, Phone, Save, Edit3, Camera } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function ProfileScreen() {
  const { technicians, currentTechnicianId } = useAppStore();
  const currentTech = technicians.find(t => t.id === currentTechnicianId);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: currentTech?.name || 'John Doe',
    email: currentTech?.email || 'john@olivarefrigeration.com',
    phone: currentTech?.phone || '(555) 123-4567',
    specialties: currentTech?.specialties.join(', ') || 'HVAC, Refrigeration',
    bio: 'Experienced HVAC technician with 8+ years in commercial and residential systems.',
    emergencyContact: '(555) 987-6543',
    licenseNumber: 'HVAC-2024-JD001',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Photo Library', onPress: () => console.log('Open library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const ProfileField = ({ label, value, onChangeText, multiline = false, keyboardType = 'default' }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          keyboardType={keyboardType}
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
          title: 'Profile',
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
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <User size={40} color={Colors.text.inverse} />
            {isEditing && (
              <TouchableOpacity style={styles.photoButton} onPress={handleChangePhoto}>
                <Camera size={16} color={Colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoLabel}>Profile Photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.sectionContent}>
            <ProfileField
              label="Full Name"
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            />
            <ProfileField
              label="Email Address"
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
            />
            <ProfileField
              label="Phone Number"
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            <ProfileField
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              multiline
            />
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.sectionContent}>
            <ProfileField
              label="Specialties"
              value={profile.specialties}
              onChangeText={(text) => setProfile(prev => ({ ...prev, specialties: text }))}
            />
            <ProfileField
              label="License Number"
              value={profile.licenseNumber}
              onChangeText={(text) => setProfile(prev => ({ ...prev, licenseNumber: text }))}
            />
            <ProfileField
              label="Emergency Contact"
              value={profile.emergencyContact}
              onChangeText={(text) => setProfile(prev => ({ ...prev, emergencyContact: text }))}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>On-Time Rate</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.sectionContent}>
            <View style={styles.activityItem}>
              <Text style={styles.activityTitle}>Completed AC Repair</Text>
              <Text style={styles.activitySubtitle}>Johnson Residence • 2 hours ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityTitle}>Maintenance Check</Text>
              <Text style={styles.activitySubtitle}>Metro Office Building • Yesterday</Text>
            </View>
            <View style={[styles.activityItem, styles.lastItem]}>
              <Text style={styles.activityTitle}>Emergency Repair</Text>
              <Text style={styles.activitySubtitle}>Downtown Restaurant • 2 days ago</Text>
            </View>
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
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 12,
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activityItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
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