import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';

export default function TeamManagementScreen() {
  const { technicians } = useAppStore();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const handleAddTechnician = () => {
    Alert.alert(
      'Add Technician',
      'This feature would open a form to add a new technician to your team.',
      [{ text: 'OK' }]
    );
  };

  const handleToggleAvailability = (techId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'offline' : 'available';
    Alert.alert(
      'Update Availability',
      `Set ${technicians.find(t => t.id === techId)?.name} as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => console.log(`Updated ${techId} to ${newStatus}`) }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return Colors.status.completed;
      case 'busy': return Colors.status.inProgress;
      case 'offline': return Colors.text.light;
      default: return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'busy': return Clock;
      case 'offline': return XCircle;
      default: return Clock;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Team Management',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddTechnician}
              style={styles.headerButton}
            >
              <UserPlus size={20} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Team Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{technicians.length}</Text>
              <Text style={styles.overviewLabel}>Total Technicians</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                {technicians.filter(t => t.availability === 'available').length}
              </Text>
              <Text style={styles.overviewLabel}>Available</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>
                {technicians.filter(t => t.availability === 'busy').length}
              </Text>
              <Text style={styles.overviewLabel}>Busy</Text>
            </View>
          </View>
        </View>

        {/* Technicians List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technicians</Text>
          <View style={styles.sectionContent}>
            {technicians.map((tech, index) => {
              const StatusIcon = getStatusIcon(tech.availability);
              return (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.techItem,
                    index === technicians.length - 1 && styles.lastItem
                  ]}
                  onPress={() => setSelectedTech(selectedTech === tech.id ? null : tech.id)}
                >
                  <View style={styles.techHeader}>
                    <View style={styles.techInfo}>
                      <View style={styles.techNameRow}>
                        <Text style={styles.techName}>{tech.name}</Text>
                        <View style={styles.statusBadge}>
                          <StatusIcon size={12} color={getStatusColor(tech.availability)} />
                          <Text style={[styles.statusText, { color: getStatusColor(tech.availability) }]}>
                            {tech.availability}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.techSpecialties}>
                        {tech.specialties.join(', ')}
                      </Text>
                    </View>
                    <Switch
                      value={tech.availability === 'available'}
                      onValueChange={() => handleToggleAvailability(tech.id, tech.availability)}
                      trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                      thumbColor={tech.availability === 'available' ? Colors.primary : '#f4f3f4'}
                    />
                  </View>

                  {selectedTech === tech.id && (
                    <View style={styles.techDetails}>
                      <View style={styles.detailRow}>
                        <Mail size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText}>{tech.email}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Phone size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText}>{tech.phone}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Wrench size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText}>
                          Specialties: {tech.specialties.join(', ')}
                        </Text>
                      </View>
                      {tech.currentJobId && (
                        <View style={styles.detailRow}>
                          <Clock size={16} color={Colors.status.inProgress} />
                          <Text style={[styles.detailText, { color: Colors.status.inProgress }]}>
                            Currently on job #{tech.currentJobId}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.actionItem} onPress={handleAddTechnician}>
              <UserPlus size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Add New Technician</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.actionText}>Manage Schedules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionItem, styles.lastItem]}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.actionText}>View Team Locations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  techItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  techInfo: {
    flex: 1,
  },
  techNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  techSpecialties: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  techDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
});