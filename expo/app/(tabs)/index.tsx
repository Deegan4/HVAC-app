import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Plus, 
  Calendar, 
  FileText, 
  Wrench, 
  FolderOpen,
  ListFilter,
} from 'lucide-react-native';
import { useAppStore } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { Job } from '@/types';

import Svg, { Circle, Path, Line, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { jobs, invoices, getUpcomingJobs } = useAppStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const upcomingJobs = useMemo(() => getUpcomingJobs(), [jobs, getUpcomingJobs]);

  const openInvoices = useMemo(() => {
    return invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  }, [invoices]);

  const openInvoicesTotal = useMemo(() => {
    return openInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [openInvoices]);

  const scheduledJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'scheduled' || job.status === 'in-progress');
  }, [jobs]);

  const scheduledJobsValue = useMemo(() => {
    return jobs.filter(job => job.status === 'scheduled').reduce((sum, job) => {
      const invoice = invoices.find(inv => inv.customerId === job.customerId);
      return sum + (invoice?.total || 0);
    }, 0);
  }, [jobs, invoices]);

  const estimatesData = useMemo(() => {
    const total = invoices.length;
    const won = invoices.filter(inv => inv.status === 'paid').length;
    const wonAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const createdAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { total, won, wonAmount, createdAmount, winRate };
  }, [invoices]);

  const jobsChartData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = [2, 4, 8, 10, 6, 3, 4];
    return { months, values };
  }, []);

  const getStatusColor = (status: Job['status']) => {
    const statusMap: Record<string, string> = {
      'scheduled': colors.status.scheduled,
      'in-progress': colors.status.inProgress,
      'completed': colors.status.completed,
      'cancelled': colors.status.cancelled,
      'emergency': colors.status.emergency,
    };
    return statusMap[status] || colors.text.secondary;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderLineChart = () => {
    const { months, values } = jobsChartData;
    const chartWidth = screenWidth - 180;
    const chartHeight = 100;
    const maxValue = Math.max(...values);
    const padding = 20;
    
    const points = values.map((val, i) => {
      const x = padding + (i * (chartWidth - padding * 2)) / (values.length - 1);
      const y = chartHeight - padding - ((val / maxValue) * (chartHeight - padding * 2));
      return { x, y };
    });

    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (point.x - prev.x) / 3;
      const cpx2 = prev.x + 2 * (point.x - prev.x) / 3;
      return `${acc} C ${cpx1} ${prev.y} ${cpx2} ${point.y} ${point.x} ${point.y}`;
    }, '');

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight + 30}>
          {[0, 1, 2, 3].map((_, i) => (
            <Line
              key={i}
              x1={padding}
              y1={padding + (i * (chartHeight - padding * 2)) / 3}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - padding * 2)) / 3}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}
          <Path
            d={pathD}
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
          />
          {points.map((point, i) => (
            <Circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors.surface}
              stroke={colors.primary}
              strokeWidth={2}
            />
          ))}
          {months.map((month, i) => (
            <SvgText
              key={i}
              x={padding + (i * (chartWidth - padding * 2)) / (months.length - 1)}
              y={chartHeight + 15}
              fontSize={10}
              fill={colors.text.secondary}
              textAnchor="middle"
            >
              {month}
            </SvgText>
          ))}
        </Svg>
      </View>
    );
  };

  const renderProgressRing = () => {
    const { winRate } = estimatesData;
    const size = 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (winRate / 100) * circumference;

    return (
      <View style={styles.progressRingContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.progressRingText}>
          <Text style={[styles.progressPercentage, { color: colors.text.primary }]}>{winRate} %</Text>
          <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>Won</Text>
        </View>
      </View>
    );
  };

  const renderJobCard = (job: Job) => {

    return (
      <TouchableOpacity
        key={job.id}
        style={[styles.workCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push({
          pathname: '/job-details',
          params: { jobId: job.id }
        })}
        testID={`job-card-${job.id}`}
      >
        <View style={styles.workCardLeft}>
          <Text style={[styles.workTime, { color: colors.text.primary }]}>{job.scheduledTime}</Text>
          <Text style={[styles.workDuration, { color: colors.text.light }]}>1h</Text>
        </View>
        <View style={[styles.workCardDivider, { backgroundColor: colors.primary }]} />
        <View style={styles.workCardContent}>
          <Text style={[styles.workTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {job.type || 'Service Call'}
          </Text>
          <Text style={[styles.workCustomer, { color: colors.text.primary }]}>{job.customerName}</Text>
          <Text style={[styles.workAddress, { color: colors.text.secondary }]} numberOfLines={1}>
            {job.address}
          </Text>
          <Text style={[styles.workWindow, { color: colors.text.secondary }]}>
            Arrival window: {job.scheduledTime} - 3:00 PM
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20', borderColor: getStatusColor(job.status) }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(job.status) }]}>
              {job.status === 'in-progress' ? 'IN PROGRESS' : job.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerLeft}>
          <ListFilter size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          HANDYHERO
        </Text>
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={() => router.push('/new-job')}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Calendar size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Upcoming</Text>
          </View>
          <View style={styles.cardContent}>
            {upcomingJobs.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text.light }]}>none</Text>
            ) : (
              <Text style={[styles.cardValue, { color: colors.text.primary }]}>{upcomingJobs.length} jobs</Text>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <FileText size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Invoices</Text>
          </View>
          <TouchableOpacity 
            style={styles.cardContent}
            onPress={() => router.push('/invoices')}
          >
            <Text style={[styles.bigNumber, { color: colors.text.primary }]}>{openInvoices.length}</Text>
            <Text style={[styles.cardLabel, { color: colors.text.primary }]}>Open invoices</Text>
            <Text style={[styles.cardAmount, { color: colors.text.secondary }]}>
              {formatCurrency(openInvoicesTotal)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Wrench size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Jobs</Text>
          </View>
          <View style={styles.jobsCardContent}>
            {renderLineChart()}
            <View style={styles.jobsStats}>
              <Text style={[styles.jobsStatsLabel, { color: colors.text.secondary }]}>Scheduled</Text>
              <Text style={[styles.jobsStatsNumber, { color: colors.text.primary }]}>{scheduledJobs.length}</Text>
              <Text style={[styles.jobsStatsAmount, { color: colors.text.primary }]}>
                {formatCurrency(scheduledJobsValue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <FolderOpen size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Estimates</Text>
          </View>
          <View style={styles.estimatesCardContent}>
            <View style={styles.estimatesLeft}>
              <Text style={[styles.estimatesLabel, { color: colors.text.secondary }]}>Created</Text>
              <Text style={[styles.estimatesAmount, { color: colors.text.primary }]}>
                {formatCurrency(estimatesData.createdAmount)}
              </Text>
              <Text style={[styles.estimatesLabel, { color: colors.text.secondary, marginTop: 12 }]}>Won</Text>
              <Text style={[styles.estimatesAmount, { color: colors.text.primary }]}>
                {formatCurrency(estimatesData.wonAmount)}
              </Text>
            </View>
            {renderProgressRing()}
          </View>
        </View>

        <View style={styles.rowCards}>
          <TouchableOpacity 
            style={[styles.halfCard, { backgroundColor: colors.surface }]}
            onPress={() => setClockedIn(!clockedIn)}
          >
            <Text style={[styles.halfCardLabel, { color: colors.text.light }]}>
              {clockedIn ? 'Clocked in' : 'Clocked out'}
            </Text>
            <Text style={[styles.halfCardAction, { color: colors.text.light }]}>
              {clockedIn ? 'tap to clock-out' : 'tap to clock-in'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.halfCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.halfCardTitle, { color: colors.text.primary }]}>Timecard</Text>
            <Text style={[styles.halfCardValue, { color: colors.text.primary }]}>0h</Text>
            <Text style={[styles.halfCardSubtext, { color: colors.text.secondary }]}>this week</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Calendar size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Open work</Text>
            {scheduledJobs.length > 0 && (
              <Text style={[styles.cardBadge, { color: colors.primary }]}>+{scheduledJobs.length}</Text>
            )}
          </View>
          <View style={styles.workList}>
            {scheduledJobs.length === 0 ? (
              <View style={styles.emptyWorkContainer}>
                <Text style={[styles.emptyText, { color: colors.text.light }]}>No open work</Text>
                <TouchableOpacity
                  style={[styles.addJobButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/new-job')}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addJobButtonText}>Add Job</Text>
                </TouchableOpacity>
              </View>
            ) : (
              scheduledJobs.slice(0, 3).map((job) => renderJobCard(job))
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, marginBottom: 100 }]}>
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <Calendar size={18} color={colors.text.primary} />
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Upcoming</Text>
          </View>
          <View style={styles.cardContent}>
            {upcomingJobs.slice(0, 2).map((job, index) => (
              <TouchableOpacity
                key={job.id}
                style={styles.upcomingItem}
                onPress={() => router.push({
                  pathname: '/job-details',
                  params: { jobId: job.id }
                })}
              >
                <View style={styles.upcomingLeft}>
                  <Text style={[styles.upcomingDate, { color: colors.text.secondary }]}>
                    {new Date(job.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={[styles.upcomingTime, { color: colors.text.light }]}>{job.scheduledTime}</Text>
                </View>
                <View style={styles.upcomingRight}>
                  <Text style={[styles.upcomingName, { color: colors.text.primary }]}>{job.customerName}</Text>
                  <Text style={[styles.upcomingType, { color: colors.text.secondary }]}>{job.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {upcomingJobs.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.text.light }]}>No upcoming jobs</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  cardBadge: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  cardContent: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center' as const,
    paddingVertical: 20,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 52,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  cardAmount: {
    fontSize: 16,
    marginTop: 4,
  },
  jobsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  chartContainer: {
    flex: 1,
  },
  jobsStats: {
    alignItems: 'flex-end' as const,
    minWidth: 80,
  },
  jobsStatsLabel: {
    fontSize: 12,
  },
  jobsStatsNumber: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  jobsStatsAmount: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  estimatesCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  estimatesLeft: {
    flex: 1,
  },
  estimatesLabel: {
    fontSize: 12,
  },
  estimatesAmount: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  progressRingContainer: {
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  progressRingText: {
    position: 'absolute' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  progressLabel: {
    fontSize: 12,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  halfCardLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  halfCardAction: {
    fontSize: 14,
    marginTop: 4,
  },
  halfCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  halfCardValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  halfCardSubtext: {
    fontSize: 12,
  },
  workList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  workCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  workCardLeft: {
    width: 70,
    alignItems: 'flex-start' as const,
  },
  workTime: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  workDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  workCardDivider: {
    width: 3,
    marginRight: 12,
    borderRadius: 2,
  },
  workCardContent: {
    flex: 1,
  },
  workTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  workCustomer: {
    fontSize: 14,
    marginBottom: 2,
  },
  workAddress: {
    fontSize: 13,
    marginBottom: 2,
  },
  workWindow: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  emptyWorkContainer: {
    alignItems: 'center' as const,
    paddingVertical: 20,
  },
  addJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  addJobButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  upcomingItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  upcomingLeft: {
    width: 60,
  },
  upcomingDate: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  upcomingTime: {
    fontSize: 12,
  },
  upcomingRight: {
    flex: 1,
    marginLeft: 12,
  },
  upcomingName: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  upcomingType: {
    fontSize: 13,
    marginTop: 2,
  },
});
