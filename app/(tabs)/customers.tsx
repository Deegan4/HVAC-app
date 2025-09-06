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
import { Search, Plus, ChevronRight, MapPin, Phone } from 'lucide-react-native';
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
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <View style={styles.customerDetails}>
            <View style={styles.detailRow}>
              <Phone size={14} color={Colors.text.secondary} />
              <Text style={styles.customerPhone}>{item.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color={Colors.text.secondary} />
              <Text style={styles.customerAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight size={22} color={Colors.text.light} />
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
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
            {!searchQuery && (
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first customer
              </Text>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    letterSpacing: 0.5,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  customerDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  customerAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  separator: {
    height: 1,
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