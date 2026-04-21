import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Wrench,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore, useJobStats, useRevenueStats } from '@/hooks/app-store';

const { width } = Dimensions.get('window');

export default function ReportsAnalyticsScreen() {
  const { jobs, invoices, customers } = useAppStore();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      if (role === 'technician') {
        Alert.alert(
          'Access Denied',
          'This feature is only available to owners and managers.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };
    checkRole();
  }, []);
  const jobStats = useJobStats();
  const revenueStats = useRevenueStats();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const periods = [
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
    { key: 'year' as const, label: 'This Year' },
  ];

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = Colors.primary }: {
    icon: any;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
  }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon size={20} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const ChartBar = ({ label, value, maxValue, color }: {
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }) => {
    const barWidth = maxValue > 0 ? (value / maxValue) * (width - 80) : 0;
    
    return (
      <View style={styles.chartBarContainer}>
        <Text style={styles.chartLabel}>{label}</Text>
        <View style={styles.chartBarTrack}>
          <View 
            style={[
              styles.chartBarFill, 
              { width: barWidth, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={styles.chartValue}>{value}</Text>
      </View>
    );
  };

  const jobStatusData = [
    { label: 'Completed', value: jobStats.completed, color: Colors.status.completed },
    { label: 'In Progress', value: jobStats.inProgress, color: Colors.status.inProgress },
    { label: 'Scheduled', value: jobStats.scheduled, color: Colors.status.scheduled },
    { label: 'Emergency', value: jobStats.emergency, color: Colors.status.emergency },
  ];

  const maxJobValue = Math.max(...jobStatusData.map(item => item.value));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Reports & Analytics',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon={DollarSign}
              title="Revenue"
              value={`$${revenueStats.monthlyPaid.toLocaleString()}`}
              subtitle={`$${revenueStats.monthlyTotal.toLocaleString()} total`}
              color={Colors.status.completed}
            />
            <MetricCard
              icon={Wrench}
              title="Projects"
              value={jobStats.total.toString()}
              subtitle={`${jobStats.completed} completed`}
              color={Colors.primary}
            />
            <MetricCard
              icon={Users}
              title="Customers"
              value={customers.length.toString()}
              subtitle="Active customers"
              color={Colors.status.inProgress}
            />
            <MetricCard
              icon={Clock}
              title="Avg Response"
              value="2.4h"
              subtitle="Response time"
              color={Colors.status.emergency}
            />
          </View>
        </View>

        {/* Job Status Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Status Breakdown</Text>
          <View style={styles.chartContainer}>
            {jobStatusData.map((item, index) => (
              <ChartBar
                key={index}
                label={item.label}
                value={item.value}
                maxValue={maxJobValue}
                color={item.color}
              />
            ))}
          </View>
        </View>

        {/* Revenue Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          <View style={styles.sectionContent}>
            <View style={styles.revenueItem}>
              <View style={styles.revenueItemLeft}>
                <CheckCircle size={16} color={Colors.status.completed} />
                <Text style={styles.revenueItemLabel}>Paid Invoices</Text>
              </View>
              <Text style={[styles.revenueItemValue, { color: Colors.status.completed }]}>
                ${revenueStats.monthlyPaid.toLocaleString()}
              </Text>
            </View>
            <View style={styles.revenueItem}>
              <View style={styles.revenueItemLeft}>
                <Clock size={16} color={Colors.status.inProgress} />
                <Text style={styles.revenueItemLabel}>Pending ({revenueStats.pending})</Text>
              </View>
              <Text style={[styles.revenueItemValue, { color: Colors.status.inProgress }]}>
                ${(revenueStats.monthlyTotal - revenueStats.monthlyPaid).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.revenueItem, styles.lastItem]}>
              <View style={styles.revenueItemLeft}>
                <TrendingUp size={16} color={Colors.status.emergency} />
                <Text style={styles.revenueItemLabel}>Overdue ({revenueStats.overdue})</Text>
              </View>
              <Text style={[styles.revenueItemValue, { color: Colors.status.emergency }]}>
                $2,450
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.sectionContent}>
            <View style={styles.insightItem}>
              <TrendingUp size={20} color={Colors.status.completed} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Revenue Growth</Text>
                <Text style={styles.insightDescription}>
                  Up 15% from last month with strong performance in general contracting services
                </Text>
              </View>
            </View>
            <View style={styles.insightItem}>
              <Clock size={20} color={Colors.status.inProgress} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Response Time</Text>
                <Text style={styles.insightDescription}>
                  Average response time improved by 30 minutes this month
                </Text>
              </View>
            </View>
            <View style={[styles.insightItem, styles.lastItem]}>
              <Users size={20} color={Colors.primary} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Customer Satisfaction</Text>
                <Text style={styles.insightDescription}>
                  95% satisfaction rate based on recent feedback surveys
                </Text>
              </View>
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 40) / 2,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: Colors.text.light,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  chartLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    width: 80,
  },
  chartBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  chartBarFill: {
    height: 8,
    borderRadius: 4,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    width: 30,
    textAlign: 'right',
  },
  revenueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  revenueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revenueItemLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  revenueItemValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});