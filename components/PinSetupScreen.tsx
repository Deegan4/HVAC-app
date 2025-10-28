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
import { Colors } from '@/constants/colors';
import SpinningSnowflake from './SpinningSnowflake';
import SnowingBackground from './SnowingBackground';

interface PinSetupScreenProps {
  onPinSet: (pin: string) => Promise<void>;
  isFirstTime?: boolean;
  userRole?: string;
}

export default function PinSetupScreen({ onPinSet, isFirstTime = true, userRole }: PinSetupScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const maxPinLength = 4;

  const handleNumberPress = (number: string) => {
    if (isConfirming) {
      if (confirmPin.length < maxPinLength) {
        setConfirmPin(prev => prev + number);
      }
    } else {
      if (pin.length < maxPinLength) {
        setPin(prev => prev + number);
      }
    }
  };

  const handleBackspace = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (isConfirming) {
      setConfirmPin('');
    } else {
      setPin('');
    }
  };

  useEffect(() => {
    if (pin.length === maxPinLength && !isConfirming) {
      setTimeout(() => {
        setIsConfirming(true);
      }, 300);
    }
  }, [pin, isConfirming]);

  useEffect(() => {
    if (confirmPin.length === maxPinLength && isConfirming) {
      setTimeout(async () => {
        if (pin === confirmPin) {
          console.log('PinSetupScreen - PIN matches, calling onPinSet');
          await onPinSet(pin);
          console.log('PinSetupScreen - onPinSet completed');
        } else {
          if (Platform.OS !== 'web') {
            Vibration.vibrate(500);
          }
          Alert.alert(
            'PIN Mismatch',
            'The PINs you entered do not match. Please try again.',
            [{
              text: 'OK',
              onPress: () => {
                setPin('');
                setConfirmPin('');
                setIsConfirming(false);
                setAttempts(prev => prev + 1);
              }
            }]
          );
        }
      }, 300);
    }
  }, [confirmPin, pin, onPinSet, isConfirming]);

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: maxPinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < currentPin.length ? Colors.primary : 'transparent',
                borderColor: Colors.primary,
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
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                isBackspace && styles.backspaceButton
              ]}
              onPress={() => {
                if (isBackspace) {
                  handleBackspace();
                } else {
                  handleNumberPress(num);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.numberButtonText,
                isBackspace && styles.backspaceText
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
            <Text style={styles.title}>Oliva Refrigeration</Text>
            <Text style={styles.subtitle}>
              {isFirstTime 
                ? `Welcome ${userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''}! Set up your security PIN`
                : 'Enter your PIN to continue'
              }
            </Text>
          </View>

          {/* PIN Input */}
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>
              {isConfirming ? 'Confirm your PIN' : (isFirstTime ? 'Create a 4-digit PIN' : 'Enter PIN')}
            </Text>
            {renderPinDots(isConfirming ? confirmPin : pin)}
            {attempts > 0 && (
              <Text style={styles.attemptsText}>
                Attempts: {attempts}
              </Text>
            )}
          </View>

          {/* Number Pad */}
          {renderNumberPad()}

          {/* Clear Button */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your PIN keeps your work data secure
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
  numberButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  backspaceText: {
    fontSize: 20,
    color: '#ef4444',
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