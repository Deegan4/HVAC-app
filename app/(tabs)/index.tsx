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
import { Colors } from '@/constants/colors';
import { useAppStore, useTodaysJobs, useJobStats } from '@/hooks/app-store';
import { Job } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import CalendarView from '@/components/CalendarView';
import { useTranslation } from '@/constants/translations';

export default function ScheduleScreen() {
  const { jobs, invoices, events, isLoading, getUpcomingJobs, customers, userRole, language, addEvent, currentUserId } = useAppStore();
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
          <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
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
      meeting: Colors.primary,
      reminder: Colors.warning,
      appointment: Colors.success,
      other: Colors.text.secondary,
    };
    return colorMap[type];
  };

  if (isLoading) {
    return <LoadingScreen message="Setting up your workspace..." size={56} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {isFirstTimeUser ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.welcomeContainer}
        >
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeIconContainer}>
              <Wrench size={48} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>
              Welcome {userRole === 'owner' ? 'Owner' : 'Technician'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Let's get your business set up and running
            </Text>
            
            <View style={styles.quickStartSection}>
              <Text style={styles.quickStartTitle}>Quick Start Guide</Text>
              
              <TouchableOpacity
                style={styles.quickStartCard}
                onPress={() => router.push('/new-customer')}
              >
                <View style={styles.quickStartIcon}>
                  <Plus size={24} color={Colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={styles.quickStartCardTitle}>Add Your First Customer</Text>
                  <Text style={styles.quickStartCardDescription}>
                    Start building your customer database
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickStartCard}
                onPress={() => router.push('/new-job')}
              >
                <View style={styles.quickStartIcon}>
                  <Calendar size={24} color={Colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={styles.quickStartCardTitle}>Schedule Your First Job</Text>
                  <Text style={styles.quickStartCardDescription}>
                    Create and manage service appointments
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickStartCard}
                onPress={() => router.push('/company-info')}
              >
                <View style={styles.quickStartIcon}>
                  <Wrench size={24} color={Colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={styles.quickStartCardTitle}>Set Up Company Info</Text>
                  <Text style={styles.quickStartCardDescription}>
                    Add your business details and branding
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickStartCard}
                onPress={() => router.push('/team-management')}
              >
                <View style={styles.quickStartIcon}>
                  <CheckCircle size={24} color={Colors.primary} />
                </View>
                <View style={styles.quickStartContent}>
                  <Text style={styles.quickStartCardTitle}>Add Team Members</Text>
                  <Text style={styles.quickStartCardDescription}>
                    Invite technicians and staff to your workspace
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Pro Tips</Text>
              <View style={styles.tipCard}>
                <AlertCircle size={16} color={Colors.text.inverse} />
                <Text style={styles.tipText}>
                  Import your existing customer list from the Customers tab
                </Text>
              </View>
              <View style={styles.tipCard}>
                <MapPin size={16} color={Colors.text.inverse} />
                <Text style={styles.tipText}>
                  Enable location tracking to optimize technician routes
                </Text>
              </View>
              <View style={styles.tipCard}>
                <Clock size={16} color={Colors.text.inverse} />
                <Text style={styles.tipText}>
                  Set up your service hours in Company Settings
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? Colors.text.inverse : Colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>{t.viewList}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
              onPress={() => setViewMode('calendar')}
            >
              <Calendar size={20} color={viewMode === 'calendar' ? Colors.text.inverse : Colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>{t.viewCalendar}</Text>
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
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>{t.todaysSchedule}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: Colors.status.completed }]}>
                  {stats.completed}
                </Text>
                <Text style={styles.statLabel}>{t.completed}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: Colors.status.inProgress }]}>
                  {stats.inProgress}
                </Text>
                <Text style={styles.statLabel}>{t.inProgress}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: Colors.status.emergency }]}>
                  {stats.emergency}
                </Text>
                <Text style={styles.statLabel}>{t.emergency}</Text>
              </View>
            </View>

            {/* Today's Jobs */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.todaysSchedule}</Text>
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
                <Text style={styles.emptyStateText}>{t.noJobsToday}</Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/new-job')}
                >
                  <Plus size={20} color={Colors.text.inverse} />
                  <Text style={styles.emptyStateButtonText}>{t.addNewJob}</Text>
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
                  <Text style={styles.sectionTitle}>{t.upcomingJobs}</Text>
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

          {/* Event Creation Modal */}
          <Modal
            visible={showEventModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEventModal(false)}
          >
            <View style={styles.eventModalOverlay}>
              <View style={styles.eventModalContent}>
                <View style={styles.eventModalHeader}>
                  <Text style={styles.eventModalTitle}>Create Event</Text>
                  <TouchableOpacity onPress={() => setShowEventModal(false)}>
                    <X size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.eventModalForm} showsVerticalScrollIndicator={false}>
                  <Text style={styles.eventModalDate}>
                    {longPressDate?.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>

                  <View style={styles.eventFormGroup}>
                    <Text style={styles.eventLabel}>Title *</Text>
                    <TextInput
                      style={styles.eventInput}
                      value={eventTitle}
                      onChangeText={setEventTitle}
                      placeholder="Event title"
                      placeholderTextColor={Colors.text.light}
                    />
                  </View>

                  <View style={styles.eventFormGroup}>
                    <Text style={styles.eventLabel}>Type</Text>
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
                          eventAllDay && styles.eventCheckboxBoxChecked
                        ]}>
                          {eventAllDay && <CheckCircle size={16} color={Colors.primary} />}
                        </View>
                        <Text style={styles.eventCheckboxLabel}>All Day Event</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!eventAllDay && (
                    <View style={styles.eventTimeRow}>
                      <View style={[styles.eventFormGroup, { flex: 1 }]}>
                        <Text style={styles.eventLabel}>Start Time</Text>
                        <TextInput
                          style={styles.eventInput}
                          value={eventStartTime}
                          onChangeText={setEventStartTime}
                          placeholder="09:00"
                          placeholderTextColor={Colors.text.light}
                        />
                      </View>
                      <View style={[styles.eventFormGroup, { flex: 1 }]}>
                        <Text style={styles.eventLabel}>End Time</Text>
                        <TextInput
                          style={styles.eventInput}
                          value={eventEndTime}
                          onChangeText={setEventEndTime}
                          placeholder="10:00"
                          placeholderTextColor={Colors.text.light}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.eventFormGroup}>
                    <Text style={styles.eventLabel}>Location</Text>
                    <TextInput
                      style={styles.eventInput}
                      value={eventLocation}
                      onChangeText={setEventLocation}
                      placeholder="Event location"
                      placeholderTextColor={Colors.text.light}
                    />
                  </View>

                  <View style={styles.eventFormGroup}>
                    <Text style={styles.eventLabel}>Description</Text>
                    <TextInput
                      style={[styles.eventInput, styles.eventTextArea]}
                      value={eventDescription}
                      onChangeText={setEventDescription}
                      placeholder="Event description"
                      placeholderTextColor={Colors.text.light}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <View style={styles.eventModalActions}>
                  <TouchableOpacity
                    style={styles.eventCancelButton}
                    onPress={() => setShowEventModal(false)}
                  >
                    <Text style={styles.eventCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.eventCreateButton}
                    onPress={handleCreateEvent}
                  >
                    <Text style={styles.eventCreateButtonText}>Create Event</Text>
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
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  quickStartSection: {
    marginBottom: 32,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  quickStartCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  quickStartCardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tipsSection: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.inverse,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  eventModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  eventModalContent: {
    backgroundColor: Colors.surface,
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
    borderBottomColor: Colors.border,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  eventModalForm: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  eventModalDate: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
    marginBottom: 20,
  },
  eventFormGroup: {
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  eventInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
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
    borderColor: Colors.border,
  },
  eventTypeButtonActive: {
    borderWidth: 2,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
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
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCheckboxBoxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  eventCheckboxLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
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
    borderTopColor: Colors.border,
  },
  eventCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  eventCancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  eventCreateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  eventCreateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});