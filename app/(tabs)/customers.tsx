import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Search, Plus, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Customer } from '@/types';

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

  // Sort customers alphabetically by name
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      // Put phone numbers at the top
      const aIsPhone = /^\d/.test(a.name);
      const bIsPhone = /^\d/.test(b.name);
      
      if (aIsPhone && !bIsPhone) return -1;
      if (!aIsPhone && bIsPhone) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [filteredCustomers]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => router.push({
        pathname: '/customer-details',
        params: { customerId: item.id }
      })}
      testID={`customer-item-${item.id}`}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <ChevronRight size={20} color={Colors.text.light} />
    </TouchableOpacity>
  );





  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Customers',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/new-customer')}
              style={styles.headerButton}
              testID="new-customer-button"
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="customer-search"
          />
        </View>
      </View>

      <FlatList
        data={sortedCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first customer
              </Text>
            )}
          </View>
        }
      />
    </View>
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
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  listContent: {
    flexGrow: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  customerName: {
    fontSize: 17,
    color: Colors.text.primary,
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
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});