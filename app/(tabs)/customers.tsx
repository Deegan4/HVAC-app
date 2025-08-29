import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Phone, Mail, MapPin, Plus, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function CustomersScreen() {
  const { customers, isLoading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.address.toLowerCase().includes(query) ||
      (customer.notes && customer.notes.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="customer-search"
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.customersList}>
          {filteredCustomers.map(customer => (
            <TouchableOpacity
              key={customer.id}
              style={styles.customerCard}
              onPress={() => router.push({
                pathname: '/customer-details',
                params: { customerId: customer.id }
              })}
              testID={`customer-card-${customer.id}`}
            >
              <View style={styles.customerHeader}>
                <View style={styles.avatarContainer}>
                  <User size={24} color={Colors.text.inverse} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  {customer.notes && (
                    <Text style={styles.customerNote} numberOfLines={1}>
                      {customer.notes}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Phone size={14} color={Colors.text.secondary} />
                  <Text style={styles.contactText}>{customer.phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Mail size={14} color={Colors.text.secondary} />
                  <Text style={styles.contactText}>{customer.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MapPin size={14} color={Colors.text.secondary} />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {customer.address}
                  </Text>
                </View>
              </View>

              <View style={styles.customerFooter}>
                <Text style={styles.customerSince}>
                  Customer since {new Date(customer.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCustomers.length === 0 && (
          <View style={styles.emptyState}>
            <User size={48} color={Colors.text.light} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            {searchQuery ? (
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search terms
              </Text>
            ) : (
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first customer
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-customer')}
        testID="new-customer-fab"
      >
        <Plus size={24} color={Colors.text.inverse} />
      </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  customersList: {
    padding: 16,
    gap: 12,
    paddingBottom: 140,
  },
  customerCard: {
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
    marginBottom: 12,
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
  },
  customerNote: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
    fontStyle: 'italic' as const,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  customerFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  customerSince: {
    fontSize: 12,
    color: Colors.text.light,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 8,
    textAlign: 'center' as const,
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
});