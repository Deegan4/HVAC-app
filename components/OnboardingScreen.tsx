import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import SnowingBackground from './SnowingBackground';
import SpinningSnowflake from './SpinningSnowflake';
import {
  Calendar,
  Users,
  FileText,
  MapPin,
  TrendingUp,
  Zap,
  Shield,
  MessageSquare,
  CheckCircle,
} from 'lucide-react-native';
import { useAppStore } from '@/hooks/app-store';
import { useTranslation } from '@/constants/translations';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Slide {
  id: number;
  icon: any;
  title: string;
  description: string;
  features: string[];
  color: string;
}

function getSlides(t: ReturnType<typeof useTranslation>): Slide[] {
  return [
    {
      id: 1,
      icon: Zap,
      title: t.welcomeTitle,
      description: t.welcomeDescription,
      features: [
        t.welcomeFeature1,
        t.welcomeFeature2,
        t.welcomeFeature3,
        t.welcomeFeature4,
      ],
      color: Colors.primary,
    },
    {
      id: 2,
      icon: Calendar,
      title: t.jobManagementTitle,
      description: t.jobManagementDescription,
      features: [
        t.jobManagementFeature1,
        t.jobManagementFeature2,
        t.jobManagementFeature3,
        t.jobManagementFeature4,
      ],
      color: '#10b981',
    },
    {
      id: 3,
      icon: Users,
      title: t.customerExcellenceTitle,
      description: t.customerExcellenceDescription,
      features: [
        t.customerExcellenceFeature1,
        t.customerExcellenceFeature2,
        t.customerExcellenceFeature3,
        t.customerExcellenceFeature4,
      ],
      color: '#8b5cf6',
    },
    {
      id: 4,
      icon: FileText,
      title: t.invoicingTitle,
      description: t.invoicingDescription,
      features: [
        t.invoicingFeature1,
        t.invoicingFeature2,
        t.invoicingFeature3,
        t.invoicingFeature4,
      ],
      color: '#f59e0b',
    },
    {
      id: 5,
      icon: MapPin,
      title: t.trackingTitle,
      description: t.trackingDescription,
      features: [
        t.trackingFeature1,
        t.trackingFeature2,
        t.trackingFeature3,
        t.trackingFeature4,
      ],
      color: '#ef4444',
    },
    {
      id: 6,
      icon: TrendingUp,
      title: t.analyticsTitle,
      description: t.analyticsDescription,
      features: [
        t.analyticsFeature1,
        t.analyticsFeature2,
        t.analyticsFeature3,
        t.analyticsFeature4,
      ],
      color: '#06b6d4',
    },
    {
      id: 7,
      icon: MessageSquare,
      title: t.collaborationTitle,
      description: t.collaborationDescription,
      features: [
        t.collaborationFeature1,
        t.collaborationFeature2,
        t.collaborationFeature3,
        t.collaborationFeature4,
      ],
      color: '#ec4899',
    },
    {
      id: 8,
      icon: Shield,
      title: t.offlineTitle,
      description: t.offlineDescription,
      features: [
        t.offlineFeature1,
        t.offlineFeature2,
        t.offlineFeature3,
        t.offlineFeature4,
      ],
      color: '#14b8a6',
    },
    {
      id: 9,
      icon: CheckCircle,
      title: t.readyTitle,
      description: t.readyDescription,
      features: [
        t.readyFeature1,
        t.readyFeature2,
        t.readyFeature3,
        t.readyFeature4,
      ],
      color: Colors.primary,
    },
  ];
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const slides = getSlides(t);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const currentSlide = slides[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <SnowingBackground snowflakeCount={25}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Skip Button */}
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{t.skip}</Text>
            </TouchableOpacity>
          )}

          {/* Main Content */}
          <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
            {/* Icon or Logo */}
            {currentIndex === 0 ? (
              <View style={styles.logoContainer}>
                <SpinningSnowflake size={180} color="#DC2626" duration={3000} />
              </View>
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: currentSlide.color }]}>
                <IconComponent size={64} color="#ffffff" />
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{currentSlide.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentSlide.description}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {currentSlide.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.checkIcon, { backgroundColor: currentSlide.color }]}>
                    <CheckCircle size={16} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {slides.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotPress(index)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dot,
                      index === currentIndex && styles.dotActive,
                      index === currentIndex && { backgroundColor: currentSlide.color },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Progress Text */}
            <Text style={styles.progressText}>
              {currentIndex + 1} {t.progressText} {slides.length}
            </Text>

            {/* Next/Get Started Button */}
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === slides.length - 1 ? t.getStarted : t.next}
              </Text>
            </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    padding: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  nextButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
