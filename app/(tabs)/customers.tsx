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
import { useAppStore } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { Customer } from '@/types';
import { useTranslation } from '@/constants/translations';

export default function CustomersScreen() {
  const { customers, isLoading, language, canAccess } = useAppStore();
  const { colors } = useTheme();
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
      style={[styles.customerCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={() => router.push({
        pathname: '/customer-details',
        params: { customerId: item.id }
      })}
      testID={`customer-item-${item.id}`}
      activeOpacity={0.7}
    >
      <View style={styles.customerContent}>
        <Text style={[styles.customerName, { color: colors.text.primary }]}>{item.name}</Text>
        <ChevronRight size={22} color={colors.text.light} />
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => null;





  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: t.customers,
          headerRight: () => canAccess('canAddEditCustomers') ? (
            <TouchableOpacity
              onPress={() => router.push('/new-customer')}
              style={styles.headerButton}
              testID="new-customer-button"
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : null,
        }} 
      />

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.text.light} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder={t.searchCustomers}
            placeholderTextColor={colors.text.light}
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
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },

  customerCard: {
    borderBottomWidth: 0.5,
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
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
});