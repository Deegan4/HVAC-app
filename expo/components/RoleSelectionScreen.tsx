import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert
} from 'react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';
import { User, Settings } from 'lucide-react-native';
import { useTranslation } from '@/constants/translations';
import { Language } from '@/components/LanguageSelectionScreen';

export type UserRole = 'owner' | 'technician';

interface RoleSelectionScreenProps {
  onRoleSelected: (role: UserRole) => void;
  language?: Language;
}

export default function RoleSelectionScreen({ onRoleSelected, language = 'en' }: RoleSelectionScreenProps) {
  const t = useTranslation(language);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert(t.roleRequired, t.pleaseSelectRole);
      return;
    }
    onRoleSelected(selectedRole);
  };

  const roleOptions = [
    {
      id: 'owner' as UserRole,
      title: t.ownerManager,
      description: t.ownerDescription,
      icon: Settings,
      color: Colors.primary,
    },
    {
      id: 'technician' as UserRole,
      title: t.technician,
      description: t.technicianDescription,
      icon: User,
      color: '#10b981',
    },
  ];

  return (
    <SnowingBackground snowflakeCount={30}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <SpinningSnowflake size={64} color={Colors.primary} />
            <Text style={styles.title}>AGCC</Text>
            <Text style={styles.subtitle}>
              {t.selectRole}
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>{t.chooseYourRole}</Text>
            
            {roleOptions.map((role) => {
              const IconComponent = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                    { borderColor: isSelected ? role.color : 'rgba(255, 255, 255, 0.2)' }
                  ]}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleCardContent}>
                    <View style={[
                      styles.roleIcon,
                      { backgroundColor: isSelected ? role.color : 'rgba(255, 255, 255, 0.1)' }
                    ]}>
                      <IconComponent 
                        size={32} 
                        color={isSelected ? '#ffffff' : role.color} 
                      />
                    </View>
                    
                    <View style={styles.roleInfo}>
                      <Text style={[
                        styles.roleTitle,
                        { color: isSelected ? role.color : '#ffffff' }
                      ]}>
                        {role.title}
                      </Text>
                      <Text style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.radioButton,
                      { borderColor: isSelected ? role.color : 'rgba(255, 255, 255, 0.3)' }
                    ]}>
                      {isSelected && (
                        <View style={[
                          styles.radioButtonInner,
                          { backgroundColor: role.color }
                        ]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedRole && styles.continueButtonActive,
              selectedRole && { backgroundColor: roleOptions.find(r => r.id === selectedRole)?.color }
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedRole}
          >
            <Text style={[
              styles.continueButtonText,
              selectedRole && styles.continueButtonTextActive
            ]}>
              {t.continue}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t.roleChangeNote}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </SnowingBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  roleCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonActive: {
    borderColor: 'transparent',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  continueButtonTextActive: {
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});