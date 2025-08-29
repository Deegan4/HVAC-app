import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Clock, MapPin, AlertCircle, CheckCircle, Wrench, Calendar, List } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore, useTodaysJobs, useJobStats } from '@/hooks/app-store';
import { Job } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import CalendarView from '@/components/CalendarView';

export default function ScheduleScreen() {
  const { jobs, isLoading, getUpcomingJobs } = useAppStore();
  const todaysJobs = useTodaysJobs();
  const stats = useJobStats();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const upcomingJobs = useMemo(() => getUpcomingJobs(), [jobs]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

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

  const getPriorityIcon = (priority: Job['priority']) => {
    if (priority === 'emergency') {
      return <AlertCircle size={16} color={Colors.status.emergency} />;
    }
    return null;
  };

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={styles.jobCard}
      onPress={() => router.push({
        pathname: '/job-details',
        params: { jobId: job.id }
      })}
      testID={`job-card-${job.id}`}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTimeContainer}>
          <Clock size={14} color={Colors.text.secondary} />
          <Text style={styles.jobTime}>{job.scheduledTime}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status.replace('-', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.customerName}>{job.customerName}</Text>
      
      <View style={styles.jobInfo}>
        <MapPin size={14} color={Colors.text.secondary} />
        <Text style={styles.addressText} numberOfLines={1}>{job.address}</Text>
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.jobTypeContainer}>
          <Wrench size={14} color={Colors.text.secondary} />
          <Text style={styles.jobType}>{job.type}</Text>
          {getPriorityIcon(job.priority)}
        </View>
        {job.technicianName && (
          <Text style={styles.technicianName}>{job.technicianName}</Text>
        )}
      </View>

      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>
    </TouchableOpacity>
  );



  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleJobPress = (job: Job) => {
    router.push({
      pathname: '/job-details',
      params: { jobId: job.id }
    });
  };

  const handleAddJob = (date: Date) => {
    router.push({
      pathname: '/new-job',
      params: { 
        selectedDate: date.toISOString().split('T')[0]
      }
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your schedule..." size={56} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? Colors.text.inverse : Colors.text.secondary} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Calendar size={20} color={viewMode === 'calendar' ? Colors.text.inverse : Colors.text.secondary} />
          <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>Calendar</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' ? (
        <CalendarView
          jobs={jobs}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onJobPress={handleJobPress}
          onAddJob={handleAddJob}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Today's Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.status.completed }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.status.inProgress }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.status.emergency }]}>
              {stats.emergency}
            </Text>
            <Text style={styles.statLabel}>Emergency</Text>
          </View>
        </View>

        {/* Today's Jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {todaysJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.text.light} />
            <Text style={styles.emptyStateText}>No jobs scheduled for today</Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {todaysJobs.map(renderJobCard)}
          </View>
        )}

        {/* Upcoming Jobs */}
        {upcomingJobs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
            </View>
            <View style={styles.jobsList}>
              {upcomingJobs.slice(0, 5).map(renderJobCard)}
            </View>
          </>
        )}
        </ScrollView>
      )}

      {/* Floating Action Button - Only show in list view */}
      {viewMode === 'list' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/new-job')}
          testID="new-job-fab"
        >
          <Plus size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center' as const,
    lineHeight: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  jobsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 140,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobTime: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    textTransform: 'uppercase' as const,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobType: {
    fontSize: 13,
    color: Colors.text.secondary,
    textTransform: 'capitalize' as const,
  },
  technicianName: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  jobDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.light,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  toggleTextActive: {
    color: Colors.text.inverse,
  },
});