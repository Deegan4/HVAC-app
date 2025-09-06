import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  RefreshControl,
  FlatList,
  Animated,
} from 'react-native';
import {
  MapPin,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Car,
  Wrench,
  Coffee,
  Home,
  X,
  ChevronRight,
  Map,
  List,
  MessageCircle,
  Battery,
  Signal,
  RefreshCw,
  Activity,
  TrendingUp,
  BarChart3,
  Circle,
  Route,
  Timer,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Technician, TechnicianStatus, TrackingFilter } from '@/types';
import EnhancedMapView from '@/components/EnhancedMapView';

const { width, height } = Dimensions.get('window');

interface QuickStat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: number;
}



function getStatusColor(status: TechnicianStatus['status'] | 'offline'): string {
  switch (status) {
    case 'on-route': return Colors.warning;
    case 'at-job': return Colors.success;
    case 'break': return Colors.info;
    case 'returning': return Colors.primary;
    case 'offline': return Colors.text.secondary;
    default: return Colors.text.secondary;
  }
}

function getStatusIcon(status: TechnicianStatus['status'] | 'offline') {
  switch (status) {
    case 'on-route': return Car;
    case 'at-job': return Wrench;
    case 'break': return Coffee;
    case 'returning': return Home;
    case 'offline': return Circle;
    default: return Circle;
  }
}

