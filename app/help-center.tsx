import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle,
  Book,
  Video,
  ExternalLink,
  Search
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function HelpCenterScreen() {
  const handleContactSupport = (method: 'phone' | 'email' | 'chat') => {
    switch (method) {
      case 'phone':
        Linking.openURL('tel:+15551234567');
        break;
      case 'email':
        Linking.openURL('mailto:support@olivarefrigeration.com');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature would be implemented here.');
        break;
    }
  };

  const handleOpenGuide = (guide: string) => {
    Alert.alert('User Guide', `Opening ${guide} guide...`);
  };

  const handleOpenVideo = (video: string) => {
    Alert.alert('Video Tutorial', `Opening ${video} tutorial...`);
  };

  const faqItems = [
    {
      question: 'How do I schedule a new job?',
      answer: 'Tap the + button on the home screen and fill in the job details including customer, date, and service type.'
    },
    {
      question: 'How do I update job status?',
      answer: 'Open the job details and tap the status button to change from scheduled to in-progress to completed.'
    },
    {
      question: 'How do I create an invoice?',
      answer: 'After completing a job, tap "Create Invoice" in the job details to generate an invoice with labor and parts.'
    },
    {
      question: 'How do I add a new customer?',
      answer: 'Go to the Customers tab and tap the + button to add customer information and equipment details.'
    },
    {
      question: 'How do I reset my PIN?',
      answer: 'Go to More > Privacy & Security > Change PIN to update your security PIN.'
    },
  ];

  const ContactOption = ({ icon: Icon, title, subtitle, onPress }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={16} color={Colors.text.light} />
    </TouchableOpacity>
  );

  const GuideItem = ({ icon: Icon, title, description, onPress }: {
    icon: any;
    title: string;
    description: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.guideItem} onPress={onPress}>
      <Icon size={20} color={Colors.primary} />
      <View style={styles.guideContent}>
        <Text style={styles.guideTitle}>{title}</Text>
        <Text style={styles.guideDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Help Center',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Search size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Search Help</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleContactSupport('chat')}
            >
              <MessageCircle size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.sectionContent}>
            <ContactOption
              icon={Phone}
              title="Call Support"
              subtitle="(555) 123-4567 • Available 24/7"
              onPress={() => handleContactSupport('phone')}
            />
            <ContactOption
              icon={Mail}
              title="Email Support"
              subtitle="support@olivarefrigeration.com"
              onPress={() => handleContactSupport('email')}
            />
            <ContactOption
              icon={MessageCircle}
              title="Live Chat"
              subtitle="Chat with our support team"
              onPress={() => handleContactSupport('chat')}
            />
          </View>
        </View>

        {/* User Guides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Guides</Text>
          <View style={styles.sectionContent}>
            <GuideItem
              icon={Book}
              title="Getting Started"
              description="Learn the basics of using the app"
              onPress={() => handleOpenGuide('Getting Started')}
            />
            <GuideItem
              icon={Book}
              title="Job Management"
              description="How to create, update, and complete jobs"
              onPress={() => handleOpenGuide('Job Management')}
            />
            <GuideItem
              icon={Book}
              title="Customer Management"
              description="Adding and managing customer information"
              onPress={() => handleOpenGuide('Customer Management')}
            />
            <GuideItem
              icon={Book}
              title="Invoicing & Payments"
              description="Creating invoices and tracking payments"
              onPress={() => handleOpenGuide('Invoicing & Payments')}
            />
          </View>
        </View>

        {/* Video Tutorials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Tutorials</Text>
          <View style={styles.sectionContent}>
            <GuideItem
              icon={Video}
              title="App Overview"
              description="5-minute overview of all features"
              onPress={() => handleOpenVideo('App Overview')}
            />
            <GuideItem
              icon={Video}
              title="Creating Your First Job"
              description="Step-by-step job creation tutorial"
              onPress={() => handleOpenVideo('Creating Your First Job')}
            />
            <GuideItem
              icon={Video}
              title="Using the Calendar"
              description="Managing your schedule effectively"
              onPress={() => handleOpenVideo('Using the Calendar')}
            />
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionContent}>
            {faqItems.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.faqItem,
                  index === faqItems.length - 1 && styles.lastItem
                ]}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Build</Text>
              <Text style={styles.appInfoValue}>2024.1.1</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Last Updated</Text>
              <Text style={styles.appInfoValue}>January 15, 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  guideDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  appInfo: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
});