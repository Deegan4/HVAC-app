import React, { useState, useEffect } from 'react';
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
import { Stack } from 'expo-router';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  DollarSign,
  Package,
  Wrench,
  Clock,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PriceBookItem {
  id: string;
  name: string;
  description: string;
  category: 'parts' | 'labor' | 'service';
  price: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface NewItemForm {
  name: string;
  description: string;
  category: 'parts' | 'labor' | 'service';
  price: string;
  unit: string;
}

const STORAGE_KEY = 'price_book_items';

const defaultItems: PriceBookItem[] = [
  {
    id: '1',
    name: 'Compressor Replacement',
    description: 'Replace faulty compressor unit',
    category: 'parts',
    price: 450.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Diagnostic Service',
    description: 'Complete system diagnostic and inspection',
    category: 'service',
    price: 125.00,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Labor - Standard Rate',
    description: 'Standard technician labor rate',
    category: 'labor',
    price: 85.00,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Refrigerant R-410A',
    description: 'R-410A refrigerant refill',
    category: 'parts',
    price: 12.50,
    unit: 'lb',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Emergency Service Call',
    description: 'After-hours emergency service',
    category: 'service',
    price: 200.00,
    unit: 'call',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function PriceBookScreen() {
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'parts' | 'labor' | 'service'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceBookItem | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: '',
    description: '',
    category: 'parts',
    price: '',
    unit: 'each',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(defaultItems);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
      }
    } catch (error) {
      console.error('Error loading price book items:', error);
      setItems(defaultItems);
    }
  };

  const saveItems = async (updatedItems: PriceBookItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Error saving price book items:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(newItem.price);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const item: PriceBookItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      category: newItem.category,
      price,
      unit: newItem.unit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = [...items, item];
    saveItems(updatedItems);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditItem = () => {
    if (!editingItem || !newItem.name.trim() || !newItem.price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(newItem.price);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const updatedItems = items.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            name: newItem.name.trim(),
            description: newItem.description.trim(),
            category: newItem.category,
            price,
            unit: newItem.unit,
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    saveItems(updatedItems);
    setEditingItem(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteItem = (item: PriceBookItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItems = items.filter(i => i.id !== item.id);
            saveItems(updatedItems);
          },
        },
      ]
    );
  };

  const startEdit = (item: PriceBookItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      unit: item.unit,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      category: 'parts',
      price: '',
      unit: 'each',
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'parts': return Package;
      case 'labor': return Clock;
      case 'service': return Wrench;
      default: return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'parts': return Colors.status.inProgress;
      case 'labor': return Colors.primary;
      case 'service': return Colors.status.completed;
      default: return Colors.text.secondary;
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'parts', label: 'Parts' },
    { key: 'labor', label: 'Labor' },
    { key: 'service', label: 'Service' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Price Book',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text.primary,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setEditingItem(null);
                setShowAddModal(true);
              }}
              style={styles.headerButton}
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.key as any)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items List */}
      <ScrollView style={styles.itemsList}>
        {filteredItems.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const categoryColor = getCategoryColor(item.category);

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemIconContainer}>
                  <CategoryIcon size={20} color={categoryColor} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => startEdit(item)}
                    style={styles.actionButton}
                  >
                    <Edit3 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={18} color={Colors.status.emergency} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemFooter}>
                <View style={styles.priceContainer}>
                  <DollarSign size={16} color={Colors.status.completed} />
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.itemUnit}>/ {item.unit}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.text.light} />
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedCategory !== 'all'
                ? 'No items match your search'
                : 'No items in price book'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first item to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>
            <TouchableOpacity
              onPress={editingItem ? handleEditItem : handleAddItem}
            >
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Item name"
                placeholderTextColor={Colors.text.secondary}
                value={newItem.name}
                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Item description"
                placeholderTextColor={Colors.text.secondary}
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {['parts', 'labor', 'service'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categorySelectorButton,
                      newItem.category === category && styles.categorySelectorButtonActive,
                    ]}
                    onPress={() => setNewItem({ ...newItem, category: category as any })}
                  >
                    <Text
                      style={[
                        styles.categorySelectorButtonText,
                        newItem.category === category && styles.categorySelectorButtonTextActive,
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.formLabel}>Price *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.text.secondary}
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="each"
                  placeholderTextColor={Colors.text.secondary}
                  value={newItem.unit}
                  onChangeText={(text) => setNewItem({ ...newItem, unit: text })}
                />
              </View>
            </View>
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
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  categoryContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: Colors.text.inverse,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.light,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.status.completed,
  },
  itemUnit: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancelButton: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categorySelectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  categorySelectorButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categorySelectorButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  categorySelectorButtonTextActive: {
    color: Colors.text.inverse,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});