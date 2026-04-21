import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Phone,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  Calendar,
  PhoneCall,
  PhoneIncoming,
  Bot,
  Sparkles,
  ChevronRight,
  Volume2,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageCallDuration: string;
  customerSatisfaction: number;
  resolutionRate: number;
}

interface ServiceFeature {
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  premium?: boolean;
}

interface BusinessHours {
  enabled: boolean;
  days: {
    [key: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export default function AIAnsweringServiceScreen() {
  const [serviceEnabled, setServiceEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'analytics' | 'settings'>('overview');
  const [phoneNumber, setPhoneNumber] = useState('239-722-0762');
  const [greetingMessage, setGreetingMessage] = useState('Thank you for calling All General Contractors and Consulting. How may I assist you today?');
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    enabled: true,
    days: {
      monday: { enabled: true, start: '08:00', end: '18:00' },
      tuesday: { enabled: true, start: '08:00', end: '18:00' },
      wednesday: { enabled: true, start: '08:00', end: '18:00' },
      thursday: { enabled: true, start: '08:00', end: '18:00' },
      friday: { enabled: true, start: '08:00', end: '18:00' },
      saturday: { enabled: true, start: '09:00', end: '14:00' },
      sunday: { enabled: false, start: '09:00', end: '14:00' },
    },
  });

  const [features, setFeatures] = useState<ServiceFeature[]>([
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Never miss a call, even after business hours',
      enabled: true,
    },
    {
      icon: Zap,
      title: 'Instant Response',
      description: 'Zero wait time for customers',
      enabled: true,
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Support for 30+ languages',
      enabled: true,
      premium: true,
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Book appointments automatically',
      enabled: true,
    },
    {
      icon: MessageSquare,
      title: 'SMS Follow-ups',
      description: 'Send confirmation texts to customers',
      enabled: false,
    },
    {
      icon: Shield,
      title: 'Emergency Routing',
      description: 'Priority handling for urgent calls',
      enabled: true,
    },
  ]);

  const [metrics] = useState<CallMetrics>({
    totalCalls: 1247,
    answeredCalls: 1247,
    missedCalls: 0,
    averageCallDuration: '3:45',
    customerSatisfaction: 4.8,
    resolutionRate: 92,
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('ai_answering_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setServiceEnabled(settings.serviceEnabled ?? true);
        setPhoneNumber(settings.phoneNumber ?? phoneNumber);
        setGreetingMessage(settings.greetingMessage ?? greetingMessage);
        setBusinessHours(settings.businessHours ?? businessHours);
      }
    } catch (error) {
      console.log('Error loading AI answering settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        serviceEnabled,
        phoneNumber,
        greetingMessage,
        businessHours,
      };
      await AsyncStorage.setItem('ai_answering_settings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const toggleFeature = (index: number) => {
    const updated = [...features];
    updated[index].enabled = !updated[index].enabled;
    setFeatures(updated);
  };

  const testCall = () => {
    Alert.alert(
      'Test Call',
      'Would you like to place a test call to experience the AI answering service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Alert.alert('Calling...', `Dialing ${phoneNumber}`);
          },
        },
      ]
    );
  };

  const animatedStyle = { opacity: fadeAnim };

  const renderOverview = () => (
    <Animated.View style={animatedStyle}>
      {/* Service Status Card */}
      <View style={[styles.card, serviceEnabled ? styles.cardActive : styles.cardInactive]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusLeft}>
            <Bot size={32} color={serviceEnabled ? Colors.primary : Colors.text.secondary} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>AI Service Status</Text>
              <Text style={[styles.statusText, { color: serviceEnabled ? Colors.status.success : Colors.text.secondary }]}>
                {serviceEnabled ? 'Active & Answering Calls' : 'Service Disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={serviceEnabled}
            onValueChange={setServiceEnabled}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={serviceEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
        
        {serviceEnabled && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <PhoneIncoming size={24} color={Colors.status.success} />
          <Text style={styles.statValue}>{metrics.totalCalls}</Text>
          <Text style={styles.statLabel}>Total Calls</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{metrics.averageCallDuration}</Text>
          <Text style={styles.statLabel}>Avg Duration</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={Colors.status.warning} />
          <Text style={styles.statValue}>{metrics.resolutionRate}%</Text>
          <Text style={styles.statLabel}>Resolution Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={24} color={Colors.accent} />
          <Text style={styles.statValue}>{metrics.customerSatisfaction}</Text>
          <Text style={styles.statLabel}>Satisfaction</Text>
        </View>
      </View>

      {/* Key Benefits */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Benefits</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.status.success} />
            <Text style={styles.benefitText}>Never miss a customer call</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.status.success} />
            <Text style={styles.benefitText}>Reduce wait times to zero</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.status.success} />
            <Text style={styles.benefitText}>Handle unlimited calls simultaneously</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.status.success} />
            <Text style={styles.benefitText}>Automatic appointment scheduling</Text>
          </View>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.status.success} />
            <Text style={styles.benefitText}>Seamless CRM integration</Text>
          </View>
        </View>
      </View>

