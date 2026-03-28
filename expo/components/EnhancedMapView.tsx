import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  MapPin,
  Circle,
  Route,
  Zap,
  Car,
  Wrench,
  Coffee,
  Home,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Technician, TechnicianStatus } from '@/types';



interface EnhancedMapViewProps {
  technicians: Technician[];
  selectedTechnician: string | null;
  onTechnicianSelect: (techId: string) => void;
  showRoutes?: boolean;
  showGeofences?: boolean;
}





export default function EnhancedMapView({
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  showRoutes = false,
  showGeofences = false,
}: EnhancedMapViewProps) {
  const activeTechnicians = useMemo(() => 
    technicians.filter(tech => 
      tech.location && tech.availability !== 'offline'
    ), [technicians]
  );

  const getStatusColor = (status: TechnicianStatus['status'] | 'offline'): string => {
    switch (status) {
      case 'on-route': return Colors.warning;
      case 'at-job': return Colors.success;
      case 'break': return Colors.info;
      case 'returning': return Colors.primary;
      case 'offline': return Colors.text.secondary;
      default: return Colors.text.secondary;
    }
  };



  const handleRouteOptimization = () => {
    console.log('Route optimization requested');
  };

  const checkGeofenceViolations = () => {
    console.log('Geofence check requested');
  };

  const getStatusIcon = (status: TechnicianStatus['status'] | 'offline') => {
    switch (status) {
      case 'on-route': return Car;
      case 'at-job': return Wrench;
      case 'break': return Coffee;
      case 'returning': return Home;
      case 'offline': return Circle;
      default: return Circle;
    }
  };

  const getStatusLabel = (status: TechnicianStatus['status'] | 'offline'): string => {
    switch (status) {
      case 'on-route': return 'Driving';
      case 'at-job': return 'Working';
      case 'break': return 'On Break';
      case 'returning': return 'Returning';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const selectedTech = technicians.find(t => t.id === selectedTechnician);

  // Create a grid-based map visualization
  const mapGrid = useMemo(() => {
    const grid = [];
    const gridSize = 8;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        grid.push({ x: j, y: i, id: `${i}-${j}` });
      }
    }
    return grid;
  }, []);

  // Position technicians on the grid
  const technicianPositions = useMemo(() => {
    const positions = new Map();
    activeTechnicians.forEach((tech) => {
      const x = Math.floor(Math.random() * 8);
      const y = Math.floor(Math.random() * 8);
      positions.set(`${y}-${x}`, tech);
    });
    return positions;
  }, [activeTechnicians]);

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        {/* Map Header */}
        <View style={styles.mapHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Tracking</Text>
          </View>
          
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.controlButton, showRoutes && styles.activeControl]}
              onPress={handleRouteOptimization}
            >
              <Route size={16} color={showRoutes ? Colors.white : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, showGeofences && styles.activeControl]}
              onPress={checkGeofenceViolations}
            >
              <Zap size={16} color={showGeofences ? Colors.white : Colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Simplified Map Grid */}
        <View style={styles.mapArea}>
          <View style={styles.mapGrid}>
            {mapGrid.map((cell) => {
              const tech = technicianPositions.get(cell.id);
              const StatusIcon = tech ? getStatusIcon(tech.status?.status || 'offline') : null;
              const isSelected = tech && selectedTechnician === tech.id;
              
              return (
                <TouchableOpacity
                  key={cell.id}
                  style={[
                    styles.gridCell,
                    tech && styles.occupiedCell,
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => tech && onTechnicianSelect(tech.id)}
                  disabled={!tech}
                >
                  {tech && StatusIcon && (
                    <View style={[
                      styles.techMarker,
                      { backgroundColor: getStatusColor(tech.status?.status || 'offline') },
                      isSelected && styles.selectedMarker
                    ]}>
                      <StatusIcon size={12} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Technician Info */}
        {selectedTech && (
          <View style={styles.selectedInfo}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedTechInfo}>
                <Text style={styles.selectedName}>{selectedTech.name}</Text>
                <Text style={styles.selectedStatus}>
                  {getStatusLabel(selectedTech.status?.status || 'offline')}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => onTechnicianSelect('')}
              >
                <X size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {selectedTech.location?.address && (
              <View style={styles.selectedLocation}>
                <MapPin size={12} color={Colors.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {selectedTech.location.address}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Technician Overview */}
      <View style={styles.overviewPanel}>
        <Text style={styles.overviewTitle}>Team Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.technicianCards}>
          {activeTechnicians.map((tech) => {
            const StatusIcon = getStatusIcon(tech.status?.status || 'offline');
            const isSelected = selectedTechnician === tech.id;
            return (
              <TouchableOpacity
                key={tech.id}
                style={[
                  styles.techCard,
                  isSelected && styles.selectedTechCard,
                ]}
                onPress={() => onTechnicianSelect(tech.id)}
              >
                <View style={[
                  styles.techCardIcon,
                  { backgroundColor: getStatusColor(tech.status?.status || 'offline') + '20' }
                ]}>
                  <StatusIcon size={16} color={getStatusColor(tech.status?.status || 'offline')} />
                </View>
                <Text style={styles.techCardName} numberOfLines={1}>
                  {tech.name.split(' ')[0]}
                </Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(tech.status?.status || 'offline') }
                ]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Map Container
  mapContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Map Header
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  
  // Live Indicator
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  
  // Map Controls
  mapControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeControl: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  // Map Area
  mapArea: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Map Grid
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    height: 280,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 8,
  },
  gridCell: {
    width: '12.5%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupiedCell: {
    backgroundColor: Colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCell: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  techMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  
  // Selected Info
  selectedInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectedTechInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  selectedStatus: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  
  // Overview Panel
  overviewPanel: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  technicianCards: {
    paddingHorizontal: 16,
    gap: 12,
  },
  techCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 70,
    position: 'relative',
  },
  selectedTechCard: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  techCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  techCardName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  

});