function getStatusLabel(status: TechnicianStatus['status'] | 'offline'): string {
  switch (status) {
    case 'on-route': return 'Driving';
    case 'at-job': return 'Working';
    case 'break': return 'On Break';
    case 'returning': return 'Returning';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
}

interface TechnicianCardProps {
  technician: Technician;
  onPress: () => void;
  isSelected: boolean;
}

function TechnicianCard({ technician, onPress, isSelected }: TechnicianCardProps) {
  const StatusIcon = getStatusIcon(technician.status?.status || 'offline');
  const statusColor = getStatusColor(technician.status?.status || 'offline');
  const statusLabel = getStatusLabel(technician.status?.status || 'offline');
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (isSelected) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [isSelected, animatedValue]);
  
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'No recent update';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.technicianCard,
          isSelected && styles.selectedCard
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <StatusIcon size={24} color={statusColor} />
          </View>
          
          <View style={styles.cardInfo}>
            <View style={styles.cardMainInfo}>
              <Text style={styles.technicianName}>{technician.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
            
            {technician.location?.address && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={Colors.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {technician.location.address}
                </Text>
              </View>
            )}
            
            {technician.status?.estimatedArrival && (
              <View style={styles.etaRow}>
                <Clock size={12} color={Colors.primary} />
                <Text style={styles.etaText}>
                  ETA {new Date(technician.status.estimatedArrival).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              Alert.alert(
                'Contact ' + technician.name,
                'How would you like to contact this technician?',
                [
                  { text: 'Call', onPress: () => console.log('Calling...') },
                  { text: 'Message', onPress: () => console.log('Messaging...') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}>
              <MessageCircle size={18} color={Colors.primary} />
            </TouchableOpacity>
            <ChevronRight size={20} color={Colors.text.secondary} />
          </View>
        </View>
        
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Battery size={12} color={Colors.text.secondary} />
            <Text style={styles.metaText}>85%</Text>
          </View>
          <View style={styles.metaItem}>
            <Signal size={12} color={Colors.text.secondary} />
            <Text style={styles.metaText}>Strong</Text>
          </View>
          <Text style={styles.lastUpdateText}>
            {formatLastUpdate(technician.lastUpdate)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface FilterModalProps {
  visible: boolean;
  filter: TrackingFilter;
  onFilterChange: (filter: TrackingFilter) => void;
  onClose: () => void;
}

function FilterModal({ visible, filter, onFilterChange, onClose }: FilterModalProps) {
  if (!visible) return null;

  const statusOptions: TechnicianStatus['status'][] = ['on-route', 'at-job', 'break', 'returning', 'offline'];
  const availabilityOptions: Technician['availability'][] = ['available', 'busy', 'offline'];

  const toggleStatus = (status: TechnicianStatus['status']) => {
    const currentStatuses = filter.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filter, status: newStatuses });
  };

  const toggleAvailability = (availability: Technician['availability']) => {
    const currentAvailability = filter.availability || [];
    const newAvailability = currentAvailability.includes(availability)
      ? currentAvailability.filter(a => a !== availability)
      : [...currentAvailability, availability];
    onFilterChange({ ...filter, availability: newAvailability });
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.filterModal}>
        <Text style={styles.modalTitle}>Filter Technicians</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status</Text>
          {statusOptions.map(status => (
            <TouchableOpacity
              key={status}
              style={styles.filterOption}
              onPress={() => toggleStatus(status)}
            >
              <View style={[
                styles.checkbox,
                (filter.status || []).includes(status) && styles.checkedBox
              ]} />
              <Text style={styles.filterOptionText}>
                {status.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Availability</Text>
          {availabilityOptions.map(availability => (
            <TouchableOpacity
              key={availability}
              style={styles.filterOption}
              onPress={() => toggleAvailability(availability)}
            >
              <View style={[
                styles.checkbox,
                (filter.availability || []).includes(availability) && styles.checkedBox
              ]} />
              <Text style={styles.filterOptionText}>
                {availability.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.clearButton]}
            onPress={() => onFilterChange({})}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.applyButton]}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface AnalyticsViewProps {
  technicians: Technician[];
}

function AnalyticsView({ technicians }: AnalyticsViewProps) {
  const analytics = useMemo(() => {
    const total = technicians.length;
    const active = technicians.filter(tech => tech.availability !== 'offline').length;
    const onRoute = technicians.filter(tech => tech.status?.status === 'on-route').length;
    const atJob = technicians.filter(tech => tech.status?.status === 'at-job').length;
    const onBreak = technicians.filter(tech => tech.status?.status === 'break').length;
    
    // Calculate average response time (mock data)
    const avgResponseTime = Math.floor(Math.random() * 20) + 15; // 15-35 minutes
    const completionRate = Math.floor((atJob / Math.max(total, 1)) * 100);
    const efficiency = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    return {
      total,
      active,
      onRoute,
      atJob,
      onBreak,
      avgResponseTime,
      completionRate,
      efficiency,
    };
  }, [technicians]);

  return (
    <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Activity size={24} color={Colors.primary} />
            <Text style={styles.analyticsTitle}>Active Technicians</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.active}/{analytics.total}</Text>
          <Text style={styles.analyticsSubtext}>Currently working</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Route size={24} color={Colors.warning} />
            <Text style={styles.analyticsTitle}>On Route</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.onRoute}</Text>
          <Text style={styles.analyticsSubtext}>Traveling to jobs</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={styles.analyticsTitle}>At Job Sites</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.atJob}</Text>
          <Text style={styles.analyticsSubtext}>Currently working</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Timer size={24} color={Colors.info} />
            <Text style={styles.analyticsTitle}>Avg Response</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.avgResponseTime}m</Text>
          <Text style={styles.analyticsSubtext}>Response time</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <TrendingUp size={24} color={Colors.success} />
            <Text style={styles.analyticsTitle}>Efficiency</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.efficiency}%</Text>
          <Text style={styles.analyticsSubtext}>Overall performance</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <BarChart3 size={24} color={Colors.primary} />
            <Text style={styles.analyticsTitle}>Completion Rate</Text>
          </View>
          <Text style={styles.analyticsValue}>{analytics.completionRate}%</Text>
          <Text style={styles.analyticsSubtext}>Jobs completed today</Text>
        </View>
      </View>
      
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Route Optimization</Text>
          <Text style={styles.insightText}>
            Technicians could save an average of 12 minutes per job with optimized routing.
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Peak Hours</Text>
          <Text style={styles.insightText}>
            Highest activity between 10 AM - 2 PM. Consider scheduling more technicians during these hours.
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Battery Optimization</Text>
          <Text style={styles.insightText}>
            Location tracking is optimized for battery life with 30-second intervals during active jobs.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function TrackingScreen() {
  const { technicians, userRole } = useAppStore();
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filter, setFilter] = useState<TrackingFilter>({});
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'analytics'>('list');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      // Search filter
      if (searchQuery && !tech.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(tech.status?.status || 'offline')) {
          return false;
        }
      }

      // Availability filter
      if (filter.availability && filter.availability.length > 0) {
        if (!filter.availability.includes(tech.availability)) {
          return false;
        }
      }

      // Show only active filter
      if (filter.showOnlyActive && tech.availability === 'offline') {
        return false;
      }

      return true;
    });
  }, [technicians, searchQuery, filter]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Updating technician locations...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  }, []);





  // Quick stats calculation
  const quickStats = useMemo((): QuickStat[] => {
    const active = technicians.filter(t => t.availability !== 'offline').length;
    const onRoute = technicians.filter(t => t.status?.status === 'on-route').length;
    const atJob = technicians.filter(t => t.status?.status === 'at-job').length;
    const onBreak = technicians.filter(t => t.status?.status === 'break').length;
    
    return [
      { label: 'Active', value: active, icon: Users, color: Colors.success },
      { label: 'On Route', value: onRoute, icon: Car, color: Colors.warning },
      { label: 'At Job', value: atJob, icon: Wrench, color: Colors.primary },
      { label: 'Break', value: onBreak, icon: Coffee, color: Colors.info },
    ];
  }, [technicians]);





  if (userRole !== 'owner') {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            Technician tracking is only available for owners
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerSubtitle}>
          <Text style={styles.headerSubtitleText}>
            {technicians.length} technicians • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + '20' }
                ]}>
                  <Icon size={18} color={stat.color} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? Colors.white : Colors.text.primary} />
            <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'map' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Map size={16} color={viewMode === 'map' ? Colors.white : Colors.text.primary} />
            <Text style={[styles.viewModeText, viewMode === 'map' && styles.viewModeTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'analytics' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('analytics')}
          >
            <BarChart3 size={16} color={viewMode === 'analytics' ? Colors.white : Colors.text.primary} />
            <Text style={[styles.viewModeText, viewMode === 'analytics' && styles.viewModeTextActive]}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or location..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              (filter.status?.length || filter.availability?.length) ? styles.filterButtonActive : {}
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={16} color={
              (filter.status?.length || filter.availability?.length) ? Colors.white : Colors.primary
            } />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <EnhancedMapView
            technicians={filteredTechnicians}
            selectedTechnician={selectedTechnician}
            onTechnicianSelect={setSelectedTechnician}
            showRoutes={true}
            showGeofences={false}
          />
        </View>
      ) : viewMode === 'analytics' ? (
        <AnalyticsView technicians={filteredTechnicians} />
      ) : (
        <FlatList
          data={filteredTechnicians}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TechnicianCard
              technician={item}
              isSelected={selectedTechnician === item.id}
              onPress={() => {
                setSelectedTechnician(
                  selectedTechnician === item.id ? null : item.id
                );
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyTitle}>No technicians found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'No technicians available'}
              </Text>
            </View>
          }
        />
      )}



      <FilterModal
        visible={showFilters}
        filter={filter}
        onFilterChange={setFilter}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  headerSubtitleText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginRight: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  viewModeTextActive: {
    color: Colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  mapContainer: {
    flex: 1,
  },


  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  technicianCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardMainInfo: {
    gap: 2,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  etaText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  lastUpdateText: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginLeft: 'auto' as any,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  filterModal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: height * 0.8,
    width: width - 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  analyticsContainer: {
    flex: 1,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    marginBottom: 24,
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  analyticsSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  performanceSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },


});