      {/* Test Call Button */}
      <TouchableOpacity style={styles.testCallButton} onPress={testCall}>
        <Phone size={20} color={Colors.text.inverse} />
        <Text style={styles.testCallText}>Test AI Service</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFeatures = () => (
    <View>
      <Text style={styles.sectionDescription}>
        Customize your AI answering service with powerful features
      </Text>
      
      {features.map((feature, index) => (
        <View key={index} style={styles.featureCard}>
          <View style={styles.featureLeft}>
            <View style={[styles.featureIcon, feature.premium && styles.premiumIcon]}>
              <feature.icon size={24} color={feature.premium ? Colors.accent : Colors.primary} />
            </View>
            <View style={styles.featureInfo}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                {feature.premium && (
                  <View style={styles.premiumBadge}>
                    <Sparkles size={12} color={Colors.accent} />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
          <Switch
            value={feature.enabled}
            onValueChange={() => toggleFeature(index)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={feature.enabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
      ))}

      {/* Integration Options */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Integrations</Text>
        <TouchableOpacity style={styles.integrationItem}>
          <Text style={styles.integrationName}>Connect to CRM</Text>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.integrationItem}>
          <Text style={styles.integrationName}>Calendar Sync</Text>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.integrationItem}>
          <Text style={styles.integrationName}>SMS Gateway</Text>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View>
      <Text style={styles.sectionDescription}>
        Monitor your AI service performance and customer interactions
      </Text>

      {/* Performance Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Month&apos;s Performance</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Calls Handled</Text>
          <Text style={styles.metricValue}>{metrics.totalCalls}</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Answer Rate</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>100%</Text>
            <Text style={styles.metricChange}>+15%</Text>
          </View>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Avg Response Time</Text>
          <Text style={styles.metricValue}>0.5s</Text>
        </View>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Customer Satisfaction</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>4.8/5.0</Text>
            <Text style={styles.metricChange}>+0.3</Text>
          </View>
        </View>
      </View>

      {/* Call Types Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Call Types</Text>
        
        <View style={styles.callTypeItem}>
          <View style={styles.callTypeLeft}>
            <View style={[styles.callTypeDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.callTypeLabel}>Service Inquiries</Text>
          </View>
          <Text style={styles.callTypeValue}>45%</Text>
        </View>
        
        <View style={styles.callTypeItem}>
          <View style={styles.callTypeLeft}>
            <View style={[styles.callTypeDot, { backgroundColor: Colors.status.warning }]} />
            <Text style={styles.callTypeLabel}>Emergency Calls</Text>
          </View>
          <Text style={styles.callTypeValue}>25%</Text>
        </View>
        
        <View style={styles.callTypeItem}>
          <View style={styles.callTypeLeft}>
            <View style={[styles.callTypeDot, { backgroundColor: Colors.status.success }]} />
            <Text style={styles.callTypeLabel}>Appointments</Text>
          </View>
          <Text style={styles.callTypeValue}>20%</Text>
        </View>
        
        <View style={styles.callTypeItem}>
          <View style={styles.callTypeLeft}>
            <View style={[styles.callTypeDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.callTypeLabel}>General Info</Text>
          </View>
          <Text style={styles.callTypeValue}>10%</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Calls</Text>
        
        <View style={styles.recentCall}>
          <PhoneIncoming size={20} color={Colors.status.success} />
          <View style={styles.recentCallInfo}>
            <Text style={styles.recentCallName}>Emergency Service</Text>
            <Text style={styles.recentCallTime}>2 minutes ago • Scheduled</Text>
          </View>
        </View>
        
        <View style={styles.recentCall}>
          <PhoneCall size={20} color={Colors.primary} />
          <View style={styles.recentCallInfo}>
            <Text style={styles.recentCallName}>Quote Request</Text>
            <Text style={styles.recentCallTime}>15 minutes ago • Info sent</Text>
          </View>
        </View>
        
        <View style={styles.recentCall}>
          <PhoneIncoming size={20} color={Colors.status.success} />
          <View style={styles.recentCallInfo}>
            <Text style={styles.recentCallName}>Maintenance Inquiry</Text>
            <Text style={styles.recentCallTime}>1 hour ago • Appointment booked</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View>
      <Text style={styles.sectionDescription}>
        Configure your AI answering service settings
      </Text>

      {/* Phone Number */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          placeholderTextColor={Colors.text.light}
        />
      </View>

      {/* Greeting Message */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Greeting Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={greetingMessage}
          onChangeText={setGreetingMessage}
          placeholder="Enter greeting message"
          placeholderTextColor={Colors.text.light}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={styles.playButton}>
          <Volume2 size={16} color={Colors.primary} />
          <Text style={styles.playButtonText}>Preview Voice</Text>
        </TouchableOpacity>
      </View>

      {/* Business Hours */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Business Hours</Text>
          <Switch
            value={businessHours.enabled}
            onValueChange={(value) => setBusinessHours({ ...businessHours, enabled: value })}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={businessHours.enabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
        
        {businessHours.enabled && (
          <View style={styles.hoursContainer}>
            {Object.entries(businessHours.days).map(([day, hours]) => (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <View style={styles.dayHours}>
                  <Switch
                    value={hours.enabled}
                    onValueChange={(value) => {
                      const updated = { ...businessHours };
                      updated.days[day].enabled = value;
                      setBusinessHours(updated);
                    }}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={hours.enabled ? Colors.primary : '#f4f3f4'}
                    style={styles.daySwitch}
                  />
                  {hours.enabled && (
                    <Text style={styles.hoursText}>{hours.start} - {hours.end}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Voice Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Voice Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Voice Type</Text>
          <TouchableOpacity style={styles.settingValue}>
            <Text style={styles.settingValueText}>Professional Female</Text>
            <ChevronRight size={16} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Speaking Speed</Text>
          <TouchableOpacity style={styles.settingValue}>
            <Text style={styles.settingValueText}>Normal</Text>
            <ChevronRight size={16} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Language</Text>
          <TouchableOpacity style={styles.settingValue}>
            <Text style={styles.settingValueText}>English (US)</Text>
            <ChevronRight size={16} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'AI Answering Service',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'features' && styles.activeTab]}
              onPress={() => setActiveTab('features')}
            >
              <Text style={[styles.tabText, activeTab === 'features' && styles.activeTabText]}>
                Features
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
              onPress={() => setActiveTab('analytics')}
            >
              <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
                Analytics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'features' && renderFeatures()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    padding: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardInactive: {
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    gap: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusText: {
    fontSize: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.success,
  },
  liveText: {
    fontSize: 12,
    color: Colors.status.success,
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  testCallButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  testCallText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIcon: {
    backgroundColor: Colors.accentLight,
  },
  featureInfo: {
    flex: 1,
    marginRight: 8,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  integrationName: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricChange: {
    fontSize: 12,
    color: Colors.status.success,
    fontWeight: '500' as const,
  },
  callTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  callTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  callTypeLabel: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  callTypeValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  recentCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentCallInfo: {
    flex: 1,
  },
  recentCallName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  recentCallTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  hoursContainer: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 14,
    color: Colors.text.primary,
    width: 100,
  },
  dayHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  daySwitch: {
    transform: [{ scale: 0.8 }],
  },
  hoursText: {
    fontSize: 13,
    color: Colors.text.secondary,
    minWidth: 100,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});