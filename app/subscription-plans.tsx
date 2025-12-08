import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Check, Star, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';
import { useAppStore } from '@/hooks/app-store';
import { SubscriptionPlan } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { HapticFeedback } from '@/utils/HapticFeedback';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  userCount: string;
  originalPrice: number;
  discountedPrice: number;
  priceSubtext: string;
  recommended?: boolean;
  features: PlanFeature[];
  featuresHeader?: string;
  addOns?: string[];
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    userCount: '1 user',
    originalPrice: 79,
    discountedPrice: 25,
    priceSubtext: 'first month',
    features: [
      { text: 'Customer management', included: true },
      { text: 'Job scheduling & dispatching', included: true },
      { text: 'Invoice creation & tracking', included: true },
      { text: 'Price book management', included: true },
      { text: 'Equipment tracking', included: true },
      { text: 'Service history logs', included: true },
      { text: 'Photo & signature capture', included: true },
      { text: 'Mobile app access', included: true },
    ],
  },
  {
    id: 'essentials',
    name: 'Essentials',
    userCount: '1-5 users',
    originalPrice: 189,
    discountedPrice: 25,
    priceSubtext: 'first month',
    featuresHeader: 'All Basic features, plus:',
    features: [
      { text: 'Team management & permissions', included: true },
      { text: 'Real-time GPS tracking', included: true },
      { text: 'Team messaging system', included: true },
      { text: 'QuickBooks integration', included: true },
      { text: 'Reports & analytics', included: true },
      { text: 'Calendar & scheduling tools', included: true },
      { text: 'Multi-technician support', included: true },
    ],
  },
  {
    id: 'max',
    name: 'MAX',
    userCount: 'Unlimited users',
    originalPrice: 329,
    discountedPrice: 99,
    priceSubtext: 'per month for 3 months',
    recommended: true,
    featuresHeader: 'All Essential features, plus:',
    features: [
      { text: 'AI-powered answering service', included: true },
      { text: 'Advanced performance analytics', included: true },
      { text: 'Custom service settings', included: true },
      { text: 'Import/Export data tools', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced reporting suite', included: true },
    ],
    addOns: [
      'Custom branding',
      'API access',
    ],
  },
];

export default function SubscriptionPlansScreen() {
  const { colors } = useTheme();
  const { subscription, setSubscription } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(subscription?.plan ?? null);

  const subscribeMutation = useMutation({
    mutationFn: async (planId: SubscriptionPlan) => {
      await setSubscription(planId);
      return planId;
    },
    onSuccess: (planId) => {
      HapticFeedback.success();
      const planName = PLANS.find(p => p.id === planId)?.name ?? 'Plan';
      Alert.alert(
        '🎉 Subscription Activated!',
        `You are now subscribed to the ${planName} plan. Your 30-day free trial has started.`,
        [
          {
            text: 'Start Using App',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: () => {
      HapticFeedback.error();
      Alert.alert(
        'Subscription Failed',
        'There was an error activating your subscription. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    HapticFeedback.medium();
    Alert.alert(
      'Confirm Subscription',
      `Start your 30-day free trial of the ${PLANS.find(p => p.id === planId)?.name} plan?\n\nYou won\'t be charged until your trial ends.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Free Trial',
          onPress: () => subscribeMutation.mutate(planId as SubscriptionPlan),
        },
      ]
    );
  };

  const isCurrentPlan = (planId: string) => subscription?.plan === planId;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Subscription Plans',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text.primary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text.primary }]}>
            Choose the plan that fits your business needs.{' '}
            <Text style={styles.boldText}>Most popular: MAX plan</Text>
          </Text>
          <Text style={[styles.subheaderText, { color: colors.text.secondary }]}>
            All plans include core features. Upgrade anytime as your business grows.
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            const savings = plan.originalPrice - plan.discountedPrice;
            
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: plan.recommended ? colors.text.primary : colors.border,
                    borderWidth: plan.recommended ? 2 : 1,
                  },
                  index < PLANS.length - 1 && styles.planCardMargin,
                ]}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: colors.text.primary }]}>
                    {plan.name}
                  </Text>
                  {plan.recommended && (
                    <View style={[styles.recommendedBadge, { backgroundColor: colors.text.primary }]}>
                      <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </View>

                <View style={styles.userCountContainer}>
                  <Text style={[styles.userCount, { color: colors.text.primary }]}>
                    {plan.userCount}
                  </Text>
                </View>

                <View style={styles.pricingContainer}>
                  <Text style={[styles.originalPrice, { color: colors.text.secondary }]}>
                    ${plan.originalPrice}
                  </Text>
                  <View style={styles.currentPriceRow}>
                    <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                      ${plan.discountedPrice}
                    </Text>
                    <View style={[styles.savingsBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                      <Text style={[styles.savingsText, { color: colors.success }]}>
                        Save ${savings}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.priceSubtext, { color: colors.text.secondary }]}>
                    {plan.priceSubtext}
                  </Text>
                </View>

                {isCurrentPlan(plan.id) ? (
                  <View style={[styles.currentPlanButton, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                    <CheckCircle size={18} color={colors.success} />
                    <Text style={[styles.currentPlanText, { color: colors.success }]}>
                      Current Plan
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      { 
                        backgroundColor: isSelected || plan.recommended ? colors.primary : colors.border,
                      },
                      subscribeMutation.isPending && { opacity: 0.7 },
                    ]}
                    onPress={() => handleSubscribe(plan.id)}
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending && selectedPlan === plan.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[
                        styles.selectButtonText,
                        { color: isSelected || plan.recommended ? '#FFFFFF' : colors.text.secondary }
                      ]}>
                        {isSelected ? 'Start Free Trial' : 'Select Plan'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                <View style={styles.featuresContainer}>
                  <Text style={[styles.featuresTitle, { color: colors.text.primary }]}>
                    Key Features
                  </Text>
                  
                  {plan.featuresHeader && (
                    <Text style={[styles.featuresHeader, { color: colors.text.primary }]}>
                      {plan.featuresHeader}
                    </Text>
                  )}

                  {plan.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureRow}>
                      <Check size={18} color={colors.primary} strokeWidth={3} />
                      <Text style={[styles.featureText, { color: colors.text.primary }]}>
                        {feature.text}
                      </Text>
                    </View>
                  ))}

                  {plan.addOns && plan.addOns.length > 0 && (
                    <>
                      <Text style={[styles.addOnsTitle, { color: colors.text.primary }]}>
                        Add-ons included:
                      </Text>
                      {plan.addOns.map((addOn, addOnIndex) => (
                        <View key={addOnIndex} style={styles.featureRow}>
                          <Check size={18} color={colors.primary} strokeWidth={3} />
                          <Text style={[styles.featureText, { color: colors.text.primary }]}>
                            {addOn}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 12,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700' as const,
  },
  subheaderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  linkText: {
    textDecorationLine: 'underline' as const,
  },
  plansContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planCardMargin: {
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  userCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userCount: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  pricingContainer: {
    marginBottom: 20,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through' as const,
    marginBottom: 4,
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 56,
    fontWeight: '700' as const,
  },
  savingsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  priceSubtext: {
    fontSize: 15,
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 24,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  featuresContainer: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  featuresHeader: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  addOnsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  currentPlanButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    gap: 8,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
