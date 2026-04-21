import React, { useState, useMemo } from 'react';
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
import { DollarSign, Calendar, User, CheckCircle, Clock, AlertCircle, FileText, Plus, Search, Edit3, Trash2, Share, CreditCard, Receipt, TrendingUp } from 'lucide-react-native';
import { useAppStore, useRevenueStats } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { Invoice, InvoiceItem } from '@/types';
import { router } from 'expo-router';
import { useTranslation } from '@/constants/translations';
import { SkeletonList, SkeletonInvoiceCard } from '@/components/SkeletonLoader';

export default function InvoicesScreen() {
  const { invoices, isLoading, updateInvoiceStatus, deleteInvoice, customers, jobs, language } = useAppStore();
  const { colors } = useTheme();
  const t = useTranslation(language);
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
        return <CheckCircle size={16} color={colors.status.completed} />;
      case 'sent':
        return <Clock size={16} color={colors.status.inProgress} />;
      case 'overdue':
        return <AlertCircle size={16} color={colors.status.emergency} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return colors.status.completed;
      case 'sent':
        return colors.status.inProgress;
      case 'overdue':
        return colors.status.emergency;
      case 'draft':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    Alert.alert(
      t.deleteInvoice,
      t.deleteInvoiceConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteInvoice(invoiceId);
            if (selectedInvoice?.id === invoiceId) {
              setShowInvoiceDetails(false);
              setSelectedInvoice(null);
            }
          }
        }
      ]
    );
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push({
      pathname: '/new-invoice',
      params: { invoiceId: invoice.id }
    });
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t.invalidAmount, t.enterValidAmount);
      return;
    }
    
    if (amount > (selectedInvoice.total - selectedInvoice.paidAmount)) {
      Alert.alert(t.invalidAmount, t.paymentExceedsBalance);
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
    Alert.alert(t.shareInvoice, `${t.invoice} #${invoice.id} ${t.sharingFunctionality}`);
  };

  const handleCreateInvoice = () => {
    router.push('/new-invoice');
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <SkeletonList count={5} CardComponent={SkeletonInvoiceCard} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header with Create Button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t.invoices}</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateInvoice}
          testID="create-invoice-button"
        >
          <Plus size={20} color={colors.text.inverse} />
          <Text style={[styles.createButtonText, { color: colors.text.inverse }]}>{t.new}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder={t.searchInvoices}
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
        {/* Revenue Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <DollarSign size={20} color={colors.primary} />
            <Text style={[styles.statAmount, { color: colors.text.primary }]}>
              ${revenueStats.monthlyTotal.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.monthlyTotal}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <CheckCircle size={20} color={colors.status.completed} />
            <Text style={[styles.statAmount, { color: colors.status.completed }]}>
              ${revenueStats.monthlyPaid.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t.paid}</Text>
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
                { backgroundColor: colors.surface, borderColor: colors.border },
                filter === status && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setFilter(status)}
            >
              <Text style={[
                styles.filterTabText,
                { color: colors.text.secondary },
                filter === status && { color: colors.text.inverse }
              ]}>
                {status === 'all' ? t.all : status === 'draft' ? t.draft : status === 'sent' ? t.sent : status === 'paid' ? t.paid : t.overdue}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoices List */}
        <View style={styles.invoicesList}>
          {filteredInvoices.map(invoice => (
            <TouchableOpacity
              key={invoice.id}
              style={[styles.invoiceCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
              onPress={() => handleInvoicePress(invoice)}
              testID={`invoice-card-${invoice.id}`}
            >
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={[styles.invoiceNumber, { color: colors.text.primary }]}>#{invoice.id}</Text>
                  <Text style={[styles.invoiceDate, { color: colors.text.secondary }]}>
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
                <User size={14} color={colors.text.secondary} />
                <Text style={[styles.customerName, { color: colors.text.primary }]}>{invoice.customerName}</Text>
              </View>

              <View style={styles.invoiceItems}>
                {invoice.items.slice(0, 2).map(item => (
                  <Text key={item.id} style={[styles.itemText, { color: colors.text.secondary }]} numberOfLines={1}>
                    • {item.description} (${item.total.toFixed(2)})
                  </Text>
                ))}
                {invoice.items.length > 2 && (
                  <Text style={[styles.moreItems, { color: colors.text.light }]}>
                    +{invoice.items.length - 2} more items
                  </Text>
                )}
              </View>

              <View style={[styles.invoiceFooter, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.dueLabel, { color: colors.text.secondary }]}>{t.dueDate}</Text>
                  <Text style={[styles.dueDate, { color: colors.text.primary }]}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={[styles.invoiceTotalLabel, { color: colors.text.secondary }]}>{t.total}</Text>
                  <Text style={[styles.totalAmount, { color: colors.primary }]}>
                    ${invoice.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.invoiceActions}>
                {invoice.status === 'draft' && (
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: colors.primary }]}
                    onPress={() => updateInvoiceStatus(invoice.id, 'sent')}
                  >
                    <Text style={[styles.sendButtonText, { color: colors.text.inverse }]}>{t.sendInvoice}</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => handleEditInvoice(invoice)}
                    testID={`edit-invoice-${invoice.id}`}
                  >
                    <Edit3 size={16} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => handleShareInvoice(invoice)}
                    testID={`share-invoice-${invoice.id}`}
                  >
                    <Share size={16} color={colors.primary} />
                  </TouchableOpacity>
                  
                  {invoice.status !== 'paid' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.background }]}
                      onPress={() => {
                        setSelectedInvoice(invoice);
                        setShowPaymentModal(true);
                      }}
                      testID={`record-payment-${invoice.id}`}
                    >
                      <CreditCard size={16} color={colors.status.completed} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.background }]}
                    onPress={() => handleDeleteInvoice(invoice.id)}
                    testID={`delete-invoice-${invoice.id}`}
                  >
                    <Trash2 size={16} color={colors.status.emergency} />
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
                <FileText size={48} color={colors.text.light} />
                <Text style={[styles.emptyStateText, { color: colors.text.light }]}>{t.noInvoicesFound}</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.text.light }]}>
                  {t.tryAdjustingSearch}
                </Text>
              </>
            ) : (
              <>
                <View style={[styles.welcomeIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Receipt size={48} color={colors.primary} />
                </View>
                <Text style={[styles.welcomeTitle, { color: colors.text.primary }]}>{t.startInvoicing}</Text>
                <Text style={[styles.welcomeSubtitle, { color: colors.text.secondary }]}>
                  {t.createProfessionalInvoices}
                </Text>
                
                <TouchableOpacity
                  style={[styles.getStartedButton, { backgroundColor: colors.primary }]}
                  onPress={handleCreateInvoice}
                >
                  <Plus size={20} color={colors.text.inverse} />
                  <Text style={[styles.getStartedButtonText, { color: colors.text.inverse }]}>{t.createFirstInvoice}</Text>
                </TouchableOpacity>
                
                <View style={styles.featuresSection}>
                  <Text style={[styles.featuresTitle, { color: colors.text.primary }]}>{t.invoiceFeatures}</Text>
                  
                  <View style={[styles.featureItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <TrendingUp size={20} color={colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{t.trackRevenue}</Text>
                      <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                        {t.monitorMonthlyIncome}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.featureItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <CreditCard size={20} color={colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{t.paymentRecording}</Text>
                      <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                        {t.trackPartialPayments}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.featureItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <Share size={20} color={colors.primary} />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{t.easySharing}</Text>
                      <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                        {t.sendInvoicesDirectly}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
                  <AlertCircle size={16} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.text.inverse }]}>
                    {t.tipSetupCompanyInfo}
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
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {t.invoice} #{selectedInvoice?.id}
            </Text>
            <TouchableOpacity
              onPress={() => setShowInvoiceDetails(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>{t.done}</Text>
            </TouchableOpacity>
          </View>
          
          {selectedInvoice && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.invoiceDetailsCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>{t.customer}:</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary }]}>{selectedInvoice.customerName}</Text>
                </View>
                
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>{t.date}:</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                    {new Date(selectedInvoice.date).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>{t.dueDate}:</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>{t.status}:</Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(selectedInvoice.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(selectedInvoice.status) }]}>
                      {selectedInvoice.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.itemsSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t.items}</Text>
                {selectedInvoice.items.map(item => (
                  <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.itemDetails}>
                      <Text style={[styles.itemDescription, { color: colors.text.primary }]}>{item.description}</Text>
                      <Text style={[styles.itemMeta, { color: colors.text.secondary }]}>
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={[styles.itemTotal, { color: colors.text.primary }]}>${item.total.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={[styles.totalsSection, { backgroundColor: colors.surface }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>{t.subtotal}:</Text>
                  <Text style={[styles.totalValue, { color: colors.text.primary }]}>${selectedInvoice.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>{t.tax}:</Text>
                  <Text style={[styles.totalValue, { color: colors.text.primary }]}>${selectedInvoice.tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.grandTotalLabel, { color: colors.text.primary }]}>{t.total}:</Text>
                  <Text style={[styles.grandTotalValue, { color: colors.primary }]}>${selectedInvoice.total.toFixed(2)}</Text>
                </View>
                {selectedInvoice.paidAmount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>{t.paid}:</Text>
                    <Text style={[styles.totalValue, { color: colors.status.completed }]}>
                      ${selectedInvoice.paidAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                {selectedInvoice.paidAmount < selectedInvoice.total && (
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text.secondary }]}>{t.balance}:</Text>
                    <Text style={[styles.totalValue, { color: colors.status.emergency }]}>
                      ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
              
              {selectedInvoice.notes && (
                <View style={[styles.notesSection, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t.notes}</Text>
                  <Text style={[styles.notesText, { color: colors.text.primary }]}>{selectedInvoice.notes}</Text>
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
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t.recordPayment}</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentForm}>
            <Text style={[styles.formLabel, { color: colors.text.primary }]}>{t.paymentAmount}</Text>
            <TextInput
              style={[styles.paymentInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text.primary }]}
              placeholder="0.00"
              placeholderTextColor={colors.text.light}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              testID="payment-amount-input"
            />
            
            <Text style={[styles.formLabel, { color: colors.text.primary }]}>{t.paymentMethod}</Text>
            <View style={styles.paymentMethods}>
              {(['cash', 'check', 'card', 'transfer'] as const).map(method => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    paymentMethod === method && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    { color: colors.text.secondary },
                    paymentMethod === method && { color: colors.text.inverse }
                  ]}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedInvoice && (
              <View style={[styles.paymentSummary, { backgroundColor: colors.surface }]}>
                <Text style={[styles.summaryText, { color: colors.text.primary }]}>
                  {t.invoiceTotal}: ${selectedInvoice.total.toFixed(2)}
                </Text>
                <Text style={[styles.summaryText, { color: colors.text.primary }]}>
                  {t.alreadyPaid}: ${selectedInvoice.paidAmount.toFixed(2)}
                </Text>
                <Text style={[styles.summaryText, { color: colors.text.primary }]}>
                  {t.remaining}: ${(selectedInvoice.total - selectedInvoice.paidAmount).toFixed(2)}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.recordPaymentButton, { backgroundColor: colors.primary }]}
              onPress={handleRecordPayment}
              testID="record-payment-button"
            >
              <Text style={[styles.recordPaymentButtonText, { color: colors.text.inverse }]}>{t.recordPayment}</Text>
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
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
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 14,
  },
  invoicesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 140,
  },
  invoiceCard: {
    borderRadius: 12,
    padding: 16,
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
  },
  invoiceDate: {
    fontSize: 12,
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
  },
  invoiceItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 13,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  dueLabel: {
    fontSize: 11,
  },
  dueDate: {
    fontSize: 13,
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  invoiceTotalLabel: {
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  sendButton: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  sendButtonText: {
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
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  invoiceDetailsCard: {
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
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  itemsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  totalsSection: {
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
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  notesSection: {
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    marginTop: 16,
  },
  paymentInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  paymentMethodText: {
    fontSize: 14,
  },
  paymentSummary: {
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  recordPaymentButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
  },
  recordPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  welcomeIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center' as const,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 32,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  featuresSection: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  featureItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});