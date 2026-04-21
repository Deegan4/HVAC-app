import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Terms & Conditions',
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using the AGCC mobile application, 
            you agree to be bound by these Terms and Conditions. If you do not agree to these 
            terms, please do not use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            The AGCC app is a field service management tool designed for
            general contracting professionals. The app provides features including project
            scheduling, customer management, invoicing, and service tracking.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts and Security</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account 
            credentials, including your PIN and any biometric authentication settings. 
            You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Privacy and Protection</Text>
          <Text style={styles.paragraph}>
            We are committed to protecting your privacy and the privacy of your customers. 
            All data is encrypted and stored securely. We do not share your business data 
            with third parties without your explicit consent, except as required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree to use the app only for lawful business purposes related to general contracting services. You will not use the app to store or transmit 
            any unlawful, harmful, or inappropriate content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The app and its original content, features, and functionality are owned by 
            AGCC and are protected by international copyright, trademark, 
            patent, trade secret, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall AGCC be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Service Availability</Text>
          <Text style={styles.paragraph}>
            We strive to maintain high availability of our services, but we do not 
            guarantee that the app will be available at all times. We may temporarily 
            suspend access for maintenance, updates, or other operational reasons.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Updates and Modifications</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify or update these terms at any time. We will 
            notify users of significant changes through the app or via email. Continued 
            use of the app after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your access to the app immediately, without prior 
            notice, for any reason, including if you breach these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws 
            of the jurisdiction in which AGCC operates, without regard 
            to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>
            Email: legal@agcc.com{'\n'}
            Phone: (239) 722-0762
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using the AGCC app, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and Conditions.
          </Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  contactInfo: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});