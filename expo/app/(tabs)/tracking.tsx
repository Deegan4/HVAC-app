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
  Plus,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/app-store';
import { useTheme } from '@/hooks/theme-store';
import { Technician, TechnicianStatus, TrackingFilter } from '@/types';
import EnhancedMapView from '@/components/EnhancedMapView';
import { useTranslation } from '@/constants/translations';

const { width, height } = Dimensions.get('window');



function getStatusColorFromTheme(status: TechnicianStatus['status'] | 'offline', colors: any): string {
  switch (status) {
    case 'on-route': return colors.warning;
    case 'at-job': return colors.success;
    case 'break': return colors.info;
    case 'returning': return colors.primary;
    case 'offline': return colors.text.secondary;
    default: return colors.text.secondary;
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
  const { colors } = useTheme();
  const StatusIcon = getStatusIcon(technician.status?.status || 'offline');
  const statusColor = getStatusColorFromTheme(technician.status?.status || 'offline', colors);
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
          { backgroundColor: colors.white, borderColor: colors.border },
          isSelected && { borderWidth: 2, borderColor: colors.primary }
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
              <Text style={[styles.technicianName, { color: colors.text.primary }]}>{technician.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
            
            {technician.location?.address && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.text.secondary} />
                <Text style={[styles.locationText, { color: colors.text.secondary }]} numberOfLines={1}>
                  {technician.location.address}
                </Text>
              </View>
            )}
            
            {technician.status?.estimatedArrival && (
              <View style={styles.etaRow}>
                <Clock size={12} color={colors.primary} />
                <Text style={[styles.etaText, { color: colors.primary }]}>
                  ETA {new Date(technician.status.estimatedArrival).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]} onPress={() => {
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
              <MessageCircle size={18} color={colors.primary} />
            </TouchableOpacity>
            <ChevronRight size={20} color={colors.text.secondary} />
          </View>
        </View>
        
        <View style={[styles.cardMeta, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Battery size={12} color={colors.text.secondary} />
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>85%</Text>
          </View>
          <View style={styles.metaItem}>
            <Signal size={12} color={colors.text.secondary} />
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>Strong</Text>
          </View>
          <Text style={[styles.lastUpdateText, { color: colors.text.secondary }]}>
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
  const { colors } = useTheme();
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
      <View style={[styles.filterModal, { backgroundColor: colors.surface }]}>
        <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Filter Technicians</Text>
        
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text.primary }]}>Status</Text>
          {statusOptions.map(status => (
            <TouchableOpacity
              key={status}
              style={styles.filterOption}
              onPress={() => toggleStatus(status)}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.border },
                (filter.status || []).includes(status) && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} />
              <Text style={[styles.filterOptionText, { color: colors.text.primary }]}>
                {status.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text.primary }]}>Availability</Text>
          {availabilityOptions.map(availability => (
            <TouchableOpacity
              key={availability}
              style={styles.filterOption}
              onPress={() => toggleAvailability(availability)}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.border },
                (filter.availability || []).includes(availability) && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]} />
              <Text style={[styles.filterOptionText, { color: colors.text.primary }]}>
                {availability.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.clearButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onFilterChange({})}
          >
            <Text style={[styles.clearButtonText, { color: colors.text.primary }]}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply</Text>
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
  const { colors } = useTheme();
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
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <Activity size={24} color={colors.primary} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>Active Technicians</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.active}/{analytics.total}</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Currently working</Text>
        </View>
        
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <Route size={24} color={colors.warning} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>On Route</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.onRoute}</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Traveling to jobs</Text>
        </View>
        
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <CheckCircle size={24} color={colors.success} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>At Job Sites</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.atJob}</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Currently working</Text>
        </View>
        
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <Timer size={24} color={colors.info} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>Avg Response</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.avgResponseTime}m</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Response time</Text>
        </View>
        
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <TrendingUp size={24} color={colors.success} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>Efficiency</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.efficiency}%</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Overall performance</Text>
        </View>
        
        <View style={[styles.analyticsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={styles.analyticsHeader}>
            <BarChart3 size={24} color={colors.primary} />
            <Text style={[styles.analyticsTitle, { color: colors.text.primary }]}>Completion Rate</Text>
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text.primary }]}>{analytics.completionRate}%</Text>
          <Text style={[styles.analyticsSubtext, { color: colors.text.secondary }]}>Jobs completed today</Text>
        </View>
      </View>
      
      <View style={styles.performanceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Performance Insights</Text>
        
        <View style={[styles.insightCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Route Optimization</Text>
          <Text style={[styles.insightText, { color: colors.text.secondary }]}>
            Technicians could save an average of 12 minutes per job with optimized routing.
          </Text>
        </View>
        
        <View style={[styles.insightCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Peak Hours</Text>
          <Text style={[styles.insightText, { color: colors.text.secondary }]}>
            Highest activity between 10 AM - 2 PM. Consider scheduling more technicians during these hours.
          </Text>
        </View>
        
        <View style={[styles.insightCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <Text style={[styles.insightTitle, { color: colors.text.primary }]}>Battery Optimization</Text>
          <Text style={[styles.insightText, { color: colors.text.secondary }]}>
            Location tracking is optimized for battery life with 30-second intervals during active jobs.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function TrackingScreen() {
  const { technicians, userRole, language } = useAppStore();
  const { colors } = useTheme();
  const t = useTranslation(language);
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











  if (userRole !== 'owner') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDenied}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={[styles.accessDeniedText, { color: colors.text.primary }]}>{t.accessDenied}</Text>
          <Text style={[styles.accessDeniedSubtext, { color: colors.text.secondary }]}>
            {t.trackingOwnerOnly}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t.teamTracking}</Text>
            {technicians.length > 0 && (
              <View style={styles.headerStats}>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statText, { color: colors.text.secondary }]}>
                    {technicians.filter(t => t.availability !== 'offline').length} {t.active}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.statText, { color: colors.text.secondary }]}>
                    {technicians.filter(t => t.status?.status === 'on-route').length} {t.enRoute}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {technicians.length > 0 && (
            <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.primary + '10' }]} onPress={onRefresh}>
              <RefreshCw size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {technicians.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight, shadowColor: colors.primary }]}>
            <Users size={64} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{t.noTechniciansYet}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
            {t.noTechniciansDescription}
          </Text>
          
          <TouchableOpacity
            style={[styles.addTechnicianButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => router.push('/team-management')}
          >
            <View style={styles.addTechnicianIcon}>
              <Plus size={24} color={colors.white} />
            </View>
            <View style={styles.addTechnicianContent}>
              <Text style={[styles.addTechnicianTitle, { color: colors.white }]}>{t.addFirstTechnician}</Text>
              <Text style={styles.addTechnicianDescription}>
                {t.setupTeamTracking}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={[styles.trackingFeatures, { backgroundColor: colors.primaryLight, borderLeftColor: colors.primary }]}>
            <Text style={[styles.featuresTitle, { color: colors.text.primary }]}>{t.whatYouCanTrack}</Text>
            <View style={styles.featureItem}>
              <MapPin size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text.inverse }]}>{t.realTimeLocation}</Text>
            </View>
            <View style={styles.featureItem}>
              <Route size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text.inverse }]}>{t.jobProgressStatus}</Text>
            </View>
            <View style={styles.featureItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text.inverse }]}>{t.estimatedArrival}</Text>
            </View>
            <View style={styles.featureItem}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text.inverse }]}>{t.performanceAnalytics}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Controls */}
          <View style={[styles.controlsSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={[styles.viewModeContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'list' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('list')}
              >
                <List size={16} color={viewMode === 'list' ? colors.white : colors.text.secondary} />
                <Text style={[styles.viewButtonText, { color: colors.text.secondary }, viewMode === 'list' && { color: colors.white }]}>{t.list}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'map' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('map')}
              >
                <Map size={16} color={viewMode === 'map' ? colors.white : colors.text.secondary} />
                <Text style={[styles.viewButtonText, { color: colors.text.secondary }, viewMode === 'map' && { color: colors.white }]}>{t.map}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'analytics' && { backgroundColor: colors.primary }]}
                onPress={() => setViewMode('analytics')}
              >
                <BarChart3 size={16} color={viewMode === 'analytics' ? colors.white : colors.text.secondary} />
                <Text style={[styles.viewButtonText, { color: colors.text.secondary }, viewMode === 'analytics' && { color: colors.white }]}>{t.stats}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchFilterRow}>
              <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <Search size={16} color={colors.text.secondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text.primary }]}
                  placeholder={t.searchTechnicians}
                  placeholderTextColor={colors.text.secondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.background },
                  (filter.status?.length || filter.availability?.length) && { backgroundColor: colors.primary }
                ]}
                onPress={() => setShowFilters(true)}
              >
                <Filter size={16} color={
                  (filter.status?.length || filter.availability?.length) ? colors.white : colors.text.secondary
                } />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Area */}
          <View style={styles.contentArea}>
            {viewMode === 'map' ? (
              <EnhancedMapView
                technicians={filteredTechnicians}
                selectedTechnician={selectedTechnician}
                onTechnicianSelect={setSelectedTechnician}
                showRoutes={true}
                showGeofences={false}
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
                      router.push({
                        pathname: '/technician-location',
                        params: { technicianId: item.id }
                      });
                    }}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Users size={48} color={colors.text.secondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{t.noTechniciansFound}</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                      {searchQuery ? t.tryAdjustingFilters : t.noTechniciansDescription}
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          <FilterModal
            visible={showFilters}
            filter={filter}
            onFilterChange={setFilter}
            onClose={() => setShowFilters(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Controls Section
  controlsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  
  // View Mode Container
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  
  // Search and Filter Row
  searchFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Search Container
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  
  // Filter Button
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content Area
  contentArea: {
    flex: 1,
  },


  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 8,
  },
  technicianCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  lastUpdateText: {
    fontSize: 11,
    marginLeft: 'auto' as any,
  },

  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    marginBottom: 12,
    lineHeight: 34,
  },
  emptySubtitle: {
    fontSize: 17,
    textAlign: 'center' as const,
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  addTechnicianButton: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addTechnicianIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addTechnicianContent: {
    flex: 1,
    justifyContent: 'center',
  },
  addTechnicianTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  addTechnicianDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  trackingFeatures: {
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
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
    marginTop: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
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
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: height * 0.8,
    width: width - 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
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
  },
  filterOptionText: {
    fontSize: 14,
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
    borderWidth: 1,
  },
  applyButton: {},
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    borderWidth: 1,
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
    flex: 1,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  analyticsSubtext: {
    fontSize: 12,
  },
  performanceSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
});