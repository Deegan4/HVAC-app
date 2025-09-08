import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  MapPin,
  Navigation,
  CheckCircle,
  Pause,
  ArrowRight,
  Circle,
  Route,
  Zap,
  Clock,
  AlertTriangle,
  Car,
  Wrench,
  Coffee,
  Home,
  Users,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Technician, TechnicianStatus } from '@/types';

const { width, height } = Dimensions.get('window');

interface EnhancedMapViewProps {
  technicians: Technician[];
  selectedTechnician: string | null;
  onTechnicianSelect: (techId: string) => void;
  showRoutes?: boolean;
  showGeofences?: boolean;
}

interface RouteData {
  technicianId: string;
  path: { latitude: number; longitude: number }[];
  estimatedTime: number;
  distance: number;
}

interface GeofenceZone {
  id: string;
  name: string;
  center: { latitude: number; longitude: number };
  radius: number;
  type: 'job-site' | 'office' | 'restricted';
}

export default function EnhancedMapView({
  technicians,
  selectedTechnician,
  onTechnicianSelect,
  showRoutes = false,
  showGeofences = false,
}: EnhancedMapViewProps) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [geofences] = useState<GeofenceZone[]>([
    {
      id: 'office',
      name: 'Main Office',
      center: { latitude: 32.7157, longitude: -117.1611 },
      radius: 100,
      type: 'office',
    },
    {
      id: 'job1',
      name: 'Job Site Alpha',
      center: { latitude: 32.7200, longitude: -117.1650 },
      radius: 50,
      type: 'job-site',
    },
    {
      id: 'restricted1',
      name: 'Restricted Area',
      center: { latitude: 32.7100, longitude: -117.1500 },
      radius: 75,
      type: 'restricted',
    },
  ]);

  const activeTechnicians = useMemo(() => 
    technicians.filter(tech => 
      tech.location && tech.availability !== 'offline'
    ), [technicians]
  );

  // Simulate route calculation
  useEffect(() => {
    if (showRoutes) {
      const mockRoutes: RouteData[] = activeTechnicians
        .filter(tech => tech.status?.status === 'on-route')
        .map(tech => ({
          technicianId: tech.id,
          path: [
            tech.location!,
            {
              latitude: tech.location!.latitude + (Math.random() - 0.5) * 0.005,
              longitude: tech.location!.longitude + (Math.random() - 0.5) * 0.005,
            },
            {
              latitude: tech.location!.latitude + (Math.random() - 0.5) * 0.01,
              longitude: tech.location!.longitude + (Math.random() - 0.5) * 0.01,
            },
          ],
          estimatedTime: Math.floor(Math.random() * 30) + 10,
          distance: Math.floor(Math.random() * 5) + 2,
        }));
      setRoutes(mockRoutes);
    }
  }, [activeTechnicians, showRoutes]);

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

  const getGeofenceColor = (type: GeofenceZone['type']): string => {
    switch (type) {
      case 'office': return Colors.primary;
      case 'job-site': return Colors.success;
      case 'restricted': return Colors.error;
      default: return Colors.text.secondary;
    }
  };

  const handleRouteOptimization = () => {
    Alert.alert(
      'Route Optimization',
      'Calculating optimal routes for all active technicians...',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Optimize', 
          onPress: () => {
            console.log('Optimizing routes for technicians');
            Alert.alert('Success', 'Routes optimized! Estimated time savings: 15 minutes per technician.');
          }
        }
      ]
    );
  };

  const checkGeofenceViolations = () => {
    const violations = activeTechnicians.filter(tech => {
      // Simulate geofence violation check
      return Math.random() > 0.8;
    });

    if (violations.length > 0) {
      Alert.alert(
        'Geofence Alert',
        `${violations.length} technician(s) may have geofence violations`,
        [{ text: 'OK' }]
      );
    }
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
    activeTechnicians.forEach((tech, index) => {
      const x = Math.floor(Math.random() * 8);
      const y = Math.floor(Math.random() * 8);
      positions.set(`${y}-${x}`, tech);
    });
    return positions;
  }, [activeTechnicians]);

  return (
    <View style={styles.container}>
      {/* Map Container with Controls */}
      <View style={styles.mapContainer}>
        {/* Map Controls Overlay */}
        <View style={styles.mapControlsOverlay}>
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

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>

        {/* Map Grid */}
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
                    <StatusIcon size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Active Technicians */}
        <View style={styles.techniciansList}>
          <Text style={styles.listTitle}>Active Technicians ({activeTechnicians.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.techScrollView}>
            <View style={styles.techCards}>
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
            </View>
          </ScrollView>
        </View>

        {/* Status Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>On Route</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>At Job</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
              <Text style={styles.legendText}>Break</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Returning</Text>
            </View>
          </View>
        </View>
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
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Map Controls Overlay
  mapControlsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeControl: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  // Live Indicator
  liveIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  
  // Map Grid
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    aspectRatio: 1,
    width: '100%',
    marginTop: 40,
  },
  gridCell: {
    width: '12.5%',
    aspectRatio: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupiedCell: {
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  selectedCell: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  techMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
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
  
  // Bottom Panel
  bottomPanel: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    paddingBottom: 16,
  },
  
  // Technicians List
  techniciansList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  techScrollView: {
    marginHorizontal: -16,
  },
  techCards: {
    flexDirection: 'row',
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
  
  // Legend
  legend: {
    paddingHorizontal: 16,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
});