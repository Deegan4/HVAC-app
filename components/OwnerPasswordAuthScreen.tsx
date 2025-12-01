import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Vibration
} from 'react-native';
import { Lock, Eye, EyeOff, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';

interface OwnerPasswordAuthScreenProps {
  onAuthenticate: (password: string) => Promise<boolean>;
  onCancel?: () => void;
}

export default function OwnerPasswordAuthScreen({ onAuthenticate, onCancel }: OwnerPasswordAuthScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const maxAttempts = 5;

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter the owner password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isAuthenticated = await onAuthenticate(password);
      
      if (isAuthenticated) {
        setPassword('');
        setAttempts(0);
      } else {
        if (Platform.OS !== 'web') {
          Vibration.vibrate(500);
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPassword('');
        
        if (newAttempts >= maxAttempts) {
          Alert.alert(
            'Too Many Attempts',
            'You have exceeded the maximum number of password attempts. Please contact the owner.',
            [{ text: 'OK', onPress: onCancel }]
          );
        } else {
          Alert.alert(
            'Incorrect Password',
            `Please try again. ${maxAttempts - newAttempts} attempts remaining.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error authenticating password:', error);
      Alert.alert('Error', 'Failed to verify password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = attempts >= maxAttempts;

  return (
    <SnowingBackground snowflakeCount={30}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconRow}>
              <SpinningSnowflake size={64} color={Colors.primary} />
              {onCancel && (
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                  <X size={28} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.title}>Owner Access Required</Text>
            <Text style={styles.subtitle}>
              Enter the owner password to access this feature
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, isShaking && styles.shaking, isLocked && styles.inputContainerLocked]}>
              <Lock size={20} color={isLocked ? '#94a3b8' : Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isLocked && styles.inputDisabled]}
                placeholder="Enter owner password"
                placeholderTextColor={Colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLocked && !isSubmitting}
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLocked}
              >
                {showPassword ? (
                  <EyeOff size={20} color={isLocked ? '#94a3b8' : Colors.text.secondary} />
                ) : (
                  <Eye size={20} color={isLocked ? '#94a3b8' : Colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>

            {attempts > 0 && !isLocked && (
              <Text style={styles.attemptsText}>
                {maxAttempts - attempts} attempts remaining
              </Text>
            )}
            
            {isLocked && (
              <Text style={styles.lockedText}>
                Account temporarily locked
              </Text>
            )}

            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || isLocked) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || isLocked}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Verifying...' : 'Verify Password'}
              </Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                style={styles.cancelTextButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelTextButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Only the owner has access to this password
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative' as const,
  },
  cancelButton: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
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
  inputContainerLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shaking: {
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
  inputDisabled: {
    color: '#94a3b8',
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  attemptsText: {
    color: '#fbbf24',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  lockedText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelTextButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelTextButtonText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
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
