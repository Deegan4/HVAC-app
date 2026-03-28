import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Plus, X, Calendar, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Customer, Job, InvoiceItem } from '@/types';

export default function NewInvoiceScreen() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId?: string }>();
  const { customers, jobs, invoices, addInvoice, updateInvoice } = useAppStore();
  const existingInvoice = invoiceId ? invoices.find(inv => inv.id === invoiceId) : null;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState<boolean>(false);
  const [showJobPicker, setShowJobPicker] = useState<boolean>(false);
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([{
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    type: 'service'
  }]);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(8.5);

  useEffect(() => {
    if (existingInvoice) {
      const customer = customers.find(c => c.id === existingInvoice.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
      
      if (existingInvoice.jobId) {
        const job = jobs.find(j => j.id === existingInvoice.jobId);
        if (job) {
          setSelectedJob(job);
        }
      }
      
      setItems(existingInvoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        type: item.type
      })));
      
      setDueDate(existingInvoice.dueDate);
      setNotes(existingInvoice.notes || '');
      
      const calculatedTaxRate = existingInvoice.subtotal > 0 
        ? (existingInvoice.tax / existingInvoice.subtotal) * 100 
        : 8.5;
      setTaxRate(calculatedTaxRate);
    }
  }, [existingInvoice, customers, jobs]); // Default tax rate

  const availableJobs = useMemo(() => {
    if (!selectedCustomer) return [];
    return jobs.filter(job => 
      job.customerId === selectedCustomer.id && 
      job.status === 'completed' && 
      !job.invoiceId
    );
  }, [jobs, selectedCustomer]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const tax = useMemo(() => {
    return subtotal * (taxRate / 100);
  }, [subtotal, taxRate]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      unitPrice,
      total: quantity * unitPrice
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      type: 'service'
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!selectedCustomer) {
      Alert.alert('Missing Information', 'Please select a customer.');
      return;
    }

    if (items.some(item => !item.description.trim())) {
      Alert.alert('Missing Information', 'Please fill in all item descriptions.');
      return;
    }

    if (!dueDate) {
      Alert.alert('Missing Information', 'Please set a due date.');
      return;
    }

    const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
      ...item,
      id: existingInvoice?.items[index]?.id || `item${Date.now()}_${index}`
    }));

    if (existingInvoice) {
      updateInvoice(existingInvoice.id, {
        jobId: selectedJob?.id || '',
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        dueDate,
        items: invoiceItems,
        subtotal,
        tax,
        total,
        notes: notes.trim() || undefined
      });
      Alert.alert('Success', 'Invoice updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      const newInvoice = {
        jobId: selectedJob?.id || '',
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        date: new Date().toISOString().split('T')[0],
        dueDate,
        status: 'draft' as const,
        items: invoiceItems,
        subtotal,
        tax,
        total,
        paidAmount: 0,
        notes: notes.trim() || undefined
      };

      addInvoice(newInvoice);
      Alert.alert('Success', 'Invoice created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const generateDueDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: existingInvoice ? 'Edit Invoice' : 'New Invoice',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              testID="save-invoice-button"
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCustomerPicker(true)}
            testID="customer-picker-button"
          >
            <User size={20} color={Colors.text.secondary} />
            <Text style={[
              styles.pickerButtonText,
              !selectedCustomer && styles.pickerButtonPlaceholder
            ]}>
              {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job Selection (Optional) */}
        {selectedCustomer && availableJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Job (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowJobPicker(true)}
              testID="job-picker-button"
            >
              <Calendar size={20} color={Colors.text.secondary} />
              <Text style={[
                styles.pickerButtonText,
                !selectedJob && styles.pickerButtonPlaceholder
              ]}>
                {selectedJob ? `${selectedJob.type} - ${formatDate(selectedJob.scheduledDate)}` : 'Select Job'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <View style={styles.dueDateContainer}>
            <TextInput
              style={styles.dueDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.text.light}
              value={dueDate}
              onChangeText={setDueDate}
              testID="due-date-input"
            />
            <View style={styles.dueDateButtons}>
              {[7, 14, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={styles.dueDateButton}
                  onPress={() => setDueDate(generateDueDate(days))}
                >
                  <Text style={styles.dueDateButtonText}>{days}d</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={addItem}
              testID="add-item-button"
            >
              <Plus size={16} color={Colors.text.inverse} />
              <Text style={styles.addItemButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
          
          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Item {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeItemButton}
                    onPress={() => removeItem(index)}
                    testID={`remove-item-${index}`}
                  >
                    <X size={16} color={Colors.status.emergency} />
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                style={styles.itemInput}
                placeholder="Description"
                placeholderTextColor={Colors.text.light}
                value={item.description}
                onChangeText={(text) => {
                  const newItems = [...items];
                  newItems[index].description = text;
                  setItems(newItems);
                }}
                testID={`item-description-${index}`}
              />
              
              <View style={styles.itemRow}>
                <View style={styles.itemInputGroup}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="1"
                    placeholderTextColor={Colors.text.light}
                    value={item.quantity.toString()}
                    onChangeText={(text) => {
                      const quantity = parseInt(text) || 0;
                      updateItemTotal(index, quantity, item.unitPrice);
                    }}
                    keyboardType="numeric"
                    testID={`item-quantity-${index}`}
                  />
                </View>
                
                <View style={styles.itemInputGroup}>
                  <Text style={styles.inputLabel}>Unit Price</Text>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.text.light}
                    value={item.unitPrice.toString()}
                    onChangeText={(text) => {
                      const unitPrice = parseFloat(text) || 0;
                      updateItemTotal(index, item.quantity, unitPrice);
                    }}
                    keyboardType="decimal-pad"
                    testID={`item-unit-price-${index}`}
                  />
                </View>
                
                <View style={styles.itemInputGroup}>
                  <Text style={styles.inputLabel}>Total</Text>
                  <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tax Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Rate (%)</Text>
          <TextInput
            style={styles.taxInput}
            placeholder="8.5"
            placeholderTextColor={Colors.text.light}
            value={taxRate.toString()}
            onChangeText={(text) => setTaxRate(parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            testID="tax-rate-input"
          />
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Additional notes or terms..."
            placeholderTextColor={Colors.text.light}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            testID="notes-input"
          />
        </View>
      </ScrollView>

      {/* Customer Picker Modal */}
      <Modal
        visible={showCustomerPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomerPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <TouchableOpacity
              onPress={() => setShowCustomerPicker(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {customers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.customerOption}
                onPress={() => {
                  setSelectedCustomer(customer);
                  setSelectedJob(null); // Reset job selection
                  setShowCustomerPicker(false);
                }}
                testID={`customer-option-${customer.id}`}
              >
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerDetails}>{customer.email}</Text>
                <Text style={styles.customerDetails}>{customer.address}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Job Picker Modal */}
      <Modal
        visible={showJobPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJobPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Job</Text>
            <TouchableOpacity
              onPress={() => setShowJobPicker(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {availableJobs.map(job => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobOption}
                onPress={() => {
                  setSelectedJob(job);
                  setShowJobPicker(false);
                }}
                testID={`job-option-${job.id}`}
              >
                <Text style={styles.jobType}>{job.type}</Text>
                <Text style={styles.jobDescription}>{job.description}</Text>
                <Text style={styles.jobDate}>{formatDate(job.scheduledDate)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  saveButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  pickerButtonPlaceholder: {
    color: Colors.text.light,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dueDateInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text.primary,
  },
  dueDateButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  dueDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dueDateButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addItemButtonText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  removeItemButton: {
    padding: 4,
  },
  itemInput: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  itemInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  numberInput: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
    paddingVertical: 8,
  },
  taxInput: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text.primary,
    width: 100,
  },
  totalsSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  totalValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  grandTotalLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '700' as const,
  },
  grandTotalValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  customerOption: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  jobOption: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobType: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  jobDate: {
    fontSize: 12,
    color: Colors.text.light,
  },
});