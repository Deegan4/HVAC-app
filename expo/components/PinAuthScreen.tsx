import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Vibration,
  Platform
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';

interface PinAuthScreenProps {
  onAuthenticate: (pin: string) => Promise<boolean>;
}

export default function PinAuthScreen({ onAuthenticate }: PinAuthScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('');

  const maxPinLength = 4;
  const maxAttempts = 5;

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (Platform.OS === 'web') {
      setBiometricAvailable(false);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Biometric authentication is not available on web.');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access AGCC',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const authenticated = await onAuthenticate('biometric-auth-success');
        if (!authenticated) {
          Alert.alert('Authentication Failed', 'Could not verify your identity.');
        }
      } else {
        console.log('Biometric authentication failed or cancelled');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Could not complete biometric authentication.');
    }
  };

  const handleNumberPress = (number: string) => {
    if (pin.length < maxPinLength) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === maxPinLength) {
        setTimeout(async () => {
          const isAuthenticated = await onAuthenticate(newPin);
          if (isAuthenticated) {
            // Success - PIN is correct
            setPin('');
            setAttempts(0);
          } else {
            // Failed authentication
            if (Platform.OS !== 'web') {
              Vibration.vibrate(500);
            }
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPin('');
            
            if (newAttempts >= maxAttempts) {
              Alert.alert(
                'Too Many Attempts',
                'You have exceeded the maximum number of PIN attempts. Please contact your administrator.',
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert(
                'Incorrect PIN',
                `Please try again. ${maxAttempts - newAttempts} attempts remaining.`,
                [{ text: 'OK' }]
              );
            }
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const renderPinDots = () => {
    return (
      <View style={[styles.pinDotsContainer, isShaking && styles.shaking]}>
        {Array.from({ length: maxPinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < pin.length ? Colors.primary : 'transparent',
                borderColor: attempts > 0 ? '#ef4444' : Colors.primary,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    
    return (
      <View style={styles.numberPad}>
        {numbers.map((num, index) => {
          if (num === '') {
            return <View key={index} style={styles.numberButton} />;
          }
          
          const isBackspace = num === '⌫';
          const isDisabled = attempts >= maxAttempts;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                isBackspace && styles.backspaceButton,
                isDisabled && styles.disabledButton
              ]}
              onPress={() => {
                if (!isDisabled) {
                  if (isBackspace) {
                    handleBackspace();
                  } else {
                    handleNumberPress(num);
                  }
                }
              }}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text style={[
                styles.numberButtonText,
                isBackspace && styles.backspaceText,
                isDisabled && styles.disabledText
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SnowingBackground snowflakeCount={30}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <SpinningSnowflake size={64} color={Colors.primary} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Enter your PIN to access AGCC
            </Text>
          </View>

          {/* PIN Input */}
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Enter your 4-digit PIN</Text>
            {renderPinDots()}
            {attempts > 0 && attempts < maxAttempts && (
              <Text style={styles.attemptsText}>
                {maxAttempts - attempts} attempts remaining
              </Text>
            )}
            {attempts >= maxAttempts && (
              <Text style={styles.lockedText}>
                Account temporarily locked
              </Text>
            )}
          </View>

          {/* Number Pad */}
          {renderNumberPad()}

          {/* Biometric Auth Button */}
          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              activeOpacity={0.7}
            >
              <Fingerprint size={32} color={Colors.primary} />
              <Text style={styles.biometricButtonText}>
                Use {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          {/* Clear Button */}
          <TouchableOpacity
            style={[styles.clearButton, attempts >= maxAttempts && styles.disabledButton]}
            onPress={handleClear}
            activeOpacity={attempts >= maxAttempts ? 1 : 0.7}
            disabled={attempts >= maxAttempts}
          >
            <Text style={[styles.clearButtonText, attempts >= maxAttempts && styles.disabledText]}>
              Clear
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure access to your work data
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
  pinSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  pinLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 24,
    fontWeight: '600',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  shaking: {
    // Animation would be handled by Animated API in a real implementation
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  attemptsText: {
    color: '#fbbf24',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '500',
  },
  lockedText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backspaceButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  backspaceText: {
    fontSize: 20,
    color: '#ef4444',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  biometricButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
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