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

const slides: Slide[] = [
  {
    id: 1,
    icon: Zap,
    title: 'Welcome to Oliva Refrigeration',
    description: 'Your complete HVAC business management solution',
    features: [
      'Streamline operations and boost efficiency',
      'Manage jobs, customers, and invoices in one place',
      'Real-time tracking and updates',
      'Built for success and growth',
    ],
    color: Colors.primary,
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Smart Job Management',
    description: 'Never miss a job or appointment',
    features: [
      'Schedule and dispatch jobs instantly',
      'Track job status in real-time',
      'Priority-based job organization',
      'Automated reminders and notifications',
    ],
    color: '#10b981',
  },
  {
    id: 3,
    icon: Users,
    title: 'Customer Excellence',
    description: 'Build lasting relationships',
    features: [
      'Complete customer profiles and history',
      'Equipment tracking and maintenance logs',
      'Quick access to customer information',
      'Service history at your fingertips',
    ],
    color: '#8b5cf6',
  },
  {
    id: 4,
    icon: FileText,
    title: 'Effortless Invoicing',
    description: 'Get paid faster',
    features: [
      'Create professional invoices on-site',
      'Digital signatures for instant approval',
      'Track payments and outstanding balances',
      'Automated payment reminders',
    ],
    color: '#f59e0b',
  },
  {
    id: 5,
    icon: MapPin,
    title: 'Live Technician Tracking',
    description: 'Know where your team is',
    features: [
      'Real-time GPS location tracking',
      'Optimize routes and reduce travel time',
      'Monitor technician availability',
      'Improve response times',
    ],
    color: '#ef4444',
  },
  {
    id: 6,
    icon: TrendingUp,
    title: 'Powerful Analytics',
    description: 'Make data-driven decisions',
    features: [
      'Revenue and performance insights',
      'Job completion metrics',
      'Customer satisfaction tracking',
      'Identify growth opportunities',
    ],
    color: '#06b6d4',
  },
  {
    id: 7,
    icon: MessageSquare,
    title: 'Team Collaboration',
    description: 'Stay connected with your team',
    features: [
      'In-app messaging between office and field',
      'Job notes and comments',
      'Photo sharing for documentation',
      'Instant communication',
    ],
    color: '#ec4899',
  },
  {
    id: 8,
    icon: Shield,
    title: 'Offline Capabilities',
    description: 'Work anywhere, anytime',
    features: [
      'Full offline functionality',
      'Automatic sync when online',
      'Never lose data',
      'Reliable in any condition',
    ],
    color: '#14b8a6',
  },
  {
    id: 9,
    icon: CheckCircle,
    title: 'Ready to Transform Your Business?',
    description: 'Join successful HVAC companies using Oliva',
    features: [
      'Increase efficiency by up to 40%',
      'Reduce paperwork and admin time',
      'Improve customer satisfaction',
      'Grow your revenue',
    ],
    color: Colors.primary,
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
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
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Main Content */}
          <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: currentSlide.color }]}>
              <IconComponent size={64} color="#ffffff" />
            </View>

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
              {currentIndex + 1} of {slides.length}
            </Text>

            {/* Next/Get Started Button */}
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
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
