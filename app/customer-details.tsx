import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  Smile,
  Edit,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function CustomerDetailsScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { getCustomerById, jobs, getInvoicesByCustomer } = useAppStore();
  const [notificationsOn, setNotificationsOn] = useState(true);
  
  const customer = getCustomerById(customerId);
  const customerJobs = jobs.filter(job => job.customerId === customerId);
  const invoices = getInvoicesByCustomer(customerId);

  if (!customer) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer not found</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    const phoneUrl = `tel:${customer.phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleMessage = () => {
    const smsUrl = `sms:${customer.phone}`;
    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('Error', 'Unable to send message');
    });
  };

  const handleOpenMap = () => {
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(customer.address)}`;
    Linking.openURL(mapUrl).catch(() => {
      Alert.alert('Error', 'Unable to open maps');
    });
  };

  // Mock property data - in real app this would come from customer data
  const propertyData = {
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=400&fit=crop',
    price: '$792,574',
    yearBuilt: '2003',
    beds: 4,
    baths: 2.0,
    sqft: 2237,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: customer.name,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <Text style={styles.headerTitle}>{customer.name}</Text>
          ),
          headerRight: () => (
            <View style={styles.headerRightButtons}>
              <TouchableOpacity style={styles.headerIconButton}>
                <Smile size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton}>
                <Edit size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Property Image Card */}
        <View style={styles.propertyCard}>
          <Image 
            source={{ uri: propertyData.image }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyOverlay}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyPrice}>{propertyData.price}</Text>
              <Text style={styles.propertyBuilt}>Built in {propertyData.yearBuilt}</Text>
            </View>
            <View style={styles.propertyStats}>
              <View style={styles.propertyStat}>
                <Text style={styles.propertyStatValue}>{propertyData.beds}</Text>
                <Text style={styles.propertyStatLabel}>Beds</Text>
              </View>
              <View style={styles.propertyStatDivider} />
              <View style={styles.propertyStat}>
                <Text style={styles.propertyStatValue}>{propertyData.baths}</Text>
                <Text style={styles.propertyStatLabel}>Baths</Text>
              </View>
              <View style={styles.propertyStatDivider} />
              <View style={styles.propertyStat}>
                <Text style={styles.propertyStatValue}>{propertyData.sqft}</Text>
                <Text style={styles.propertyStatLabel}>Sq. ft.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/new-job',
              params: { customerId: customer.id }
            })}
          >
            <Text style={styles.actionButtonText}>+ Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>+ Estimate</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Name</Text>
              <View style={styles.contactValueRow}>
                <Text style={styles.contactValue}>{customer.name}</Text>
                <MessageCircle size={24} color={Colors.primary} />
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Mobile</Text>
              <View style={styles.contactValueRow}>
                <Text style={styles.contactValue}>{customer.phone}</Text>
                <View style={styles.contactActions}>
                  <TouchableOpacity onPress={handleMessage}>
                    <MessageCircle size={24} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCall} style={styles.phoneButton}>
                    <Phone size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Notifications On</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity
                  style={[styles.switch, notificationsOn && styles.switchOn]}
                  onPress={() => setNotificationsOn(!notificationsOn)}
                >
                  <View style={[styles.switchThumb, notificationsOn && styles.switchThumbOn]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={styles.paymentButtons}>
            <TouchableOpacity style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>Add credit c...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>Send request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lead Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead source</Text>
          <Text style={styles.leadSource}>Choice HW</Text>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>Billing</Text>
              <TouchableOpacity onPress={handleOpenMap}>
                <MapPin size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>{customer.address}</Text>
          </View>
        </View>

        {/* Notes */}
        <TouchableOpacity style={styles.listItem}>
          <Text style={styles.listItemText}>Notes</Text>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemText}>History</Text>
            <Text style={styles.listItemCount}>{customerJobs.length}</Text>
          </View>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>

        {/* Attachments */}
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemText}>Attachments</Text>
            <Text style={styles.listItemCount}>1</Text>
          </View>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  headerButton: {
    padding: 8,
  },
  backButton: {
    fontSize: 17,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  propertyCard: {
    position: 'relative',
    height: 280,
    marginBottom: 16,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
  },
  propertyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  propertyPrice: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  propertyBuilt: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  propertyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyStat: {
    flex: 1,
    alignItems: 'center',
  },
  propertyStatValue: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  propertyStatLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  propertyStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: Colors.surface,
  },
  contactItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 17,
    color: Colors.text.primary,
  },
  contactValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 16,
  },
  phoneButton: {
    marginLeft: 0,
  },
  switchContainer: {
    alignItems: 'flex-end',
  },
  switch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#34C759',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  leadSource: {
    fontSize: 17,
    color: Colors.text.primary,
  },
  addressCard: {
    backgroundColor: Colors.surface,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  addressText: {
    fontSize: 17,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemText: {
    fontSize: 17,
    color: Colors.text.primary,
  },
  listItemCount: {
    fontSize: 17,
    color: Colors.text.secondary,
  },
});