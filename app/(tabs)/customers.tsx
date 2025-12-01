import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SectionList,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Search, Plus, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Customer } from '@/types';
import { useTranslation } from '@/constants/translations';

export default function CustomersScreen() {
  const { customers, isLoading, language, canAccess } = useAppStore();
  const t = useTranslation(language);
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

  // Group customers alphabetically
  const groupedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    const groups: { [key: string]: Customer[] } = {};
    
    sorted.forEach(customer => {
      const firstLetter = customer.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(customer);
    });

    return Object.keys(groups)
      .sort()
      .map(letter => ({
        title: letter,
        data: groups[letter]
      }));
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
      style={styles.customerCard}
      onPress={() => router.push({
        pathname: '/customer-details',
        params: { customerId: item.id }
      })}
      testID={`customer-item-${item.id}`}
      activeOpacity={0.7}
    >
      <View style={styles.customerContent}>
        <Text style={styles.customerName}>{item.name}</Text>
        <ChevronRight size={22} color={Colors.text.light} />
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => null;





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
          title: t.customers,
          headerRight: () => canAccess('canAddEditCustomers') ? (
            <TouchableOpacity
              onPress={() => router.push('/new-customer')}
              style={styles.headerButton}
              testID="new-customer-button"
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ) : null,
        }} 
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchCustomers}
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="customer-search"
          />
        </View>
      </View>

      <SectionList
        sections={groupedCustomers}
        renderItem={renderCustomerItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
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
          </View>
        }
        ItemSeparatorComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
    paddingVertical: 8,
    backgroundColor: '#F5F5F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  listContent: {
    paddingBottom: 20,
  },

  customerCard: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  customerName: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.text.primary,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
});