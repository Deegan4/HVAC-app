import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';

interface OwnerPasswordSetupScreenProps {
  onPasswordSet: (password: string) => Promise<void>;
}

export default function OwnerPasswordSetupScreen({ onPasswordSet }: OwnerPasswordSetupScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validatePassword = (): boolean => {
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Owner password must be at least 6 characters long.');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Passwords Don\'t Match', 'Please make sure both passwords match.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onPasswordSet(password);
      Alert.alert(
        'Password Set',
        'Your owner password has been set successfully. Technicians will now need this password to access owner features.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error setting password:', error);
      Alert.alert('Error', 'Failed to set owner password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SnowingBackground snowflakeCount={30}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <SpinningSnowflake size={64} color={Colors.primary} />
            <Text style={styles.title}>Set Owner Password</Text>
            <Text style={styles.subtitle}>
              Create a password to protect owner features from technicians
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter owner password"
                placeholderTextColor={Colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.text.secondary} />
                ) : (
                  <Eye size={20} color={Colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm owner password"
                placeholderTextColor={Colors.text.light}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.text.secondary} />
                ) : (
                  <Eye size={20} color={Colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.infoText}>
              Password must be at least 6 characters long
            </Text>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Setting Password...' : 'Set Owner Password'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This password will be required to access owner-only features
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
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
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
