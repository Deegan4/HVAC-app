import React, { useState } from 'react';
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

interface PinAuthScreenProps {
  onAuthenticate: (pin: string) => Promise<boolean>;
}

export default function PinAuthScreen({ onAuthenticate }: PinAuthScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const maxPinLength = 4;
  const maxAttempts = 5;

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
              Enter your PIN to access Oliva Refrigeration
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