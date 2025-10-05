import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus, Briefcase, FileText, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Job, Invoice, CalendarEvent } from '@/types';

interface CalendarViewProps {
  jobs: Job[];
  invoices?: Invoice[];
  events?: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onJobPress: (job: Job) => void;
  onInvoicePress?: (invoice: Invoice) => void;
  onEventPress?: (event: CalendarEvent) => void;
  onAddJob: (date: Date) => void;
  onAddInvoice?: (date: Date) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate?: Date;
}

const { width: screenWidth } = Dimensions.get('window');
const dayWidth = (screenWidth - 32) / 7;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ 
  jobs, 
  invoices = [],
  events = [],
  onDateSelect, 
  onJobPress,
  onInvoicePress,
  onEventPress,
  onAddJob,
  onAddInvoice,
  onAddEvent,
  selectedDate = new Date() 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [longPressDate, setLongPressDate] = useState<Date | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const { calendarDays, itemsByDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    const itemsMap = new Map<string, { jobs: Job[], invoices: Invoice[], events: CalendarEvent[] }>();
    
    jobs.forEach(job => {
      const dateKey = new Date(job.scheduledDate).toDateString();
      if (!itemsMap.has(dateKey)) {
        itemsMap.set(dateKey, { jobs: [], invoices: [], events: [] });
      }
      itemsMap.get(dateKey)!.jobs.push(job);
    });
    
    invoices.forEach(invoice => {
      const dateKey = new Date(invoice.date).toDateString();
      if (!itemsMap.has(dateKey)) {
        itemsMap.set(dateKey, { jobs: [], invoices: [], events: [] });
      }
      itemsMap.get(dateKey)!.invoices.push(invoice);
    });
    
    events.forEach(event => {
      const dateKey = new Date(event.date).toDateString();
      if (!itemsMap.has(dateKey)) {
        itemsMap.set(dateKey, { jobs: [], invoices: [], events: [] });
      }
      itemsMap.get(dateKey)!.events.push(event);
    });
    
    return {
      calendarDays: days,
      itemsByDate: itemsMap
    };
  }, [currentDate, jobs, invoices, events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getItemsForDate = (date: Date) => {
    return itemsByDate.get(date.toDateString()) || { jobs: [], invoices: [], events: [] };
  };

  const getStatusColor = (status: Job['status']) => {
    const statusMap: Record<string, string> = {
      'scheduled': Colors.status.scheduled,
      'inProgress': Colors.status.inProgress,
      'completed': Colors.status.completed,
      'cancelled': Colors.status.cancelled,
      'emergency': Colors.status.emergency,
    };
    return statusMap[status] || Colors.text.secondary;
  };

  const selectedDateItems = getItemsForDate(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={styles.daysHeader}>
        {DAYS.map(day => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((date, index) => {
            const dayItems = getItemsForDate(date);
            const totalItems = dayItems.jobs.length + dayItems.invoices.length + dayItems.events.length;
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);

            return (
              <Pressable
                key={index}
                style={[
                  styles.dayCell,
                  isTodayDate && styles.todayCell,
                  isSelectedDate && styles.selectedCell,
                  !isCurrentMonthDay && styles.otherMonthCell,
                ]}
                onPress={() => onDateSelect(date)}
                onLongPress={() => {
                  setLongPressDate(date);
                  setShowActionModal(true);
                }}
                delayLongPress={500}
              >
                <Text style={[
                  styles.dayText,
                  !isCurrentMonthDay && styles.otherMonthText,
                  isTodayDate && styles.todayText,
                  isSelectedDate && styles.selectedText,
                ]}>
                  {date.getDate()}
                </Text>
                
                {totalItems > 0 && (
                  <View style={styles.itemIndicators}>
                    {dayItems.jobs.slice(0, 2).map((job) => (
                      <View
                        key={job.id}
                        style={[
                          styles.itemDot,
                          { backgroundColor: getStatusColor(job.status) }
                        ]}
                      />
                    ))}
                    {dayItems.invoices.slice(0, 2 - dayItems.jobs.length).map((invoice) => (
                      <View
                        key={invoice.id}
                        style={[
                          styles.itemDot,
                          { backgroundColor: invoice.status === 'paid' ? Colors.success : Colors.warning }
                        ]}
                      />
                    ))}
                    {dayItems.events.slice(0, 2 - dayItems.jobs.length - dayItems.invoices.length).map((event) => (
                      <View
                        key={event.id}
                        style={[
                          styles.itemDot,
                          { backgroundColor: event.color || Colors.primary }
                        ]}
                      />
                    ))}
                    {totalItems > 2 && (
                      <Text style={styles.moreItemsText}>+{totalItems - 2}</Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {longPressDate?.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <Text style={styles.modalSubtitle}>Create new...</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowActionModal(false);
                if (longPressDate) {
                  onAddJob(longPressDate);
                }
              }}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: Colors.primary + '20' }]}>
                <Briefcase size={24} color={Colors.primary} />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Job</Text>
                <Text style={styles.modalOptionDescription}>Schedule a new service job</Text>
              </View>
            </TouchableOpacity>

            {onAddInvoice && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowActionModal(false);
                  if (longPressDate) {
                    onAddInvoice(longPressDate);
                  }
                }}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: Colors.success + '20' }]}>
                  <FileText size={24} color={Colors.success} />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Invoice</Text>
                  <Text style={styles.modalOptionDescription}>Create a new invoice</Text>
                </View>
              </TouchableOpacity>
            )}

            {onAddEvent && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowActionModal(false);
                  if (longPressDate) {
                    onAddEvent(longPressDate);
                  }
                }}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: Colors.warning + '20' }]}>
                  <Calendar size={24} color={Colors.warning} />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>Event</Text>
                  <Text style={styles.modalOptionDescription}>Add a calendar event</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Selected Date Items */}
      <View style={styles.selectedDateSection}>
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setLongPressDate(selectedDate);
              setShowActionModal(true);
            }}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {selectedDateItems.jobs.length === 0 && selectedDateItems.invoices.length === 0 && selectedDateItems.events.length === 0 ? (
            <View style={styles.noItemsContainer}>
              <Text style={styles.noItemsText}>No items scheduled for this date</Text>
            </View>
          ) : (
            <>
              {selectedDateItems.jobs.map(job => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.itemCard}
                  onPress={() => onJobPress(job)}
                >
                  <View style={styles.itemCardHeader}>
                    <View style={styles.itemTypeIndicator}>
                      <Briefcase size={16} color={Colors.primary} />
                      <Text style={styles.itemType}>Job</Text>
                    </View>
                    <View style={[
                      styles.itemStatus,
                      { backgroundColor: getStatusColor(job.status) }
                    ]}>
                      <Text style={styles.itemStatusText}>
                        {job.status.replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemTime}>{job.scheduledTime}</Text>
                  <Text style={styles.itemTitle}>{job.customerName}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {job.description}
                  </Text>
                  {job.priority === 'emergency' && (
                    <View style={styles.emergencyBadge}>
                      <Text style={styles.emergencyText}>EMERGENCY</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              {selectedDateItems.invoices.map(invoice => (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.itemCard}
                  onPress={() => onInvoicePress?.(invoice)}
                >
                  <View style={styles.itemCardHeader}>
                    <View style={styles.itemTypeIndicator}>
                      <FileText size={16} color={Colors.success} />
                      <Text style={styles.itemType}>Invoice</Text>
                    </View>
                    <View style={[
                      styles.itemStatus,
                      { backgroundColor: invoice.status === 'paid' ? Colors.success : Colors.warning }
                    ]}>
                      <Text style={styles.itemStatusText}>
                        {invoice.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemTitle}>{invoice.customerName}</Text>
                  <Text style={styles.itemDescription}>
                    ${invoice.total.toFixed(2)} - Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {selectedDateItems.events.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.itemCard}
                  onPress={() => onEventPress?.(event)}
                >
                  <View style={styles.itemCardHeader}>
                    <View style={styles.itemTypeIndicator}>
                      <Calendar size={16} color={event.color || Colors.warning} />
                      <Text style={styles.itemType}>Event</Text>
                    </View>
                    {event.allDay && (
                      <View style={[styles.itemStatus, { backgroundColor: Colors.text.secondary }]}>
                        <Text style={styles.itemStatusText}>All Day</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemTime}>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</Text>
                  <Text style={styles.itemTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  daysHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHeaderCell: {
    width: dayWidth,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
  },
  calendarContainer: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dayCell: {
    width: dayWidth,
    height: dayWidth,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  todayCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  otherMonthText: {
    color: Colors.text.light,
  },
  todayText: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  selectedText: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  itemIndicators: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreItemsText: {
    fontSize: 8,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  itemTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
  },
  selectedDateSection: {
    maxHeight: 300,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noItemsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noItemsText: {
    fontSize: 14,
    color: Colors.text.light,
  },
  itemCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemStatusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    textTransform: 'uppercase' as const,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  emergencyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.status.emergency,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emergencyText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: Colors.text.inverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  modalCancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
});