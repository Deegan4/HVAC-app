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
  Image,
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
  DollarSign,
  Edit3,
  X,
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
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface NewItemForm {
  name: string;
  description: string;
  category: 'parts' | 'labor' | 'service';
  price: string;
  unit: string;
  imageUrl: string;
}

interface ServiceType {
  id: string;
  name: string;
  duration: number;
  rate: number;
}

const STORAGE_KEY = 'price_book_items';
const SERVICE_TYPES_KEY = 'serviceTypes';

const defaultItems: PriceBookItem[] = [
  // Posts & Beams
  {
    id: '1',
    name: 'CCA Treated Post 10" x 20ft',
    description: 'Pressure-treated lumber post for foundation work',
    category: 'parts',
    price: 285.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'CCA Treated Beam 12" x 25ft',
    description: 'Heavy-duty structural timber beam for deep foundation applications',
    category: 'parts',
    price: 425.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Composite Post 12" x 20ft',
    description: 'Fiberglass reinforced composite post, weather resistant',
    category: 'parts',
    price: 650.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Dock Materials
  {
    id: '4',
    name: 'Composite Deck Board 2x6x16',
    description: 'Commercial-grade composite decking, UV resistant',
    category: 'parts',
    price: 42.00,
    unit: 'board',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Pressure Treated Stringer 2x10x16',
    description: 'ACQ treated stringer lumber',
    category: 'parts',
    price: 38.00,
    unit: 'board',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Anchor Bolt 10" Aluminum',
    description: 'Heavy-duty aluminum anchor bolt',
    category: 'parts',
    price: 32.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Rubber Bumper 36"',
    description: 'Rubber bumper with mounting hardware',
    category: 'parts',
    price: 28.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Retaining Wall Materials
  {
    id: '8',
    name: 'Vinyl Sheet Pile PZ-22',
    description: 'Vinyl sheet panel for retaining wall construction',
    category: 'parts',
    price: 85.00,
    unit: 'linear ft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'Rip Rap Limestone',
    description: 'Limestone rip rap for retaining wall toe protection',
    category: 'parts',
    price: 45.00,
    unit: 'ton',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Concrete Cap Form',
    description: 'Concrete cap pour for retaining wall top',
    category: 'parts',
    price: 35.00,
    unit: 'linear ft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Hardware & Fasteners
  {
    id: '11',
    name: 'Stainless Steel Lag Bolt 1/2" x 8"',
    description: '316 stainless steel lag bolt for construction use',
    category: 'parts',
    price: 4.50,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'Galvanized Through-Bolt 5/8" x 12"',
    description: 'Hot-dip galvanized carriage bolt with nut and washer',
    category: 'parts',
    price: 6.50,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '13',
    name: 'Post Cap 12" Flat',
    description: 'Galvanized steel post cap',
    category: 'parts',
    price: 18.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '14',
    name: 'Post Wrap 12" x 100ft',
    description: 'UV-resistant PVC post wrap for weather protection',
    category: 'parts',
    price: 145.00,
    unit: 'roll',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Electrical & Lighting
  {
    id: '15',
    name: 'Solar LED Work Light',
    description: 'Commercial-grade solar powered LED work light',
    category: 'parts',
    price: 65.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '16',
    name: 'Outdoor Power Pedestal 30A/50A',
    description: 'Weatherproof outdoor power pedestal',
    category: 'parts',
    price: 1250.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '17',
    name: 'Electrical Conduit 2" PVC 10ft',
    description: 'Schedule 40 PVC conduit for outdoor electrical',
    category: 'parts',
    price: 12.00,
    unit: 'length',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Heavy Equipment Parts
  {
    id: '18',
    name: 'Lift Cable 3/8" Stainless',
    description: '7x19 stainless steel wire rope for lifts and hoists',
    category: 'parts',
    price: 185.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '19',
    name: 'Hoist Motor 1HP',
    description: 'Direct drive hoist motor with gear reducer',
    category: 'parts',
    price: 850.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '20',
    name: 'Composite Support Board 2x6x8',
    description: 'Composite support board for hoist cradle',
    category: 'parts',
    price: 35.00,
    unit: 'each',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Labor
  {
    id: '21',
    name: 'Standard Labor',
    description: 'Regular hours crew labor rate',
    category: 'labor',
    price: 125.00,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '22',
    name: 'Overtime Labor',
    description: 'After-hours and weekend crew labor',
    category: 'labor',
    price: 187.50,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '23',
    name: 'Emergency Storm Response',
    description: 'Emergency storm damage response labor',
    category: 'labor',
    price: 250.00,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '24',
    name: 'Post Installation Crew',
    description: 'Post installation crew with equipment (2-person)',
    category: 'labor',
    price: 350.00,
    unit: 'hour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Services
  {
    id: '25',
    name: 'Structural Inspection Service',
    description: 'Complete structural inspection and report',
    category: 'service',
    price: 350.00,
    unit: 'inspection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '26',
    name: 'Foundation Assessment',
    description: 'Foundation condition assessment with photos and report',
    category: 'service',
    price: 450.00,
    unit: 'assessment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '27',
    name: 'Site Evaluation',
    description: 'Site evaluation and project planning consultation',
    category: 'service',
    price: 500.00,
    unit: 'visit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '28',
    name: 'Permitting Service',
    description: 'Permit application preparation and filing',
    category: 'service',
    price: 1500.00,
    unit: 'permit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '29',
    name: 'Post Installation Service',
    description: 'Foundation post installation (includes mobilization)',
    category: 'service',
    price: 350.00,
    unit: 'post',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '30',
    name: 'Post Wrap Service',
    description: 'Clean, inspect, and treat existing posts',
    category: 'service',
    price: 85.00,
    unit: 'post',
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
    imageUrl: '',
  });
  
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([
    { id: '1', name: 'New Build Construction', duration: 480, rate: 125 },
    { id: '2', name: 'Renovation/Repair', duration: 360, rate: 135 },
    { id: '3', name: 'Foundation Work', duration: 240, rate: 175 },
    { id: '4', name: 'General Inspection', duration: 120, rate: 150 },
    { id: '5', name: 'Storm Damage Response', duration: 180, rate: 250 },
  ]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [newService, setNewService] = useState({ name: '', duration: '', rate: '' });

  useEffect(() => {
    loadItems();
    loadServiceTypes();
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

  const loadServiceTypes = async () => {
    try {
      const stored = await AsyncStorage.getItem(SERVICE_TYPES_KEY);
      if (stored) {
        setServiceTypes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading service types:', error);
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

  const saveServiceTypes = async (updatedServiceTypes: ServiceType[]) => {
    try {
      await AsyncStorage.setItem(SERVICE_TYPES_KEY, JSON.stringify(updatedServiceTypes));
      setServiceTypes(updatedServiceTypes);
    } catch (error) {
      console.error('Error saving service types:', error);
      Alert.alert('Error', 'Failed to save service types');
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
      imageUrl: newItem.imageUrl.trim() || undefined,
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
            imageUrl: newItem.imageUrl.trim() || undefined,
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
      imageUrl: item.imageUrl || '',
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
      imageUrl: '',
    });
  };

  const handleAddServiceType = () => {
    setEditingService(null);
    setNewService({ name: '', duration: '', rate: '' });
    setShowServiceModal(true);
  };

  const handleEditServiceType = (service: ServiceType) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      duration: service.duration.toString(),
      rate: service.rate.toString(),
    });
    setShowServiceModal(true);
  };

  const handleSaveServiceType = async () => {
    if (!newService.name.trim() || !newService.duration || !newService.rate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const duration = parseInt(newService.duration);
    const rate = parseFloat(newService.rate);

    if (isNaN(duration) || isNaN(rate)) {
      Alert.alert('Error', 'Please enter valid numbers for duration and rate.');
      return;
    }

    let updatedServiceTypes;
    if (editingService) {
      updatedServiceTypes = serviceTypes.map(service => 
        service.id === editingService.id 
          ? { ...service, name: newService.name.trim(), duration, rate }
          : service
      );
    } else {
      const newServiceType: ServiceType = {
        id: `service${Date.now()}`,
        name: newService.name.trim(),
        duration,
        rate,
      };
      updatedServiceTypes = [...serviceTypes, newServiceType];
    }

    await saveServiceTypes(updatedServiceTypes);
    setShowServiceModal(false);
    Alert.alert('Success', `Service type ${editingService ? 'updated' : 'added'} successfully!`);
  };

  const handleDeleteServiceType = (serviceId: string) => {
    const service = serviceTypes.find(s => s.id === serviceId);
    Alert.alert(
      'Delete Service Type',
      `Are you sure you want to delete "${service?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedServiceTypes = serviceTypes.filter(s => s.id !== serviceId);
            await saveServiceTypes(updatedServiceTypes);
            Alert.alert('Success', 'Service type deleted successfully!');
          }
        }
      ]
    );
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
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.gridItemImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.gridCardContent}>
          <View style={styles.gridCardHeader}>
            <View style={[styles.gridIconContainer, { backgroundColor: categoryColor + '20' }]}>
              <CategoryIcon size={20} color={categoryColor} />
            </View>
            <View style={styles.gridActions}>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item)}
                style={styles.gridActionButton}
              >
                <Trash2 size={14} color={Colors.status.emergency} />
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
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.listItemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listIconContainer, { backgroundColor: categoryColor + '20' }]}>
              <CategoryIcon size={20} color={categoryColor} />
            </View>
          )}
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

      {/* Service Types Section */}
      <View style={styles.serviceTypesSection}>
        <View style={styles.serviceTypesSectionHeader}>
          <Text style={styles.serviceTypesSectionTitle}>Service Types</Text>
          <TouchableOpacity onPress={handleAddServiceType} style={styles.addServiceButton}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addServiceButtonText}>Add Type</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceTypesScroll}>
          {serviceTypes.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceTypeCard}
              onPress={() => handleEditServiceType(service)}
            >
              <View style={styles.serviceTypeCardHeader}>
                <Text style={styles.serviceTypeCardName}>{service.name}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteServiceType(service.id)}
                  style={styles.serviceTypeDeleteButton}
                >
                  <X size={14} color={Colors.status.emergency} />
                </TouchableOpacity>
              </View>
              <View style={styles.serviceTypeCardDetails}>
                <View style={styles.serviceTypeCardDetail}>
                  <Clock size={14} color={Colors.text.secondary} />
                  <Text style={styles.serviceTypeCardDetailText}>{service.duration}min</Text>
                </View>
                <View style={styles.serviceTypeCardDetail}>
                  <DollarSign size={14} color={Colors.text.secondary} />
                  <Text style={styles.serviceTypeCardDetailText}>${service.rate}/hr</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Image Preview</Text>
              {newItem.imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: newItem.imageUrl }} 
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setNewItem({ ...newItem, imageUrl: '' })}
                  >
                    <Text style={styles.removeImageText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Package size={32} color={Colors.text.light} />
                  <Text style={styles.noImageText}>No image selected</Text>
                  <Text style={styles.noImageSubtext}>Images help identify parts quickly</Text>
                </View>
              )}
              <TextInput
                style={styles.formInput}
                placeholder="Paste image URL here"
                placeholderTextColor={Colors.text.secondary}
                value={newItem.imageUrl}
                onChangeText={(text) => setNewItem({ ...newItem, imageUrl: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />
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

      {/* Service Type Modal */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowServiceModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service Type' : 'Add Service Type'}
            </Text>
            <TouchableOpacity onPress={handleSaveServiceType}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Service Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newService.name}
                onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Renovation"
                placeholderTextColor={Colors.text.secondary}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration (minutes) *</Text>
              <TextInput
                style={styles.formInput}
                value={newService.duration}
                onChangeText={(text) => setNewService(prev => ({ ...prev, duration: text }))}
                placeholder="e.g., 90"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rate ($/hour) *</Text>
              <TextInput
                style={styles.formInput}
                value={newService.rate}
                onChangeText={(text) => setNewService(prev => ({ ...prev, rate: text }))}
                placeholder="e.g., 125"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
              />
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
    margin: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 220,
    overflow: 'hidden',
  },
  gridItemImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background,
  },
  gridCardContent: {
    padding: 12,
    flex: 1,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gridIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  gridItemDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 16,
    flex: 1,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  gridItemPrice: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.status.completed,
  },
  gridItemUnit: {
    fontSize: 12,
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
  listItemImage: {
    width: 60,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: Colors.background,
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
  imagePreviewContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: 8,
  },
  removeImageButton: {
    backgroundColor: Colors.status.emergency + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageText: {
    color: Colors.status.emergency,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  noImageSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 4,
    textAlign: 'center',
  },
  serviceTypesSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceTypesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  serviceTypesSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addServiceButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  serviceTypesScroll: {
    paddingHorizontal: 16,
  },
  serviceTypeCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceTypeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTypeCardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 4,
  },
  serviceTypeDeleteButton: {
    padding: 2,
  },
  serviceTypeCardDetails: {
    gap: 6,
  },
  serviceTypeCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceTypeCardDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});