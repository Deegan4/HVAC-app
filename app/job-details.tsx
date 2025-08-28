import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Wrench,
  Calendar,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Job } from '@/types';

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { jobs, updateJobStatus, getCustomerById, customers } = useAppStore();
  
  const job = jobs.find(j => j.id === jobId);
  const customer = job ? getCustomerById(job.customerId) : undefined;

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = (newStatus: Job['status']) => {
    Alert.alert(
      'Update Status',
      `Change job status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            updateJobStatus(job.id, newStatus);
            if (newStatus === 'completed') {
              router.back();
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: Job['status']) => {
    return Colors.status[status] || Colors.text.secondary;
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'emergency':
        return Colors.status.emergency;
      case 'high':
        return Colors.accent;
      case 'normal':
        return Colors.primary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Job Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(job.status) }]} />
            <Text style={styles.statusText}>{job.status.replace('-', ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
            <Text style={styles.priorityText}>{job.priority.toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.card}>
            <View style={styles.customerHeader}>
              <View style={styles.avatarContainer}>
                <User size={24} color={Colors.text.inverse} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                {customer && (
                  <>
                    <TouchableOpacity style={styles.contactRow}>
                      <Phone size={14} color={Colors.primary} />
                      <Text style={styles.contactText}>{customer.phone}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactRow}>
                      <Mail size={14} color={Colors.primary} />
                      <Text style={styles.contactText}>{customer.email}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{job.scheduledTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Wrench size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color={Colors.text.secondary} />
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{job.address}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{job.description}</Text>
            {job.notes && (
              <>
                <View style={styles.divider} />
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notes}>{job.notes}</Text>
              </>
            )}
          </View>
        </View>

        {/* Technician */}
        {job.technicianName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Technician</Text>
            <View style={styles.card}>
              <View style={styles.technicianRow}>
                <View style={styles.techAvatar}>
                  <User size={20} color={Colors.text.inverse} />
                </View>
                <Text style={styles.technicianName}>{job.technicianName}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {job.status !== 'completed' && job.status !== 'cancelled' && (
          <View style={styles.actionButtons}>
            {job.status === 'scheduled' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStatusChange('inProgress')}
              >
                <PlayCircle size={20} color={Colors.text.inverse} />
                <Text style={styles.actionButtonText}>Start Job</Text>
              </TouchableOpacity>
            )}
            {job.status === 'inProgress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleStatusChange('completed')}
              >
                <CheckCircle size={20} color={Colors.text.inverse} />
                <Text style={styles.actionButtonText}>Complete Job</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusChange('cancelled')}
            >
              <XCircle size={20} color={Colors.text.inverse} />
              <Text style={styles.actionButtonText}>Cancel Job</Text>
            </TouchableOpacity>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: Colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  notes: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  technicianName: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  startButton: {
    backgroundColor: Colors.status.inProgress,
  },
  completeButton: {
    backgroundColor: Colors.status.completed,
  },
  cancelButton: {
    backgroundColor: Colors.status.cancelled,
  },
});