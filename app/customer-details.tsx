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
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  Smile,
  Edit,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  X,
  Save,
  CreditCard,
  DollarSign,
  FileText,
  Paperclip,
  Calendar,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function CustomerDetailsScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { getCustomerById, jobs, getInvoicesByCustomer, customers } = useAppStore();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showLeadSourceModal, setShowLeadSourceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [leadSource, setLeadSource] = useState('Choice HW');
  const [paymentModalType, setPaymentModalType] = useState<'card' | 'request'>('card');
  
  const customer = getCustomerById(customerId);
  const customerJobs = jobs.filter(job => job.customerId === customerId);
  const invoices = getInvoicesByCustomer(customerId);
  
  React.useEffect(() => {
    if (customer?.notes) {
      setNotes(customer.notes);
    }
  }, [customer]);

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

  const handleEditCustomer = () => {
    Alert.alert(
      'Edit Customer',
      'Customer editing functionality will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleAddNote = () => {
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    setShowNotesModal(false);
    Alert.alert('Success', 'Notes saved successfully');
  };

  const handleViewHistory = () => {
    Alert.alert(
      'Service History',
      `This customer has ${customerJobs.length} job(s) in their history.\n\nDetailed history view coming soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleViewAttachments = () => {
    Alert.alert(
      'Attachments',
      'View and manage customer attachments, photos, and documents.\n\nComing soon.',
      [{ text: 'OK' }]
    );
  };

  const handleAddPaymentMethod = (type: 'card' | 'request') => {
    setPaymentModalType(type);
    setShowPaymentModal(true);
  };

  const handleSavePaymentMethod = () => {
    setShowPaymentModal(false);
    Alert.alert('Success', 'Payment method saved successfully');
  };

  const handleEditLeadSource = () => {
    setShowLeadSourceModal(true);
  };

  const handleSaveLeadSource = () => {
    setShowLeadSourceModal(false);
    Alert.alert('Success', 'Lead source updated successfully');
  };

  const handleCreateEstimate = () => {
    Alert.alert(
      'Create Estimate',
      'Create a detailed estimate for this customer.\n\nEstimate creation coming soon.',
      [{ text: 'OK' }]
    );
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
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={() => Alert.alert('Customer Satisfaction', 'View customer satisfaction ratings and feedback.\n\nComing soon.')}
              >
                <Smile size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={handleEditCustomer}
              >
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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCreateEstimate}
          >
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
            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={() => handleAddPaymentMethod('card')}
            >
              <CreditCard size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.paymentButtonText}>Add credit card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={() => handleAddPaymentMethod('request')}
            >
              <DollarSign size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.paymentButtonText}>Send request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lead Source */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.leadSourceContainer}
            onPress={handleEditLeadSource}
          >
            <View>
              <Text style={styles.sectionTitle}>Lead source</Text>
              <Text style={styles.leadSource}>{leadSource}</Text>
            </View>
            <Edit size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
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
        <TouchableOpacity 
          style={styles.listItem}
          onPress={handleAddNote}
        >
          <View style={styles.listItemContent}>
            <FileText size={20} color={Colors.text.secondary} style={{ marginRight: 12 }} />
            <Text style={styles.listItemText}>Notes</Text>
          </View>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity 
          style={styles.listItem}
          onPress={handleViewHistory}
        >
          <View style={styles.listItemContent}>
            <Calendar size={20} color={Colors.text.secondary} style={{ marginRight: 12 }} />
            <Text style={styles.listItemText}>History</Text>
            <Text style={styles.listItemCount}>{customerJobs.length}</Text>
          </View>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>

        {/* Attachments */}
        <TouchableOpacity 
          style={styles.listItem}
          onPress={handleViewAttachments}
        >
          <View style={styles.listItemContent}>
            <Paperclip size={20} color={Colors.text.secondary} style={{ marginRight: 12 }} />
            <Text style={styles.listItemText}>Attachments</Text>
            <Text style={styles.listItemCount}>1</Text>
          </View>
          <ChevronRight size={20} color={Colors.text.light} />
        </TouchableOpacity>
      </ScrollView>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customer Notes</Text>
            <TouchableOpacity onPress={handleSaveNotes}>
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this customer...\n\n• Service preferences\n• Special instructions\n• Equipment details\n• Contact preferences"
              placeholderTextColor={Colors.text.light}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Lead Source Modal */}
      <Modal
        visible={showLeadSourceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLeadSourceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLeadSourceModal(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lead Source</Text>
            <TouchableOpacity onPress={handleSaveLeadSource}>
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>How did this customer find you?</Text>
            <TextInput
              style={styles.textInput}
              value={leadSource}
              onChangeText={setLeadSource}
              placeholder="e.g., Google, Referral, Social Media"
              placeholderTextColor={Colors.text.light}
            />
            <View style={styles.leadSourceOptions}>
              <Text style={styles.optionsTitle}>Common Sources:</Text>
              {['Google Search', 'Referral', 'Social Media', 'Website', 'Repeat Customer', 'Advertisement'].map((source) => (
                <TouchableOpacity
                  key={source}
                  style={styles.optionButton}
                  onPress={() => setLeadSource(source)}
                >
                  <Text style={styles.optionButtonText}>{source}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {paymentModalType === 'card' ? 'Add Credit Card' : 'Send Payment Request'}
            </Text>
            <TouchableOpacity onPress={handleSavePaymentMethod}>
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {paymentModalType === 'card' ? (
              <View>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="number-pad"
                />
                <View style={styles.cardRow}>
                  <View style={styles.cardHalf}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.text.light}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.cardHalf}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="123"
                      placeholderTextColor={Colors.text.light}
                      keyboardType="number-pad"
                      secureTextEntry
                    />
                  </View>
                </View>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.text.light}
                  autoCapitalize="words"
                />
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="$0.00"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Payment for services rendered..."
                  placeholderTextColor={Colors.text.light}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.inputLabel}>Send Via</Text>
                <View style={styles.sendViaOptions}>
                  <TouchableOpacity style={styles.sendViaButton}>
                    <MessageCircle size={20} color={Colors.primary} />
                    <Text style={styles.sendViaText}>SMS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendViaButton}>
                    <Text style={styles.sendViaText}>📧 Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  leadSourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 300,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leadSourceOptions: {
    marginTop: 24,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHalf: {
    flex: 1,
  },
  sendViaOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sendViaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendViaText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
});