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
  ActivityIndicator,
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
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Technician, TechnicianStatus, TrackingFilter } from '@/types';
import EnhancedMapView from '@/components/EnhancedMapView';

const { width, height } = Dimensions.get('window');



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
    case 'on-route': return Navigation;
    case 'at-job': return CheckCircle;
    case 'break': return Pause;
    case 'returning': return ArrowRight;
    case 'offline': return Circle;
    default: return Circle;
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
  
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return 'No recent update';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.technicianCard,
        isSelected && styles.selectedCard
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.technicianInfo}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View style={styles.technicianDetails}>
            <Text style={styles.technicianName}>{technician.name}</Text>
            <Text style={styles.technicianStatus}>
              {technician.status?.status?.replace('-', ' ') || 'Offline'}
            </Text>
          </View>
        </View>
        <StatusIcon size={20} color={statusColor} />
      </View>
      
      {technician.status?.message && (
        <Text style={styles.statusMessage}>{technician.status.message}</Text>
      )}
      
      {technician.status?.estimatedArrival && (
        <View style={styles.arrivalInfo}>
          <Clock size={14} color={Colors.text.secondary} />
          <Text style={styles.arrivalText}>
            ETA: {new Date(technician.status.estimatedArrival).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
      
      <View style={styles.cardFooter}>
        <Text style={styles.lastUpdate}>
          {formatLastUpdate(technician.lastUpdate)}
        </Text>
        {technician.location?.address && (
          <Text style={styles.location} numberOfLines={1}>
            {technician.location.address}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'analytics'>('map');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [offlineData, setOfflineData] = useState<Technician[]>([]);

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

  const handleEmergencyContact = (technician: Technician) => {
    Alert.alert(
      'Contact Technician',
      `Call ${technician.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Calling ${technician.phone}`) }
      ]
    );
  };



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
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Technician Tracking</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <WifiOff size={16} color={Colors.error} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
          {isLoading && (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'map' && styles.activeToggle]}
            onPress={() => setViewMode('map')}
          >
            <MapPin size={20} color={viewMode === 'map' ? Colors.white : Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'analytics' && styles.activeToggle]}
            onPress={() => setViewMode('analytics')}
          >
            <BarChart3 size={20} color={viewMode === 'analytics' ? Colors.white : Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search technicians..."
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={Colors.primary} />
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
        <ScrollView 
          style={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              title="Pull to refresh"
              titleColor={Colors.text.secondary}
            />
          }
        >
          {filteredTechnicians.map((technician) => (
            <TechnicianCard
              key={technician.id}
              technician={technician}
              isSelected={selectedTechnician === technician.id}
              onPress={() => {
                setSelectedTechnician(
                  selectedTechnician === technician.id ? null : technician.id
                );
              }}
            />
          ))}
          {filteredTechnicians.length === 0 && !isLoading && (
            error ? <ErrorState /> : (
              <View style={styles.emptyState}>
                <MapPin size={48} color={Colors.text.secondary} />
                <Text style={styles.emptyStateText}>No technicians found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )
          )}
        </ScrollView>
      )}

      {selectedTechnician && (
        <View style={styles.selectedTechnicianPanel}>
          {(() => {
            const tech = technicians.find(t => t.id === selectedTechnician);
            if (!tech) return null;
            
            return (
              <View style={styles.panelContent}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>{tech.name}</Text>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleEmergencyContact(tech)}
                  >
                    <Phone size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.panelStatus}>
                  {tech.status?.status?.replace('-', ' ') || 'Offline'}
                </Text>
                {tech.status?.message && (
                  <Text style={styles.panelMessage}>{tech.status.message}</Text>
                )}
                {tech.location?.address && (
                  <Text style={styles.panelLocation}>{tech.location.address}</Text>
                )}
              </View>
            );
          })()}
        </View>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeToggle: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  activeToggleText: {
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 40,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  technicianMarkers: {
    marginTop: 24,
  },
  markersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  technicianMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  selectedMarker: {
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  markerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  technicianCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  technicianStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    textTransform: 'capitalize' as const,
  },
  statusMessage: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
    fontStyle: 'italic' as const,
  },
  arrivalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  arrivalText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  location: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
    textAlign: 'right' as const,
    marginLeft: 8,
  },
  selectedTechnicianPanel: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 20,
  },
  panelContent: {
    gap: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  callButton: {
    backgroundColor: Colors.success,
    borderRadius: 20,
    padding: 8,
  },
  panelStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    textTransform: 'capitalize' as const,
  },
  panelMessage: {
    fontSize: 14,
    color: Colors.text.primary,
    fontStyle: 'italic' as const,
  },
  panelLocation: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  loadingIndicator: {
    marginLeft: 8,
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