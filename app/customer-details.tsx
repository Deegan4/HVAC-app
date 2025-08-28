import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Wrench,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function CustomerDetailsScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { getCustomerById, getEquipmentByCustomer, jobs, getInvoicesByCustomer } = useAppStore();
  
  const customer = getCustomerById(customerId);
  const equipment = getEquipmentByCustomer(customerId);
  const customerJobs = jobs.filter(job => job.customerId === customerId);
  const invoices = getInvoicesByCustomer(customerId);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSpent = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Customer Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={32} color={Colors.text.inverse} />
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerSince}>
            Customer since {new Date(customer.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.contactRow}>
              <Phone size={16} color={Colors.text.secondary} />
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>{customer.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactRow}>
              <Mail size={16} color={Colors.text.secondary} />
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>{customer.email}</Text>
            </TouchableOpacity>
            <View style={styles.contactRow}>
              <MapPin size={16} color={Colors.text.secondary} />
              <Text style={styles.contactLabel}>Address:</Text>
              <Text style={styles.contactValue}>{customer.address}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Wrench size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{customerJobs.length}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <FileText size={20} color={Colors.secondary} />
            <Text style={styles.statNumber}>{invoices.length}</Text>
            <Text style={styles.statLabel}>Invoices</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color={Colors.accent} />
            <Text style={styles.statNumber}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Equipment */}
        {equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment ({equipment.length})</Text>
            {equipment.map(eq => (
              <View key={eq.id} style={styles.card}>
                <View style={styles.equipmentHeader}>
                  <Text style={styles.equipmentType}>{eq.type}</Text>
                  {eq.warrantyExpiry && new Date(eq.warrantyExpiry) > new Date() && (
                    <View style={styles.warrantyBadge}>
                      <Text style={styles.warrantyText}>Under Warranty</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.equipmentBrand}>{eq.brand} {eq.model}</Text>
                <Text style={styles.equipmentSerial}>S/N: {eq.serialNumber}</Text>
                {eq.lastServiceDate && (
                  <Text style={styles.lastService}>
                    Last serviced: {new Date(eq.lastServiceDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Recent Jobs */}
        {customerJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            {customerJobs.slice(0, 5).map(job => (
              <View key={job.id} style={styles.card}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobDate}>
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: Colors.status[job.status] }]}>
                    <Text style={styles.statusText}>{job.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.jobType}>{job.type.charAt(0).toUpperCase() + job.type.slice(1)}</Text>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {job.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {customer.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.notes}>{customer.notes}</Text>
            </View>
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
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    marginBottom: 8,
  },
  customerSince: {
    fontSize: 14,
    color: Colors.text.inverse,
    opacity: 0.9,
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
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    width: 60,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentType: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    textTransform: 'uppercase' as const,
  },
  warrantyBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warrantyText: {
    fontSize: 11,
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  equipmentBrand: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  equipmentSerial: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  lastService: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDate: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  jobType: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  notes: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic' as const,
  },
});