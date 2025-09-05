import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  CheckCircle,
  Navigation,
  Pause,
  ArrowRight,
  Circle,
  Send,
  Battery,
  Wifi,
  WifiOff,
  Shield,
  Clock,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { TechnicianStatus } from '@/types';

interface LocationServiceProps {
  technicianId: string;
  onStatusUpdate?: (status: TechnicianStatus) => void;
}

export default function TechnicianLocationService({ technicianId, onStatusUpdate }: LocationServiceProps) {
  const { technicians, userRole } = useAppStore();
  const [currentStatus, setCurrentStatus] = useState<TechnicianStatus['status']>('offline');
  const [message, setMessage] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [batteryOptimized, setBatteryOptimized] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [geofenceEnabled, setGeofenceEnabled] = useState<boolean>(true);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  const technician = technicians.find(tech => tech.id === technicianId);

  useEffect(() => {
    if (technician?.status) {
      setCurrentStatus(technician.status.status);
      setMessage(technician.status.message || '');
    }
  }, [technician]);

  // Enhanced location tracking with battery optimization
  useEffect(() => {
    let locationInterval: ReturnType<typeof setInterval>;
    let batteryCheckInterval: ReturnType<typeof setInterval>;

    if (isTracking && Platform.OS !== 'web') {
      // Determine update frequency based on battery optimization and status
      const getUpdateInterval = () => {
        if (batteryOptimized) {
          switch (currentStatus) {
            case 'on-route': return 15000; // 15 seconds when traveling
            case 'at-job': return 60000; // 1 minute when at job
            case 'break': return 300000; // 5 minutes on break
            default: return 30000; // 30 seconds default
          }
        }
        return 10000; // 10 seconds for high-frequency updates
      };

      // Location tracking with geofencing simulation
      locationInterval = setInterval(() => {
        const mockLocation = {
          latitude: 32.7157 + (Math.random() - 0.5) * 0.01,
          longitude: -117.1611 + (Math.random() - 0.5) * 0.01,
        };
        
        setLocation(mockLocation);
        setLastLocationUpdate(new Date());
        
        // Simulate geofencing alerts
        if (geofenceEnabled && Math.random() > 0.95) {
          console.log('Geofence alert: Technician entered/exited job site area');
        }
        
        console.log('Location updated:', mockLocation, 'Battery optimized:', batteryOptimized);
      }, getUpdateInterval());

      // Battery monitoring simulation
      batteryCheckInterval = setInterval(() => {
        const batteryLevel = Math.random() * 100;
        if (batteryLevel < 20 && !batteryOptimized) {
          Alert.alert(
            'Low Battery',
            'Battery is low. Enable battery optimization for location tracking?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', onPress: () => setBatteryOptimized(true) }
            ]
          );
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
      if (batteryCheckInterval) clearInterval(batteryCheckInterval);
    };
  }, [isTracking, batteryOptimized, currentStatus, geofenceEnabled]);

  // Network status simulation
  useEffect(() => {
    const networkInterval = setInterval(() => {
      // Simulate network connectivity changes
      if (Math.random() > 0.95) {
        setIsOnline(prev => {
          const newStatus = !prev;
          if (newStatus) {
            console.log('Network reconnected - syncing offline data');
          } else {
            console.log('Network disconnected - storing data offline');
          }
          return newStatus;
        });
      }
    }, 30000);

    return () => clearInterval(networkInterval);
  }, []);

  const handleStatusChange = (newStatus: TechnicianStatus['status']) => {
    setCurrentStatus(newStatus);
    
    const statusUpdate: TechnicianStatus = {
      status: newStatus,
      message: message || getDefaultMessage(newStatus),
    };

    if (newStatus === 'on-route' && location) {
      // Calculate estimated arrival (mock calculation)
      const estimatedMinutes = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
      statusUpdate.estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000).toISOString();
    }

    onStatusUpdate?.(statusUpdate);
    
    // Start/stop location tracking based on status
    if (newStatus === 'offline') {
      setIsTracking(false);
    } else {
      setIsTracking(true);
    }
  };

  const getDefaultMessage = (status: TechnicianStatus['status']): string => {
    switch (status) {
      case 'on-route': return 'En route to job site';
      case 'at-job': return 'Working on site';
      case 'break': return 'Taking a break';
      case 'returning': return 'Returning to office';
      case 'offline': return 'Off duty';
      default: return '';
    }
  };

  const getStatusIcon = (status: TechnicianStatus['status']) => {
    switch (status) {
      case 'on-route': return Navigation;
      case 'at-job': return CheckCircle;
      case 'break': return Pause;
      case 'returning': return ArrowRight;
      case 'offline': return Circle;
      default: return Circle;
    }
  };

  const getStatusColor = (status: TechnicianStatus['status']): string => {
    switch (status) {
      case 'on-route': return Colors.warning;
      case 'at-job': return Colors.success;
      case 'break': return Colors.info;
      case 'returning': return Colors.primary;
      case 'offline': return Colors.text.secondary;
      default: return Colors.text.secondary;
    }
  };

  const handleSendUpdate = () => {
    const statusUpdate: TechnicianStatus = {
      status: currentStatus,
      message: message || getDefaultMessage(currentStatus),
    };

    if (currentStatus === 'on-route' && location) {
      const estimatedMinutes = Math.floor(Math.random() * 30) + 10;
      statusUpdate.estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000).toISOString();
    }

    onStatusUpdate?.(statusUpdate);
    
    Alert.alert(
      'Status Updated',
      `Your status has been updated to "${currentStatus.replace('-', ' ')}"`,
      [{ text: 'OK' }]
    );
  };

  if (userRole !== 'technician') {
    return null; // Only show for technicians
  }

  const statusOptions: { status: TechnicianStatus['status']; label: string }[] = [
    { status: 'on-route', label: 'On Route' },
    { status: 'at-job', label: 'At Job Site' },
    { status: 'break', label: 'On Break' },
    { status: 'returning', label: 'Returning' },
    { status: 'offline', label: 'Off Duty' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MapPin size={24} color={Colors.primary} />
        <Text style={styles.title}>Location & Status</Text>
      </View>

      <View style={styles.currentStatus}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.statusDisplay}>
          {(() => {
            const StatusIcon = getStatusIcon(currentStatus);
            return <StatusIcon size={20} color={getStatusColor(currentStatus)} />;
          })()}
          <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
            {currentStatus.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
        {isTracking && (
          <View style={styles.trackingIndicator}>
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>Location tracking active</Text>
          </View>
        )}
      </View>

      <View style={styles.statusOptions}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        {statusOptions.map(({ status, label }) => {
          const StatusIcon = getStatusIcon(status);
          const isSelected = currentStatus === status;
          
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusOption,
                isSelected && styles.selectedOption,
                { borderColor: getStatusColor(status) }
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <StatusIcon 
                size={20} 
                color={isSelected ? Colors.white : getStatusColor(status)} 
              />
              <Text style={[
                styles.statusOptionText,
                isSelected && styles.selectedOptionText
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Status Message</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Add a status message..."
          placeholderTextColor={Colors.text.secondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Tracking Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Battery size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Battery Optimization</Text>
          </View>
          <Switch
            value={batteryOptimized}
            onValueChange={setBatteryOptimized}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Shield size={20} color={Colors.success} />
            <Text style={styles.settingLabel}>Geofencing Alerts</Text>
          </View>
          <Switch
            value={geofenceEnabled}
            onValueChange={setGeofenceEnabled}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor={Colors.white}
          />
        </View>
        
        <View style={styles.statusRow}>
          {isOnline ? (
            <Wifi size={16} color={Colors.success} />
          ) : (
            <WifiOff size={16} color={Colors.error} />
          )}
          <Text style={[styles.networkStatusText, { color: isOnline ? Colors.success : Colors.error }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.updateButton, !isOnline && styles.updateButtonOffline]} 
        onPress={handleSendUpdate}
        disabled={!isOnline && !isTracking}
      >
        <Send size={20} color={Colors.white} />
        <Text style={styles.updateButtonText}>
          {isOnline ? 'Send Update' : 'Queue Update'}
        </Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <View style={styles.locationFooter}>
            <Clock size={12} color={Colors.text.secondary} />
            <Text style={styles.locationSubtext}>
              Last updated: {lastLocationUpdate?.toLocaleTimeString() || 'Never'}
            </Text>
          </View>
          <Text style={styles.accuracyText}>
            Accuracy: ±{Math.floor(Math.random() * 10) + 3}m
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  currentStatus: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  trackingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statusOptions: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  selectedOptionText: {
    color: Colors.white,
  },
  messageSection: {
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top' as const,
    minHeight: 80,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  locationInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontFamily: 'monospace' as const,
    marginBottom: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  accuracyText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontStyle: 'italic' as const,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  networkStatusText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  updateButtonOffline: {
    backgroundColor: Colors.text.secondary,
  },
});