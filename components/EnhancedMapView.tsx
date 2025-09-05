import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
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

  // In a real implementation, this would be replaced with react-native-maps
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color={Colors.text.secondary} />
        <Text style={styles.mapTitle}>Enhanced Map View</Text>
        <Text style={styles.mapSubtitle}>
          {activeTechnicians.length} technicians • {routes.length} active routes
        </Text>

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

        {/* Technician Markers */}
        <View style={styles.markersContainer}>
          <Text style={styles.markersTitle}>Active Technicians</Text>
          <View style={styles.markersList}>
            {activeTechnicians.slice(0, 6).map((tech) => (
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
          </View>
        </View>

        {/* Route Information */}
        {showRoutes && routes.length > 0 && (
          <View style={styles.routeInfo}>
            <Text style={styles.routeTitle}>Active Routes</Text>
            {routes.slice(0, 3).map((route) => {
              const tech = technicians.find(t => t.id === route.technicianId);
              return (
                <View key={route.technicianId} style={styles.routeItem}>
                  <Navigation size={14} color={Colors.warning} />
                  <Text style={styles.routeText}>
                    {tech?.name}: {route.distance}km • {route.estimatedTime}min
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Geofence Information */}
        {showGeofences && (
          <View style={styles.geofenceInfo}>
            <Text style={styles.geofenceTitle}>Geofence Zones</Text>
            {geofences.map((zone) => (
              <View key={zone.id} style={styles.geofenceItem}>
                <View 
                  style={[
                    styles.geofenceIndicator, 
                    { backgroundColor: getGeofenceColor(zone.type) }
                  ]} 
                />
                <Text style={styles.geofenceText}>
                  {zone.name} ({zone.radius}m)
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Real-time Updates Indicator */}
        <View style={styles.updateIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.updateText}>Live tracking active</Text>
        </View>
      </View>

      {/* Map Legend */}
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  mapSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 20,
  },
  mapControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  activeControlText: {
    color: Colors.white,
  },
  markersContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  markersTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  markersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  technicianMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  selectedMarker: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  routeInfo: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 280,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  geofenceInfo: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 280,
  },
  geofenceTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  geofenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  geofenceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  geofenceText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  updateIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  updateText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  legend: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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