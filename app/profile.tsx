import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { User, Save, Edit3, Camera, Award, Clock, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface ProfileFieldProps {
  isEditing: boolean;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const ProfileField = React.memo<ProfileFieldProps>(({ isEditing, label, value, onChangeText, multiline = false, keyboardType = 'default' }) => (
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
        autoCorrect={false}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    ) : (
      <Text style={styles.fieldValue}>{value}</Text>
    )}
  </View>
), (prevProps, nextProps) => {
  return prevProps.value === nextProps.value &&
         prevProps.label === nextProps.label &&
         prevProps.multiline === nextProps.multiline &&
         prevProps.keyboardType === nextProps.keyboardType &&
         prevProps.isEditing === nextProps.isEditing;
});
ProfileField.displayName = 'ProfileField';

export default function ProfileScreen() {
  const { technicians, currentTechnicianId, jobs, invoices } = useAppStore();
  const currentTech = technicians.find(t => t.id === currentTechnicianId);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: currentTech?.name || 'John Doe',
    email: currentTech?.email || 'john@olivarefrigeration.com',
    phone: currentTech?.phone || '(555) 123-4567',
    specialties: currentTech?.specialties.join(', ') || 'HVAC, Refrigeration',
    bio: 'Experienced HVAC technician with 8+ years in commercial and residential systems.',
    emergencyContact: '(555) 987-6543',
    licenseNumber: 'HVAC-2024-JD001',
  });

  // Load profile data and photo on component mount
  const loadProfileData = useCallback(async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(`profile_${currentTechnicianId}`);
      const savedPhoto = await AsyncStorage.getItem(`profilePhoto_${currentTechnicianId}`);
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  }, [currentTechnicianId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);



  // Calculate real stats from jobs and invoices
  const techJobs = jobs.filter(job => job.technicianId === currentTechnicianId);
  const completedJobs = techJobs.filter(job => job.status === 'completed');
  const techInvoices = invoices.filter(invoice => 
    techJobs.some(job => job.id === invoice.jobId)
  );
  
  const stats = {
    jobsCompleted: completedJobs.length,
    avgRating: 4.8 + Math.random() * 0.2, // Simulated rating
    onTimeRate: completedJobs.length > 0 ? 
      Math.round((completedJobs.filter(job => {
        const scheduled = new Date(`${job.scheduledDate}T${job.scheduledTime}`);
        const completed = job.completedAt ? new Date(job.completedAt) : new Date();
        return completed <= new Date(scheduled.getTime() + job.duration * 60000);
      }).length / completedJobs.length) * 100) : 100,
    totalRevenue: techInvoices.reduce((sum, inv) => sum + inv.total, 0)
  };

  // Get recent activity from actual jobs
  const recentJobs = techJobs
    .filter(job => job.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.scheduledDate).getTime() - new Date(a.completedAt || a.scheduledDate).getTime())
    .slice(0, 3);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(`profile_${currentTechnicianId}`, JSON.stringify(profile));
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      console.log('Error saving profile:', error);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImagePicker() },
        { text: 'Remove Photo', onPress: () => removePhoto(), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setProfilePhoto(photoUri);
        await AsyncStorage.setItem(`profilePhoto_${currentTechnicianId}`, photoUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.log('Camera error:', error);
    }
  };

  const openImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setProfilePhoto(photoUri);
        await AsyncStorage.setItem(`profilePhoto_${currentTechnicianId}`, photoUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      console.log('Image picker error:', error);
    }
  };

  const removePhoto = async () => {
    try {
      setProfilePhoto(null);
      await AsyncStorage.removeItem(`profilePhoto_${currentTechnicianId}`);
    } catch (error) {
      console.log('Error removing photo:', error);
    }
  };



  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Stable change handlers to prevent re-renders
  const updateProfile = useCallback((field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNameChange = useCallback((text: string) => {
    updateProfile('name', text);
  }, [updateProfile]);

  const handleEmailChange = useCallback((text: string) => {
    updateProfile('email', text);
  }, [updateProfile]);

  const handlePhoneChange = useCallback((text: string) => {
    updateProfile('phone', text);
  }, [updateProfile]);

  const handleBioChange = useCallback((text: string) => {
    updateProfile('bio', text);
  }, [updateProfile]);

  const handleSpecialtiesChange = useCallback((text: string) => {
    updateProfile('specialties', text);
  }, [updateProfile]);

  const handleLicenseChange = useCallback((text: string) => {
    updateProfile('licenseNumber', text);
  }, [updateProfile]);

  const handleEmergencyContactChange = useCallback((text: string) => {
    updateProfile('emergencyContact', text);
  }, [updateProfile]);

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
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={isEditing ? handleChangePhoto : undefined}
            disabled={!isEditing}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
            ) : (
              <User size={40} color={Colors.text.inverse} />
            )}
            {isEditing && (
              <View style={styles.photoButton}>
                <Camera size={16} color={Colors.text.inverse} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>{profile.name}</Text>
          <Text style={styles.photoSubLabel}>{currentTech?.availability || 'Available'}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.sectionContent}>
            <ProfileField
              isEditing={isEditing}
              label="Full Name"
              value={profile.name}
              onChangeText={handleNameChange}
            />
            <ProfileField
              isEditing={isEditing}
              label="Email Address"
              value={profile.email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
            />
            <ProfileField
              isEditing={isEditing}
              label="Phone Number"
              value={profile.phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
            />
            <ProfileField
              isEditing={isEditing}
              label="Bio"
              value={profile.bio}
              onChangeText={handleBioChange}
              multiline
            />
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.sectionContent}>
            <ProfileField
              isEditing={isEditing}
              label="Specialties"
              value={profile.specialties}
              onChangeText={handleSpecialtiesChange}
            />
            <ProfileField
              isEditing={isEditing}
              label="License Number"
              value={profile.licenseNumber}
              onChangeText={handleLicenseChange}
            />
            <ProfileField
              isEditing={isEditing}
              label="Emergency Contact"
              value={profile.emergencyContact}
              onChangeText={handleEmergencyContactChange}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Award size={20} color={Colors.primary} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.jobsCompleted}</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={20} color={Colors.primary} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={20} color={Colors.primary} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.onTimeRate}%</Text>
              <Text style={styles.statLabel}>On-Time Rate</Text>
            </View>
          </View>
          
          {/* Revenue Stats */}
          <View style={styles.revenueContainer}>
            <Text style={styles.revenueTitle}>Total Revenue Generated</Text>
            <Text style={styles.revenueAmount}>${stats.totalRevenue.toLocaleString()}</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.sectionContent}>
            {recentJobs.length > 0 ? (
              recentJobs.map((job, index) => {
                const timeAgo = getTimeAgo(job.completedAt || job.scheduledDate);
                return (
                  <View 
                    key={job.id} 
                    style={[styles.activityItem, index === recentJobs.length - 1 && styles.lastItem]}
                  >
                    <Text style={styles.activityTitle}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1)} - {job.description}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {job.customerName} • {timeAgo}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>No recent activity</Text>
                <Text style={styles.activitySubtitle}>Complete some jobs to see your activity here</Text>
              </View>
            )}
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 12,
  },
  photoSubLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textTransform: 'capitalize' as const,
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
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  revenueContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  revenueTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.status.completed,
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