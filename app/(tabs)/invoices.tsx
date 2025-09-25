import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, Calendar, User, CheckCircle, Clock, AlertCircle, FileText, Plus, Search, Edit3, Trash2, Share, CreditCard, Receipt, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore, useRevenueStats } from '@/hooks/app-store';
import { Invoice, InvoiceItem } from '@/types';
import { router } from 'expo-router';

export default function InvoicesScreen() {
  const { invoices, isLoading, updateInvoiceStatus, customers, jobs } = useAppStore();
  const revenueStats = useRevenueStats();
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check' | 'card' | 'transfer'>('cash');

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    
    if (filter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.items.some(item => item.description.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, filter, searchQuery]);

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} color={Colors.status.completed} />;
      case 'sent':
        return <Clock size={16} color={Colors.status.inProgress} />;
      case 'overdue':
        return <AlertCircle size={16} color={Colors.status.emergency} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return Colors.status.completed;
      case 'sent':
        return Colors.status.inProgress;
      case 'overdue':
        return Colors.status.emergency;
      case 'draft':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Add delete invoice functionality to app store
            console.log('Delete invoice:', invoiceId);
          }
        }
      ]
    );
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    
    if (amount > (selectedInvoice.total - selectedInvoice.paidAmount)) {
      Alert.alert('Invalid Amount', 'Payment amount cannot exceed the remaining balance.');
      return;
    }
    
    // TODO: Add record payment functionality to app store
    console.log('Record payment:', { invoiceId: selectedInvoice.id, amount, method: paymentMethod });
    
    // Update invoice status if fully paid
    const newPaidAmount = selectedInvoice.paidAmount + amount;
    if (newPaidAmount >= selectedInvoice.total) {
      updateInvoiceStatus(selectedInvoice.id, 'paid');
    }
    
    setShowPaymentModal(false);
    setPaymentAmount('');
    setSelectedInvoice(null);
  };

  const handleShareInvoice = (invoice: Invoice) => {
    // TODO: Implement PDF generation and sharing
    Alert.alert('Share Invoice', `Invoice #${invoice.id} sharing functionality will be implemented.`);
  };

  const handleCreateInvoice = () => {
    router.push('/new-invoice');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateInvoice}
          testID="create-invoice-button"
        >
          <Plus size={20} color={Colors.text.inverse} />
          <Text style={styles.createButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
        {/* Revenue Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.statAmount}>
              ${revenueStats.monthlyTotal.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Monthly Total</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color={Colors.status.completed} />
            <Text style={[styles.statAmount, { color: Colors.status.completed }]}>
              ${revenueStats.monthlyPaid.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && styles.filterTabActive
              ]}
              onPress={() => setFilter(status)}
            >
              <Text style={[
                styles.filterTabText,
                filter === status && styles.filterTabTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoices List */}
        <View style={styles.invoicesList}>
          {filteredInvoices.map(invoice => (
            <TouchableOpacity
              key={invoice.id}
              style={styles.invoiceCard}
              onPress={() => handleInvoicePress(invoice)}
              testID={`invoice-card-${invoice.id}`}
            >
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={styles.invoiceNumber}>#{invoice.id}</Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(invoice.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(invoice.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.customerInfo}>
                <User size={14} color={Colors.text.secondary} />
                <Text style={styles.customerName}>{invoice.customerName}</Text>
              </View>

              <View style={styles.invoiceItems}>
                {invoice.items.slice(0, 2).map(item => (
                  <Text key={item.id} style={styles.itemText} numberOfLines={1}>
                    • {item.description} (${item.total.toFixed(2)})
                  </Text>
                ))}
                {invoice.items.length > 2 && (
                  <Text style={styles.moreItems}>
                    +{invoice.items.length - 2} more items
                  </Text>
                )}
              </View>

              <View style={styles.invoiceFooter}>
                <View>
                  <Text style={styles.dueLabel}>Due Date</Text>
                  <Text style={styles.dueDate}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.invoiceTotalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>
                    ${invoice.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.invoiceActions}>
                {invoice.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => updateInvoiceStatus(invoice.id, 'sent')}
                  >
                    <Text style={styles.sendButtonText}>Send Invoice</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareInvoice(invoice)}
                    testID={`share-invoice-${invoice.id}`}
                  >
                    <Share size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  
                  {invoice.status !== 'paid' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedInvoice(invoice);
                        setShowPaymentModal(true);
                      }}
                      testID={`record-payment-${invoice.id}`}
                    >
                      <CreditCard size={16} color={Colors.status.completed} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteInvoice(invoice.id)}
                    testID={`delete-invoice-${invoice.id}`}
                  >
                    <Trash2 size={16} color={Colors.status.emergency} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredInvoices.length === 0 && (
          <View style={styles.emptyState}>
            {searchQuery || filter !== 'all' ? (
              <>
                <FileText size={48} color={Colors.text.light} />
                <Text style={styles.emptyStateText}>No invoices found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or filter
                </Text>
              </>
            ) : (
              <>
                <View style={styles.welcomeIconContainer}>
                  <Receipt size={48} color={Colors.primary} />
                </View>
                <Text style={styles.welcomeTitle}>Start Invoicing</Text>
                <Text style={styles.welcomeSubtitle}>
                  Create professional invoices and track payments
                </Text>
                
                <TouchableOpacity
                  style={styles.getStartedButton}
                  onPress={handleCreateInvoice}
                >
                  <Plus size={20} color={Colors.text.inverse} />
                  <Text style={styles.getStartedButtonText}>Create Your First Invoice</Text>
                </TouchableOpacity>
                
                <View style={styles.featuresSection}>
                  <Text style={styles.featuresTitle}>Invoice Features</Text>
                  
                  <View style={styles.featureItem}>
                    <TrendingUp size={20} color={Colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Track Revenue</Text>
                      <Text style={styles.featureDescription}>
                        Monitor monthly income and payment status
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <CreditCard size={20} color={Colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Payment Recording</Text>
                      <Text style={styles.featureDescription}>
                        Track partial payments and outstanding balances
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Share size={20} color={Colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Easy Sharing</Text>
                      <Text style={styles.featureDescription}>
                        Send invoices directly to customers via email or text
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.tipCard}>
                  <AlertCircle size={16} color={Colors.primary} />
                  <Text style={styles.tipText}>
                    Tip: Set up your company info first to automatically include it on invoices
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Invoice Details Modal */}
      <Modal
        visible={showInvoiceDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvoiceDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Invoice #{selectedInvoice?.id}
            </Text>
            <TouchableOpacity
              onPress={() => setShowInvoiceDetails(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          {selectedInvoice && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.invoiceDetailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer:</Text>
                  <Text style={styles.detailValue}>{selectedInvoice.customerName}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedInvoice.date).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(selectedInvoice.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(selectedInvoice.status) }]}>
                      {selectedInvoice.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Items</Text>
                {selectedInvoice.items.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <Text style={styles.itemMeta}>
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>${selectedInvoice.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax:</Text>
                  <Text style={styles.totalValue}>${selectedInvoice.tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>Total:</Text>
                  <Text style={styles.grandTotalValue}>${selectedInvoice.total.toFixed(2)}</Text>
                </View>
                {selectedInvoice.paidAmount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Paid:</Text>
                    <Text style={[styles.totalValue, { color: Colors.status.completed }]}>
                      ${selectedInvoice.paidAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                {selectedInvoice.paidAmount < selectedInvoice.total && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Balance:</Text>
                    <Text style={[styles.totalValue, { color: Colors.status.emergency }]}>
                      ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
              
              {selectedInvoice.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedInvoice.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Payment Recording Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Payment Amount</Text>
            <TextInput
              style={styles.paymentInput}
              placeholder="0.00"
              placeholderTextColor={Colors.text.light}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              testID="payment-amount-input"
            />
            
            <Text style={styles.formLabel}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              {(['cash', 'check', 'card', 'transfer'] as const).map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === method && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextActive
                  ]}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedInvoice && (
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryText}>
                  Invoice Total: ${selectedInvoice.total.toFixed(2)}
                </Text>
                <Text style={styles.summaryText}>
                  Already Paid: ${selectedInvoice.paidAmount.toFixed(2)}
                </Text>
                <Text style={styles.summaryText}>
                  Remaining: ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.recordPaymentButton}
              onPress={handleRecordPayment}
              testID="record-payment-button"
            >
              <Text style={styles.recordPaymentButtonText}>Record Payment</Text>
            </TouchableOpacity>
          </View>
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
  statAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  invoicesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 140,
  },
  invoiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  invoiceDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  invoiceItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 13,
    color: Colors.text.light,
    fontStyle: 'italic' as const,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  dueLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  dueDate: {
    fontSize: 13,
    color: Colors.text.primary,
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  invoiceTotalLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginTop: 2,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  sendButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  invoiceActions: {
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
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
  invoiceDetailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  itemsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  itemMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  totalsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingTop: 12,
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
  notesSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  paymentForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  paymentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentMethodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  paymentMethodTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  paymentSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recordPaymentButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
  },
  recordPaymentButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 8,
  },
  welcomeIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 32,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
  featuresSection: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  featureItem: {
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
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.inverse,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});