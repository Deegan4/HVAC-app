import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
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
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Technician, TechnicianStatus, TrackingFilter } from '@/types';

const { width, height } = Dimensions.get('window');

interface MapViewProps {
  technicians: Technician[];
  selectedTechnician: string | null;
  onTechnicianSelect: (techId: string) => void;
}

function MapView({ technicians, selectedTechnician, onTechnicianSelect }: MapViewProps) {
  const activeTechnicians = technicians.filter(tech => 
    tech.location && tech.availability !== 'offline'
  );

  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color={Colors.text.secondary} />
        <Text style={styles.mapPlaceholderText}>Interactive Map View</Text>
        <Text style={styles.mapSubtext}>
          {activeTechnicians.length} technicians active
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.technicianMarkers}
          contentContainerStyle={styles.markersContent}
        >
          {activeTechnicians.map((tech) => (
            <TouchableOpacity
              key={tech.id}
              style={[
                styles.technicianMarker,
                selectedTechnician === tech.id && styles.selectedMarker,
                { backgroundColor: getStatusColor(tech.status?.status || 'offline') }
              ]}
              onPress={() => onTechnicianSelect(tech.id)}
            >
              <Text style={styles.markerText}>
                {tech.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
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

export default function TrackingScreen() {
  const { technicians, userRole } = useAppStore();
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filter, setFilter] = useState<TrackingFilter>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch updates from a server
      console.log('Checking for location updates...');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
        <Text style={styles.title}>Technician Tracking</Text>
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

      {viewMode === 'map' ? (
        <MapView
          technicians={filteredTechnicians}
          selectedTechnician={selectedTechnician}
          onTechnicianSelect={setSelectedTechnician}
        />
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
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
          {filteredTechnicians.length === 0 && (
            <View style={styles.emptyState}>
              <MapPin size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyStateText}>No technicians found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
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
});