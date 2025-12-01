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
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Clock, MapPin, AlertCircle, CheckCircle, Wrench, Calendar, List, X } from 'lucide-react-native';
import { useAppStore, useTodaysJobs, useJobStats } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { Job } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import CalendarView from '@/components/CalendarView';
import { useTranslation } from '@/constants/translations';

export default function ScheduleScreen() {
  const { jobs, invoices, events, isLoading, getUpcomingJobs, customers, userRole, language, addEvent, currentUserId } = useAppStore();
  const { colors } = useTheme();
  const t = useTranslation(language);
  const todaysJobs = useTodaysJobs();
  const stats = useJobStats();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const isFirstTimeUser = customers.length === 0 && jobs.length === 0;

  const upcomingJobs = useMemo(() => getUpcomingJobs(), [jobs]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
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

  const getPriorityIcon = (priority: Job['priority']) => {
    if (priority === 'emergency') {
      return <AlertCircle size={16} color={colors.status.emergency} />;
    }
    return null;
  };

  const getStatusText = (status: Job['status']) => {
    const statusMap: Record<string, string> = {
      'scheduled': t.scheduled,
      'in-progress': t.inProgress,
      'inProgress': t.inProgress,
      'completed': t.completed,
      'cancelled': t.cancelled,
      'emergency': t.emergency,
    };
    return statusMap[status] || status;
  };

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={[styles.jobCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={() => router.push({
        pathname: '/job-details',
        params: { jobId: job.id }
      })}
      testID={`job-card-${job.id}`}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobTimeContainer}>
          <Clock size={14} color={colors.text.secondary} />
          <Text style={[styles.jobTime, { color: colors.text.primary }]}>{job.scheduledTime}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={[styles.statusText, { color: colors.text.inverse }]}>{getStatusText(job.status)}</Text>
        </View>
      </View>

      <Text style={[styles.customerName, { color: colors.text.primary }]}>{job.customerName}</Text>
      
      <View style={styles.jobInfo}>
        <MapPin size={14} color={colors.text.secondary} />
        <Text style={[styles.addressText, { color: colors.text.secondary }]} numberOfLines={1}>{job.address}</Text>
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.jobTypeContainer}>
          <Wrench size={14} color={colors.text.secondary} />
          <Text style={[styles.jobType, { color: colors.text.secondary }]}>{job.type}</Text>
          {getPriorityIcon(job.priority)}
        </View>
        {job.technicianName && (
          <Text style={[styles.technicianName, { color: colors.primary }]}>{job.technicianName}</Text>
        )}
      </View>

      <Text style={[styles.jobDescription, { color: colors.text.secondary }]} numberOfLines={2}>
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

  const handleAddInvoice = (date: Date) => {
    router.push({
      pathname: '/new-invoice',
      params: { 
        selectedDate: date.toISOString().split('T')[0]
      }
    });
  };

  const handleAddEvent = (date: Date) => {
    setLongPressDate(date);
    setEventTitle('');
    setEventDescription('');
    setEventStartTime('');
    setEventEndTime('');
    setEventType('other');
    setEventLocation('');
    setEventAllDay(false);
    setShowEventModal(true);
  };

  const handleInvoicePress = (invoice: any) => {
    router.push('/invoices');
  };

  const handleEventPress = (event: any) => {
    console.log('Event pressed:', event);
  };

  const [longPressDate, setLongPressDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'reminder' | 'appointment' | 'other'>('other');
  const [eventLocation, setEventLocation] = useState('');
  const [eventAllDay, setEventAllDay] = useState(false);

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!longPressDate) {
      Alert.alert('Error', 'No date selected');
      return;
    }

    addEvent({
      title: eventTitle,
      description: eventDescription,
      date: longPressDate.toISOString().split('T')[0],
      startTime: eventStartTime || '09:00',
      endTime: eventEndTime,
      type: eventType,
      location: eventLocation,
      color: getEventTypeColor(eventType),
      allDay: eventAllDay,
      createdBy: currentUserId,
    });

    setShowEventModal(false);
    Alert.alert('Success', 'Event created successfully');
  };

  const getEventTypeColor = (type: 'meeting' | 'reminder' | 'appointment' | 'other') => {
    const colorMap = {
      meeting: colors.primary,
      reminder: colors.warning,
      appointment: colors.success,
      other: colors.text.secondary,
    };
    return colorMap[type];
  };

  if (isLoading) {
    return <LoadingScreen message="Setting up your workspace..." size={56} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {isFirstTimeUser ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.welcomeContainer}
        >
          <View style={styles.welcomeContent}>
            <View style={[styles.welcomeIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Wrench size={48} color={colors.primary} />
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text.primary }]}>
              Welcome {userRole === 'owner' ? 'Owner' : 'Technician'}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.text.secondary }]}>
              Let's get your business set up and running
            </Text>
            
            <View style={styles.quickStartSection}>
              <Text style={[styles.quickStartTitle, { color: colors.text.primary }]}>Quick Start Guide</Text>
              
              <TouchableOpacity
                style={[styles.quickStartCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => router.push('/new-customer')}
              >
                <View style={[styles.quickStartIcon, { backgroundColor: colors.primaryLight }]}>
                  <Plus size={24} color={colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={[styles.quickStartCardTitle, { color: colors.text.primary }]}>Add Your First Customer</Text>
                  <Text style={[styles.quickStartCardDescription, { color: colors.text.secondary }]}>
                    Start building your customer database
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickStartCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => router.push('/new-job')}
              >
                <View style={[styles.quickStartIcon, { backgroundColor: colors.primaryLight }]}>
                  <Calendar size={24} color={colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={[styles.quickStartCardTitle, { color: colors.text.primary }]}>Schedule Your First Job</Text>
                  <Text style={[styles.quickStartCardDescription, { color: colors.text.secondary }]}>
                    Create and manage service appointments
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickStartCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => router.push('/company-info')}
              >
                <View style={[styles.quickStartIcon, { backgroundColor: colors.primaryLight }]}>
                  <Wrench size={24} color={colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={[styles.quickStartCardTitle, { color: colors.text.primary }]}>Set Up Company Info</Text>
                  <Text style={[styles.quickStartCardDescription, { color: colors.text.secondary }]}>
                    Add your business details and branding
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickStartCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => router.push('/team-management')}
              >
                <View style={[styles.quickStartIcon, { backgroundColor: colors.primaryLight }]}>
                  <CheckCircle size={24} color={colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={[styles.quickStartCardTitle, { color: colors.text.primary }]}>Add Team Members</Text>
                  <Text style={[styles.quickStartCardDescription, { color: colors.text.secondary }]}>
                    Invite technicians and staff to your workspace
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.tipsSection, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tipsTitle, { color: colors.text.inverse }]}>Pro Tips</Text>
              <View style={styles.tipCard}>
                <AlertCircle size={16} color={colors.text.inverse} />
                <Text style={[styles.tipText, { color: colors.text.inverse }]}>
                  Import your existing customer list from the Customers tab
                </Text>
              </View>
              <View style={styles.tipCard}>
                <MapPin size={16} color={colors.text.inverse} />
                <Text style={[styles.tipText, { color: colors.text.inverse }]}>
                  Enable location tracking to optimize technician routes
                </Text>
              </View>
              <View style={styles.tipCard}>
                <Clock size={16} color={colors.text.inverse} />
                <Text style={[styles.tipText, { color: colors.text.inverse }]}>
                  Set up your service hours in Company Settings
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* View Toggle */}
          <View style={[styles.viewToggle, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.primary }]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? colors.text.inverse : colors.text.secondary} />
              <Text style={[styles.toggleText, { color: colors.text.secondary }, viewMode === 'list' && { color: colors.text.inverse }]}>{t.viewList}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'calendar' && { backgroundColor: colors.primary }]}
              onPress={() => setViewMode('calendar')}
            >
              <Calendar size={20} color={viewMode === 'calendar' ? colors.text.inverse : colors.text.secondary} />
              <Text style={[styles.toggleText, { color: colors.text.secondary }, viewMode === 'calendar' && { color: colors.text.inverse }]}>{t.viewCalendar}</Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'calendar' ? (
            <CalendarView
              jobs={jobs}
              invoices={invoices}
              events={events}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onJobPress={handleJobPress}
              onInvoicePress={handleInvoicePress}
              onEventPress={handleEventPress}
              onAddJob={handleAddJob}
              onAddInvoice={handleAddInvoice}
              onAddEvent={handleAddEvent}
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
              <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                <Text style={[styles.statNumber, { color: colors.text.primary }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.todaysSchedule}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                <Text style={[styles.statNumber, { color: colors.status.completed }]}>
                  {stats.completed}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.completed}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                <Text style={[styles.statNumber, { color: colors.status.inProgress }]}>
                  {stats.inProgress}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.inProgress}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                <Text style={[styles.statNumber, { color: colors.status.emergency }]}>
                  {stats.emergency}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.emergency}</Text>
              </View>
            </View>

            {/* Today's Jobs */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t.todaysSchedule}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>

            {todaysJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={colors.text.light} />
                <Text style={[styles.emptyStateText, { color: colors.text.light }]}>{t.noJobsToday}</Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/new-job')}
                >
                  <Plus size={20} color={colors.text.inverse} />
                  <Text style={[styles.emptyStateButtonText, { color: colors.text.inverse }]}>{t.addNewJob}</Text>
                </TouchableOpacity>
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
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t.upcomingJobs}</Text>
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
              style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
              onPress={() => router.push('/new-job')}
              testID="new-job-fab"
            >
              <Plus size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          )}

          {/* Event Creation Modal */}
          <Modal
            visible={showEventModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEventModal(false)}
          >
            <View style={styles.eventModalOverlay}>
              <View style={[styles.eventModalContent, { backgroundColor: colors.surface }]}>
                <View style={[styles.eventModalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.eventModalTitle, { color: colors.text.primary }]}>Create Event</Text>
                  <TouchableOpacity onPress={() => setShowEventModal(false)}>
                    <X size={24} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.eventModalForm} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.eventModalDate, { color: colors.primary }]}>
                    {longPressDate?.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>

                  <View style={styles.eventFormGroup}>
                    <Text style={[styles.eventLabel, { color: colors.text.primary }]}>Title *</Text>
                    <TextInput
                      style={[styles.eventInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      placeholder="Event title"
                      placeholderTextColor={colors.text.light}
                    />
                  </View>

                  <View style={styles.eventFormGroup}>
                    <Text style={[styles.eventLabel, { color: colors.text.primary }]}>Type</Text>
                    <View style={styles.eventTypeContainer}>
                      {(['meeting', 'reminder', 'appointment', 'other'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.eventTypeButton,
                            eventType === type && styles.eventTypeButtonActive,
                            { borderColor: getEventTypeColor(type) },
                            eventType === type && { backgroundColor: getEventTypeColor(type) + '20' }
                          ]}
                          onPress={() => setEventType(type)}
                        >
                          <Text style={[
                            styles.eventTypeText,
                            eventType === type && styles.eventTypeTextActive,
                            eventType === type && { color: getEventTypeColor(type) }
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.eventFormGroup}>
                    <View style={styles.eventCheckboxRow}>
                      <TouchableOpacity
                        style={styles.eventCheckbox}
                        onPress={() => setEventAllDay(!eventAllDay)}
                      >
                        <View style={[
                          styles.eventCheckboxBox,
                          { borderColor: colors.border },
                          eventAllDay && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                        ]}>
                          {eventAllDay && <CheckCircle size={16} color={colors.primary} />}
                        </View>
                        <Text style={[styles.eventCheckboxLabel, { color: colors.text.primary }]}>All Day Event</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!eventAllDay && (
                    <View style={styles.eventTimeRow}>
                      <View style={[styles.eventFormGroup, { flex: 1 }]}>
                        <Text style={[styles.eventLabel, { color: colors.text.primary }]}>Start Time</Text>
                        <TextInput
                          style={[styles.eventInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                          value={eventStartTime}
                          onChangeText={setEventStartTime}
                          placeholder="09:00"
                          placeholderTextColor={colors.text.light}
                        />
                      </View>
                      <View style={[styles.eventFormGroup, { flex: 1 }]}>
                        <Text style={[styles.eventLabel, { color: colors.text.primary }]}>End Time</Text>
                        <TextInput
                          style={[styles.eventInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                          value={eventEndTime}
                          onChangeText={setEventEndTime}
                          placeholder="10:00"
                          placeholderTextColor={colors.text.light}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.eventFormGroup}>
                    <Text style={[styles.eventLabel, { color: colors.text.primary }]}>Location</Text>
                    <TextInput
                      style={[styles.eventInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                      value={eventLocation}
                      onChangeText={setEventLocation}
                      placeholder="Event location"
                      placeholderTextColor={colors.text.light}
                    />
                  </View>

                  <View style={styles.eventFormGroup}>
                    <Text style={[styles.eventLabel, { color: colors.text.primary }]}>Description</Text>
                    <TextInput
                      style={[styles.eventInput, styles.eventTextArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                      value={eventDescription}
                      onChangeText={setEventDescription}
                      placeholder="Event description"
                      placeholderTextColor={colors.text.light}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <View style={[styles.eventModalActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.eventCancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setShowEventModal(false)}
                  >
                    <Text style={[styles.eventCancelButtonText, { color: colors.text.secondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.eventCreateButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreateEvent}
                  >
                    <Text style={[styles.eventCreateButtonText, { color: colors.text.inverse }]}>Create Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 11,
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
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  jobsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 140,
  },
  jobCard: {
    borderRadius: 12,
    padding: 16,
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    textTransform: 'capitalize' as const,
  },
  technicianName: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  jobDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
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
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  welcomeContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  quickStartSection: {
    marginBottom: 32,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  quickStartCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickStartContent: {
    flex: 1,
    justifyContent: 'center',
  },
  quickStartCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  quickStartCardDescription: {
    fontSize: 14,
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  eventModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  eventModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eventModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  eventModalForm: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  eventModalDate: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 20,
  },
  eventFormGroup: {
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  eventInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  eventTextArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  eventTypeButtonActive: {
    borderWidth: 2,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  eventTypeTextActive: {
    fontWeight: '600' as const,
  },
  eventCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventCheckboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCheckboxLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  eventTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  eventModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  eventCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  eventCancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  eventCreateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventCreateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});