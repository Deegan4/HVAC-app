import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, Calendar, User, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore, useRevenueStats } from '@/hooks/app-store';
import { Invoice } from '@/types';

export default function InvoicesScreen() {
  const { invoices, isLoading, updateInvoiceStatus } = useAppStore();
  const revenueStats = useRevenueStats();
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all');

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(invoice => invoice.status === filter);
  }, [invoices, filter]);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView}>
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
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>
                    ${invoice.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {invoice.status === 'draft' && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => updateInvoiceStatus(invoice.id, 'sent')}
                >
                  <Text style={styles.sendButtonText}>Send Invoice</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {filteredInvoices.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.text.light} />
            <Text style={styles.emptyStateText}>No invoices found</Text>
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
  totalLabel: {
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
});