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
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Plus,
  Search,
  Trash2,
  Package,
  Wrench,
  Clock,
  Download,
  Grid3X3,
  List,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImportExportManager } from '@/utils/ImportExportManager';

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

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function PriceBookScreen() {
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'parts' | 'labor' | 'service'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceBookItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy] = useState<'name' | 'price' | 'category' | 'recent'>('name');
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

  const handleExportPriceBook = async () => {
    try {
      await ImportExportManager.exportPriceBook(items);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export price book');
    }
  };

  const handleImportPriceBook = async () => {
    try {
      const importedItems = await ImportExportManager.importPriceBook();
      
      if (importedItems) {
        Alert.alert(
          'Import Price Book',
          `Found ${importedItems.length} items. How would you like to import them?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Replace All',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(importedItems));
                setItems(importedItems);
                Alert.alert('Success', 'Price book imported successfully!');
              },
            },
            {
              text: 'Merge',
              onPress: async () => {
                const existingIds = new Set(items.map(item => item.id));
                const newItems = importedItems.filter(item => !existingIds.has(item.id));
                const mergedItems = [...items, ...newItems];
                
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedItems));
                setItems(mergedItems);
                Alert.alert('Success', `${newItems.length} new items imported!`);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import price book');
    }
  };

  const showImportExportMenu = () => {
    ImportExportManager.showImportExportOptions(
      handleImportPriceBook,
      handleExportPriceBook
    );
  };

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
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
    { key: 'all', label: 'All', count: items.length },
    { key: 'parts', label: 'Parts', count: items.filter(i => i.category === 'parts').length },
    { key: 'labor', label: 'Labor', count: items.filter(i => i.category === 'labor').length },
    { key: 'service', label: 'Service', count: items.filter(i => i.category === 'service').length },
  ];

  const renderGridItem = ({ item }: { item: PriceBookItem }) => {
    const CategoryIcon = getCategoryIcon(item.category);
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity style={styles.gridCard} onPress={() => startEdit(item)}>
        <View style={styles.gridCardHeader}>
          <View style={[styles.gridIconContainer, { backgroundColor: categoryColor + '20' }]}>
            <CategoryIcon size={24} color={categoryColor} />
          </View>
          <View style={styles.gridActions}>
            <TouchableOpacity
              onPress={() => handleDeleteItem(item)}
              style={styles.gridActionButton}
            >
              <Trash2 size={16} color={Colors.status.emergency} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.gridItemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridItemDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.gridPriceContainer}>
          <Text style={styles.gridItemPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.gridItemUnit}>/{item.unit}</Text>
        </View>
        <View style={styles.gridCategoryBadge}>
          <Text style={styles.gridCategoryText}>{item.category.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: PriceBookItem }) => {
    const CategoryIcon = getCategoryIcon(item.category);
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity style={styles.listCard} onPress={() => startEdit(item)}>
        <View style={styles.listCardContent}>
          <View style={[styles.listIconContainer, { backgroundColor: categoryColor + '20' }]}>
            <CategoryIcon size={20} color={categoryColor} />
          </View>
          <View style={styles.listItemInfo}>
            <View style={styles.listItemHeader}>
              <Text style={styles.listItemName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.listPriceContainer}>
                <Text style={styles.listItemPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.listItemUnit}>/{item.unit}</Text>
              </View>
            </View>
            <Text style={styles.listItemDescription} numberOfLines={1}>{item.description}</Text>
            <View style={styles.listItemFooter}>
              <View style={styles.listCategoryBadge}>
                <Text style={styles.listCategoryText}>{item.category}</Text>
              </View>
              <View style={styles.listActions}>
                <TouchableOpacity
                  onPress={() => handleDeleteItem(item)}
                  style={styles.listActionButton}
                >
                  <Trash2 size={16} color={Colors.status.emergency} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Price Book',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text.primary,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={showImportExportMenu}
                style={styles.headerButton}
              >
                <Download size={24} color={Colors.primary} />
              </TouchableOpacity>
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
            </View>
          ),
        }}
      />

      {/* Search and Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchRow}>
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
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 
              <List size={20} color={Colors.primary} /> : 
              <Grid3X3 size={20} color={Colors.primary} />
            }
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{filteredAndSortedItems.length}</Text>
            <Text style={styles.statsLabel}>Items</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>
              ${filteredAndSortedItems.reduce((sum, item) => sum + item.price, 0).toFixed(0)}
            </Text>
            <Text style={styles.statsLabel}>Total Value</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{categories.filter(c => c.key !== 'all' && c.count > 0).length}</Text>
            <Text style={styles.statsLabel}>Categories</Text>
          </View>
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
            <View style={[
              styles.categoryCount,
              selectedCategory === category.key && styles.categoryCountActive,
            ]}>
              <Text style={[
                styles.categoryCountText,
                selectedCategory === category.key && styles.categoryCountTextActive,
              ]}>
                {category.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items List/Grid */}
      {filteredAndSortedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Package size={64} color={Colors.text.light} />
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
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => {
              resetForm();
              setEditingItem(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={20} color={Colors.text.inverse} />
            <Text style={styles.emptyStateButtonText}>Add First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedItems}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? (isTablet ? 3 : 2) : 1}
          key={viewMode + (isTablet ? 3 : 2)} // Force re-render when changing view mode
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  controlsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  categoryContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: Colors.text.inverse,
  },
  categoryCount: {
    backgroundColor: Colors.text.light + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountActive: {
    backgroundColor: Colors.text.inverse + '30',
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  categoryCountTextActive: {
    color: Colors.text.inverse,
  },
  itemsList: {
    padding: 16,
  },
  // Grid View Styles
  gridCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 180,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridActions: {
    flexDirection: 'row',
  },
  gridActionButton: {
    padding: 6,
  },
  gridItemName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 20,
  },
  gridItemDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
    flex: 1,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  gridItemPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.status.completed,
  },
  gridItemUnit: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  gridCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridCategoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  // List View Styles
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.status.completed,
  },
  listItemUnit: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  listItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCategoryBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listCategoryText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  listActions: {
    flexDirection: 'row',
  },
  listActionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
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