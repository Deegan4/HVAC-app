import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Calendar,
  FileText,
  MapPin,
  MessageCircle,
  BarChart3,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';
import { HapticFeedback } from '@/utils/HapticFeedback';
import { useTranslation, Language } from '@/constants/translations';

interface OnboardingStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

const ONBOARDING_STEP_KEYS: OnboardingStep[] = [
  { id: 'customers', titleKey: 'customerExcellenceTitle', descriptionKey: 'customerExcellenceDescription', icon: Users, color: '#0066CC' },
  { id: 'scheduling', titleKey: 'jobManagementTitle', descriptionKey: 'jobManagementDescription', icon: Calendar, color: '#10B981' },
  { id: 'invoicing', titleKey: 'invoicingTitle', descriptionKey: 'invoicingDescription', icon: FileText, color: '#F59E0B' },
  { id: 'tracking', titleKey: 'trackingTitle', descriptionKey: 'trackingDescription', icon: MapPin, color: '#EF4444' },
  { id: 'messaging', titleKey: 'collaborationTitle', descriptionKey: 'collaborationDescription', icon: MessageCircle, color: '#8B5CF6' },
  { id: 'reports', titleKey: 'analyticsTitle', descriptionKey: 'analyticsDescription', icon: BarChart3, color: '#06B6D4' },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  language?: Language;
}

export default function OnboardingTutorial({ onComplete, language = 'en' }: OnboardingTutorialProps) {
  const { colors } = useTheme();
  const t = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    HapticFeedback.light();
    
    if (currentStep < ONBOARDING_STEP_KEYS.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      HapticFeedback.success();
      onComplete();
    }
  };

  const handleSkip = () => {
    HapticFeedback.selection();
    onComplete();
  };

  const handleDotPress = (index: number) => {
    if (index === currentStep) return;
    HapticFeedback.selection();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const step = ONBOARDING_STEP_KEYS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEP_KEYS.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.text.secondary }]}>{t.skip}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: step.color + '15' }]}>
            <View style={[styles.iconInner, { backgroundColor: step.color + '25' }]}>
              <IconComponent size={64} color={step.color} />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>{(t as any)[step.titleKey]}</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            {(t as any)[step.descriptionKey]}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEP_KEYS.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={styles.dotButton}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentStep ? colors.primary : colors.border,
                    width: index === currentStep ? 24 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLastStep ? (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.nextButtonText}>{t.getStarted}</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentStep + 1) / ONBOARDING_STEP_KEYS.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text.light }]}>
          {currentStep + 1} {t.progressText} {ONBOARDING_STEP_KEYS.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center' as const,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dotButton: {
    padding: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  progressContainer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
});
