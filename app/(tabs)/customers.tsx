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
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Search, Plus, ChevronRight, MapPin, Phone, Users, Upload, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Customer } from '@/types';
import { useTranslation } from '@/constants/translations';

export default function CustomersScreen() {
  const { customers, isLoading, language } = useAppStore();
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

  const renderListHeader = () => (
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
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: t.customers,
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

      <SectionList
        sections={groupedCustomers}
        renderItem={renderCustomerItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        ListHeaderComponent={renderListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No customers found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search terms
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.welcomeContainer}>
              <View style={styles.welcomeIconContainer}>
                <Users size={64} color={Colors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Your Service Business</Text>
              <Text style={styles.welcomeSubtitle}>
                Start by adding your first customer to begin scheduling jobs and tracking service history
              </Text>
              
              <TouchableOpacity
                style={styles.primaryActionCard}
                onPress={() => router.push('/new-customer')}
              >
                <View style={styles.primaryActionIcon}>
                  <Plus size={28} color={Colors.white} />
                </View>
                <View style={styles.primaryActionContent}>
                  <Text style={styles.primaryActionTitle}>Add Your First Customer</Text>
                  <Text style={styles.primaryActionDescription}>
                    Get started by adding customer details
                  </Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                  <FileText size={24} color={Colors.primary} />
                  <Text style={styles.featureTitle}>Service History</Text>
                  <Text style={styles.featureDescription}>Track all jobs and maintenance</Text>
                </View>
                <View style={styles.featureCard}>
                  <MapPin size={24} color={Colors.primary} />
                  <Text style={styles.featureTitle}>Equipment Tracking</Text>
                  <Text style={styles.featureDescription}>Manage customer equipment</Text>
                </View>
                <View style={styles.featureCard}>
                  <Phone size={24} color={Colors.primary} />
                  <Text style={styles.featureTitle}>Contact Management</Text>
                  <Text style={styles.featureDescription}>Store preferences and notes</Text>
                </View>
                <View style={styles.featureCard}>
                  <Upload size={24} color={Colors.primary} />
                  <Text style={styles.featureTitle}>Import Data</Text>
                  <Text style={styles.featureDescription}>Bulk import from CSV files</Text>
                </View>
              </View>
              
              <View style={styles.tipSection}>
                <Text style={styles.tipTitle}>💡 Pro Tip</Text>
                <Text style={styles.tipText}>
                  Add detailed notes about each customer's preferences, equipment locations, and service history to provide better service and build stronger relationships.
                </Text>
              </View>
            </ScrollView>
          )
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F5F5F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  welcomeContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  welcomeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 12,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  primaryActionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryActionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  primaryActionDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  tipSection: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.inverse,
    lineHeight: 20,
  },
});