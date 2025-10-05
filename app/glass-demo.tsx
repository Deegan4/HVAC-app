import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, TrendingUp, Users, DollarSign, Plus, CheckCircle, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import GlassTabBar from '@/components/GlassTabBar';
import GlassHeader from '@/components/GlassHeader';
import GlassStatCard from '@/components/GlassStatCard';
import GlassJobCard from '@/components/GlassJobCard';
import GlassFAB from '@/components/GlassFAB';
import { Job } from '@/types';

export default function GlassDemoScreen() {
  const [activeTab, setActiveTab] = useState('overview');

  const demoJob: Job = {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    address: '123 Main St, San Francisco, CA',
    type: 'repair',
    description: 'Fix leaking kitchen faucet and inspect pipes',
    status: 'scheduled',
    priority: 'normal',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM',
    technicianName: 'Mike Johnson',
  };

  const getStatusColor = (status: Job['status']) => {
    const statusMap: Record<string, string> = {
      'scheduled': Colors.status.scheduled,
      'in-progress': Colors.status.inProgress,
      'completed': Colors.status.completed,
      'cancelled': Colors.status.cancelled,
      'emergency': Colors.status.emergency,
    };
    return statusMap[status] || Colors.text.secondary;
  };

  const getStatusText = (status: Job['status']) => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Scheduled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'emergency': 'Emergency',
    };
    return statusMap[status] || status;
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      style={styles.background}
      blurRadius={0}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <GlassHeader
          title="Liquid Glass UI"
          subtitle="iOS 26 Design"
          leftAction={{
            icon: <ArrowLeft size={20} color={Colors.text.primary} />,
            onPress: () => router.back(),
          }}
          rightAction={{
            icon: <Calendar size={20} color={Colors.text.primary} />,
            onPress: () => {},
          }}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <GlassCard style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome to Liquid Glass</Text>
              <Text style={styles.welcomeText}>
                Experience the future of mobile UI with beautiful glassmorphic design inspired by iOS 26
              </Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>Stats Overview</Text>
            <View style={styles.statsGrid}>
              <GlassStatCard
                value="24"
                label="Today's Jobs"
                icon={<Calendar size={24} color={Colors.primary} />}
                color={Colors.primary}
                trend={{ value: '+12%', isPositive: true }}
              />
              <GlassStatCard
                value="$4.2K"
                label="Revenue"
                icon={<DollarSign size={24} color={Colors.success} />}
                color={Colors.success}
                trend={{ value: '+8%', isPositive: true }}
              />
            </View>

            <View style={styles.statsGrid}>
              <GlassStatCard
                value="156"
                label="Customers"
                icon={<Users size={24} color={Colors.accent} />}
                color={Colors.accent}
              />
              <GlassStatCard
                value="98%"
                label="Satisfaction"
                icon={<TrendingUp size={24} color={Colors.secondary} />}
                color={Colors.secondary}
                trend={{ value: '+2%', isPositive: true }}
              />
            </View>

            <Text style={styles.sectionTitle}>Tab Navigation</Text>
            <GlassTabBar
              tabs={[
                { key: 'overview', label: 'Overview', icon: <Calendar size={18} color={activeTab === 'overview' ? Colors.primary : Colors.text.secondary} /> },
                { key: 'stats', label: 'Stats', icon: <TrendingUp size={18} color={activeTab === 'stats' ? Colors.primary : Colors.text.secondary} /> },
                { key: 'team', label: 'Team', icon: <Users size={18} color={activeTab === 'team' ? Colors.primary : Colors.text.secondary} /> },
              ]}
              activeTab={activeTab}
              onTabPress={setActiveTab}
            />

            <Text style={styles.sectionTitle}>Job Card</Text>
            <GlassJobCard
              job={demoJob}
              onPress={() => {}}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />

            <Text style={styles.sectionTitle}>Buttons</Text>
            <View style={styles.buttonGroup}>
              <GlassButton
                title="Primary Action"
                onPress={() => {}}
                icon={<CheckCircle size={20} color={Colors.text.inverse} />}
                variant="primary"
                size="large"
              />
              <GlassButton
                title="Secondary"
                onPress={() => {}}
                icon={<Clock size={20} color={Colors.text.inverse} />}
                variant="secondary"
                size="medium"
              />
              <GlassButton
                title="Small"
                onPress={() => {}}
                variant="accent"
                size="small"
              />
            </View>

            <View style={styles.spacer} />
          </View>
        </ScrollView>

        <GlassFAB
          icon={<Plus size={28} color={Colors.text.inverse} />}
          onPress={() => {}}
          position="bottom-right"
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  spacer: {
    height: 100,
  },
});
