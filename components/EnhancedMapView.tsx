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
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Enhanced Map View</Text>
        <Text style={styles.mapSubtitle}>
          {activeTechnicians.length} technicians • {routes.length} active routes
        </Text>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.controlButton, showRoutes && styles.activeControl]}
          onPress={handleRouteOptimization}
        >
          <Route size={16} color={showRoutes ? Colors.white : Colors.primary} />
          <Text style={[styles.controlText, showRoutes && styles.activeControlText]}>
            Routes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, showGeofences && styles.activeControl]}
          onPress={checkGeofenceViolations}
        >
          <Zap size={16} color={showGeofences ? Colors.white : Colors.warning} />
          <Text style={[styles.controlText, showGeofences && styles.activeControlText]}>
            Geofences
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Visualization */}
      <View style={styles.mapContainer}>
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
                    { backgroundColor: getStatusColor(tech.status?.status || 'offline') }
                  ]}>
                    <StatusIcon size={16} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Overlay Information */}
        {selectedTech && (
          <View style={styles.selectedInfo}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedName}>{selectedTech.name}</Text>
              <TouchableOpacity onPress={() => onTechnicianSelect('')}>
                <Circle size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedStatus}>
              Status: {selectedTech.status?.status || 'offline'}
            </Text>
            {selectedTech.location?.address && (
              <Text style={styles.selectedLocation}>
                <MapPin size={12} color={Colors.text.secondary} /> {selectedTech.location.address}
              </Text>
            )}
          </View>
        )}

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live tracking active</Text>
        </View>
      </View>

      {/* Active Technicians List */}
      <View style={styles.techniciansList}>
        <Text style={styles.listTitle}>Active Technicians</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.techCards}>
            {activeTechnicians.map((tech) => {
              const StatusIcon = getStatusIcon(tech.status?.status || 'offline');
              return (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.techCard,
                    selectedTechnician === tech.id && styles.selectedTechCard,
                  ]}
                  onPress={() => onTechnicianSelect(tech.id)}
                >
                  <View style={[
                    styles.techCardIcon,
                    { backgroundColor: getStatusColor(tech.status?.status || 'offline') + '20' }
                  ]}>
                    <StatusIcon size={20} color={getStatusColor(tech.status?.status || 'offline')} />
                  </View>
                  <Text style={styles.techCardName} numberOfLines={1}>
                    {tech.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.techCardStatus}>
                    {tech.status?.status || 'offline'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Active Routes */}
      {showRoutes && routes.length > 0 && (
        <View style={styles.routesSection}>
          <Text style={styles.routesTitle}>Active Routes</Text>
          <View style={styles.routesList}>
            {routes.slice(0, 2).map((route) => {
              const tech = technicians.find(t => t.id === route.technicianId);
              return (
                <View key={route.technicianId} style={styles.routeCard}>
                  <Navigation size={16} color={Colors.warning} />
                  <View style={styles.routeDetails}>
                    <Text style={styles.routeName}>{tech?.name}</Text>
                    <Text style={styles.routeInfo}>
                      {route.distance}km • {route.estimatedTime}min
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Status Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status Legend</Text>
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
            <Text style={styles.legendText}>On Break</Text>
          </View>
          {showGeofences && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
              <Text style={styles.legendText}>Restricted Area (75m)</Text>
            </View>
          )}
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
  mapHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  mapSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  mapControls: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeControl: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  controlText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  activeControlText: {
    color: Colors.white,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    aspectRatio: 1,
    width: '100%',
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
    borderRadius: 4,
  },
  selectedCell: {
    backgroundColor: Colors.primary + '10',
  },
  techMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  selectedStatus: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  selectedLocation: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  techniciansList: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  techCards: {
    flexDirection: 'row',
    paddingRight: 16,
    gap: 12,
  },
  techCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
  },
  selectedTechCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  techCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  techCardName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  techCardStatus: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  routesSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  routesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  routesList: {
    gap: 8,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  routeDetails: {
    flex: 1,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  routeInfo: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  legend: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});