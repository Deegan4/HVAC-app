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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Search,
  Filter,
  Clock,
  Phone,
  Navigation,
  AlertCircle,
  CheckCircle,
  Circle,
  Pause,
  ArrowRight,
  BarChart3,
  Route,
  TrendingUp,
  Activity,
  Timer,
  RefreshCw,
  WifiOff,
  CloudOff,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [offlineData, setOfflineData] = useState<Technician[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const filteredTechnicians = useMemo(() => {
    const dataSource = isOffline && offlineData.length > 0 ? offlineData : technicians;
    return dataSource.filter(tech => {
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
  }, [technicians, offlineData, isOffline, searchQuery, filter]);

  // Enhanced real-time updates with offline support and error handling
  useEffect(() => {
    let locationInterval: ReturnType<typeof setInterval>;
    let networkCheckInterval: ReturnType<typeof setInterval>;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const updateLocationData = async () => {
      try {
        setError(null);
        
        // Simulate network request
        if (Math.random() > 0.1) { // 90% success rate
          console.log('Location data updated successfully');
          setLastSyncTime(new Date());
          setRetryCount(0);
          
          // Store data for offline use
          setOfflineData([...technicians]);
        } else {
          throw new Error('Network request failed');
        }
      } catch (err) {
        console.error('Failed to update location data:', err);
        setError('Failed to sync location data');
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff retry
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryTimeout = setTimeout(() => {
          if (retryCount < 5) {
            updateLocationData();
          }
        }, retryDelay);
      }
    };

    // Network connectivity simulation
    const checkNetworkStatus = () => {
      const wasOffline = isOffline;
      const nowOffline = Math.random() > 0.95; // 5% chance of going offline
      
      if (wasOffline !== nowOffline) {
        setIsOffline(nowOffline);
        
        if (!nowOffline && wasOffline) {
          // Reconnected - sync offline data
          console.log('Network reconnected - syncing offline data');
          updateLocationData();
        } else if (nowOffline) {
          console.log('Network disconnected - using offline data');
          setError('No network connection');
        }
      }
    };

    if (!isOffline) {
      locationInterval = setInterval(updateLocationData, 30000);
    }
    
    networkCheckInterval = setInterval(checkNetworkStatus, 10000);

    // Initial load
    setIsLoading(true);
    updateLocationData().finally(() => {
      setTimeout(() => setIsLoading(false), 1000); // Simulate loading time
    });

    return () => {
      if (locationInterval) clearInterval(locationInterval);
      if (networkCheckInterval) clearInterval(networkCheckInterval);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [technicians, isOffline, retryCount]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Math.random() > 0.2) { // 80% success rate
        console.log('Data refreshed successfully');
        setLastSyncTime(new Date());
        setRetryCount(0);
      } else {
        throw new Error('Refresh failed');
      }
    } catch (err) {
      console.error('Refresh failed:', err);
      setError('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    onRefresh();
  }, [onRefresh]);





  // Quick stats calculation
  const quickStats = useMemo((): QuickStat[] => {
    const active = technicians.filter(t => t.availability !== 'offline').length;
    const onRoute = technicians.filter(t => t.status?.status === 'on-route').length;
    const atJob = technicians.filter(t => t.status?.status === 'at-job').length;
    const onBreak = technicians.filter(t => t.status?.status === 'break').length;
    
    return [
      { label: 'Active', value: active, icon: Users, color: Colors.success, trend: 12 },
      { label: 'On Route', value: onRoute, icon: Car, color: Colors.warning },
      { label: 'At Job', value: atJob, icon: Wrench, color: Colors.primary },
      { label: 'Break', value: onBreak, icon: Coffee, color: Colors.info },
    ];
  }, [technicians]);

  // Animate on load
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '70%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  // Error state component
  const ErrorState = () => (
    <View style={styles.errorContainer}>
      {isOffline ? (
        <CloudOff size={48} color={Colors.error} />
      ) : (
        <AlertCircle size={48} color={Colors.error} />
      )}
      <Text style={styles.errorTitle}>
        {isOffline ? 'No Internet Connection' : 'Something went wrong'}
      </Text>
      <Text style={styles.errorMessage}>
        {error || (isOffline ? 'Using cached data from last sync' : 'Please try again')}
      </Text>
      {lastSyncTime && (
        <Text style={styles.lastSyncText}>
          Last synced: {lastSyncTime.toLocaleTimeString()}
        </Text>
      )}
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <RefreshCw size={16} color={Colors.white} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (userRole !== 'owner') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            Technician tracking is only available for owners
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTechnicians.length} technicians • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            {isOffline && (
              <View style={styles.offlineBadge}>
                <WifiOff size={14} color={Colors.white} />
              </View>
            )}
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <RefreshCw size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
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
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Icon size={16} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.trend && (
                  <View style={styles.statTrend}>
                    <TrendingUp size={10} color={Colors.success} />
                    <Text style={styles.statTrendText}>+{stat.trend}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
      
      <View style={styles.viewModeContainer}>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={18} color={viewMode === 'list' ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'map' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Map size={18} color={viewMode === 'map' ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.viewModeText, viewMode === 'map' && styles.viewModeTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'analytics' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('analytics')}
          >
            <BarChart3 size={18} color={viewMode === 'analytics' ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.viewModeText, viewMode === 'analytics' && styles.viewModeTextActive]}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.text.secondary} />
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
          <Filter size={18} color={
            (filter.status?.length || filter.availability?.length) ? Colors.white : Colors.primary
          } />
          {(filter.status?.length || filter.availability?.length) ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {(filter.status?.length || 0) + (filter.availability?.length || 0)}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {error && !isRefreshing && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={Colors.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.errorRetryButton}>
            <RefreshCw size={14} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !isRefreshing ? (
        <LoadingSkeleton />
      ) : viewMode === 'map' ? (
        <EnhancedMapView
          technicians={filteredTechnicians}
          selectedTechnician={selectedTechnician}
          onTechnicianSelect={setSelectedTechnician}
          showRoutes={true}
          showGeofences={true}
        />
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
            !isLoading ? (
              error ? <ErrorState /> : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Users size={48} color={Colors.text.secondary} />
                  </View>
                  <Text style={styles.emptyTitle}>No technicians found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'All technicians are currently offline'}
                  </Text>
                  <TouchableOpacity style={styles.emptyButton} onPress={() => {
                    setSearchQuery('');
                    setFilter({});
                  }}>
                    <Text style={styles.emptyButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : null
          }
        />
      )}



      <FilterModal
        visible={showFilters}
        filter={filter}
        onFilterChange={setFilter}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: Colors.white,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  offlineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    maxHeight: 100,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  statTrendText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  viewModeContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  viewModeTextActive: {
    color: Colors.white,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  filterButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
  },


  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  technicianCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
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
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
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
    paddingHorizontal: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  analyticsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2, // Account for padding and gap
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
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: Colors.surface,
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

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  errorRetryButton: {
    padding: 4,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  skeletonTextContainer: {
    flex: 1,
    gap: 6,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '40%',
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
    textAlign: 'center' as const,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  lastSyncText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});