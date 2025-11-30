import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  targetRoute?: string;
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action?: () => void;
  actionLabel?: string;
}

interface AppTourProps {
  visible: boolean;
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
}

export default function AppTour({ visible, steps, onComplete, onSkip, currentStep: initialStep = 0 }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, currentStep, fadeAnim, scaleAnim]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const step = steps[nextStepIndex];
      
      if (step.targetRoute) {
        router.push(step.targetRoute as any);
      }
      
      setCurrentStep(nextStepIndex);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      const step = steps[prevStepIndex];
      
      if (step.targetRoute) {
        router.push(step.targetRoute as any);
      }
      
      setCurrentStep(prevStepIndex);
    }
  };

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
      setCurrentStep(0);
    });
  };

  const handleSkip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSkip();
      setCurrentStep(0);
    });
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
    }
    handleNext();
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={handleSkip}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  {step.icon || <Sparkles size={24} color={Colors.primary} />}
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.stepCounter}>
                    Step {currentStep + 1} of {steps.length}
                  </Text>
                  <Text style={styles.title}>{step.title}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              <Text style={styles.description}>{step.description}</Text>
              
              {step.actionLabel && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAction}
                >
                  <Text style={styles.actionButtonText}>{step.actionLabel}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.dotsContainer}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentStep && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.actions}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handlePrevious}
                    style={styles.secondaryButton}
                  >
                    <ChevronLeft size={20} color={Colors.primary} />
                    <Text style={styles.secondaryButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.spacer} />

                {currentStep < steps.length - 1 ? (
                  <TouchableOpacity
                    onPress={handleNext}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Next</Text>
                    <ChevronRight size={20} color={Colors.text.inverse} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleComplete}
                    style={[styles.primaryButton, styles.completeButton]}
                  >
                    <Check size={20} color={Colors.text.inverse} />
                    <Text style={styles.primaryButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: width - 32,
    maxWidth: 500,
    maxHeight: height * 0.8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  content: {
    maxHeight: height * 0.4,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
