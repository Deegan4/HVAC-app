import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ChevronRight, Check, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export interface ProgressiveTourStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  targetRoute?: string;
  position?: 'top' | 'center' | 'bottom';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
  action?: () => void;
  actionLabel?: string;
  completedMessage?: string;
}

interface ProgressiveTourProps {
  visible: boolean;
  step: ProgressiveTourStep;
  totalSteps: number;
  currentStepNumber: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete?: () => void;
  isLastStep?: boolean;
}

export default function ProgressiveTour({
  visible,
  step,
  totalSteps,
  currentStepNumber,
  onNext,
  onSkip,
  onComplete,
  isLastStep = false,
}: ProgressiveTourProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spotlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(spotlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      spotlightAnim.setValue(0);
    }
  }, [visible, fadeAnim, slideAnim, pulseAnim, spotlightAnim]);

  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (step.targetRoute) {
        router.push(step.targetRoute as any);
      }
      
      if (isLastStep && onComplete) {
        onComplete();
      } else {
        onNext();
      }
    });
  };

  const handleSkip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  const handleAction = () => {
    if (step.action) {
      step.action();
    }
    handleNext();
  };

  if (!visible) return null;

  const progress = (currentStepNumber / totalSteps) * 100;
  const cardPosition = step.position || 'bottom';

  const getCardStyle = () => {
    switch (cardPosition) {
      case 'top':
        return { top: 100 };
      case 'center':
        return { top: height / 2 - 150 };
      case 'bottom':
      default:
        return { bottom: 100 };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.95],
              }),
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]} />
          )}
        </Animated.View>

        {step.highlightArea && (
          <Animated.View
            style={[
              styles.spotlight,
              {
                left: step.highlightArea.x,
                top: step.highlightArea.y,
                width: step.highlightArea.width,
                height: step.highlightArea.height,
                borderRadius: step.highlightArea.borderRadius || 12,
                opacity: spotlightAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.spotlightRing} />
            <View style={[styles.spotlightRing, styles.spotlightRingOuter]} />
          </Animated.View>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.skipButtonGradient}
          >
            <Text style={styles.skipButtonText}>Skip Tour</Text>
            <X size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.card,
            getCardStyle(),
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
            style={styles.cardGradient}
          >
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary || Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Text style={styles.progressText}>
                {currentStepNumber} of {totalSteps}
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconGlow} />
                {step.icon || <Sparkles size={32} color={Colors.primary} />}
              </View>

              <Text style={styles.title}>{step.title}</Text>
              
              <ScrollView
                style={styles.descriptionContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.descriptionContent}
              >
                <Text style={styles.description}>{step.description}</Text>
              </ScrollView>

              {step.actionLabel && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAction}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.primaryLight, Colors.primary + '40']}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>{step.actionLabel}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <View style={styles.dotsContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index + 1 === currentStepNumber && styles.dotActive,
                      index + 1 < currentStepNumber && styles.dotCompleted,
                    ]}
                  >
                    {index + 1 < currentStepNumber && (
                      <Check size={8} color="#fff" />
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                style={styles.nextButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLastStep 
                    ? [Colors.success, Colors.success + 'dd']
                    : [Colors.primary, Colors.secondary || Colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {isLastStep ? 'Complete Tour' : 'Next'}
                  </Text>
                  {isLastStep ? (
                    <Check size={20} color="#fff" />
                  ) : (
                    <ChevronRight size={20} color="#fff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  spotlightRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    opacity: 0.3,
  },
  spotlightRingOuter: {
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 20,
    opacity: 0.15,
  },
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  cardGradient: {
    padding: 24,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    minWidth: 50,
    textAlign: 'right',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  descriptionContainer: {
    maxHeight: 120,
    marginBottom: 20,
  },
  descriptionContent: {
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  footer: {
    gap: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 28,
    borderRadius: 5,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
  },
  nextButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
