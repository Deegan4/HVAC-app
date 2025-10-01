import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  X
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Technician } from '@/types';

export default function TeamManagementScreen() {
  const { technicians, addTechnician, updateTechnician, deleteTechnician, userRole } = useAppStore();
  
  React.useEffect(() => {
    if (userRole === 'technician') {
      Alert.alert(
        'Access Denied',
        'This feature is only available to owners and managers.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [userRole]);
  
  console.log('TeamManagementScreen render - technicians count:', technicians.length);
  console.log('TeamManagementScreen render - technicians:', technicians);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [newTech, setNewTech] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    availability: 'available' as const,
  });

  const handleAddTechnician = () => {
    setShowAddModal(true);
  };

  const handleSaveNewTechnician = async () => {
    if (!newTech.name.trim() || !newTech.email.trim() || !newTech.phone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const technicianData = {
        name: newTech.name.trim(),
        email: newTech.email.trim(),
        phone: newTech.phone.trim(),
        specialties: newTech.specialties.split(',').map(s => s.trim()).filter(s => s),
        availability: newTech.availability,
        currentJobId: undefined,
      };

      console.log('Adding technician:', technicianData);
      console.log('Current technicians count before add:', technicians.length);
      
      addTechnician(technicianData);
      
      console.log('Technician added, current count should be:', technicians.length + 1);
      
      setNewTech({ name: '', email: '', phone: '', specialties: '', availability: 'available' });
      setShowAddModal(false);
      Alert.alert('Success', 'Technician added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add technician. Please try again.');
      console.log('Error adding technician:', error);
    }
  };

  const handleEditTechnician = (tech: Technician) => {
    setEditingTech(tech);
    setShowEditModal(true);
  };

  const handleSaveEditTechnician = async () => {
    if (!editingTech) return;

    try {
      updateTechnician(editingTech.id, editingTech);
      
      setEditingTech(null);
      setShowEditModal(false);
      Alert.alert('Success', 'Technician updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update technician. Please try again.');
      console.log('Error updating technician:', error);
    }
  };

  const handleDeleteTechnician = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    Alert.alert(
      'Delete Technician',
      `Are you sure you want to remove ${tech?.name} from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              deleteTechnician(techId);
              Alert.alert('Success', 'Technician removed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove technician.');
            }
          }
        }
      ]
    );
  };

  const handleToggleAvailability = async (techId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'offline' : 'available';
    
    try {
      updateTechnician(techId, { availability: newStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability.');
      console.log('Error updating availability:', error);
    }
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
                        {(tech.specialties && tech.specialties.length > 0) 
                          ? tech.specialties.join(', ') 
                          : (tech.skills && tech.skills.length > 0) 
                            ? tech.skills.join(', ') 
                            : 'No specialties listed'
                        }
                      </Text>
                    </View>
                    <View style={styles.techActions}>
                      <TouchableOpacity
                        onPress={() => handleEditTechnician(tech)}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color={Colors.text.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTechnician(tech.id)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={Colors.status.emergency} />
                      </TouchableOpacity>
                      <Switch
                        value={tech.availability === 'available'}
                        onValueChange={() => handleToggleAvailability(tech.id, tech.availability)}
                        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                        thumbColor={tech.availability === 'available' ? Colors.primary : '#f4f3f4'}
                      />
                    </View>
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
                          Specialties: {(tech.specialties && tech.specialties.length > 0) 
                            ? tech.specialties.join(', ') 
                            : (tech.skills && tech.skills.length > 0) 
                              ? tech.skills.join(', ') 
                              : 'No specialties listed'
                          }
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

        {/* Add Technician Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Technician</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTech.name}
                  onChangeText={(text) => setNewTech(prev => ({ ...prev, name: text }))}
                  placeholder="Enter technician name"
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTech.email}
                  onChangeText={(text) => setNewTech(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTech.phone}
                  onChangeText={(text) => setNewTech(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialties</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTech.specialties}
                  onChangeText={(text) => setNewTech(prev => ({ ...prev, specialties: text }))}
                  placeholder="e.g., HVAC, Refrigeration, Electrical"
                  multiline
                />
                <Text style={styles.inputHint}>Separate multiple specialties with commas</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveNewTechnician}
              >
                <Text style={styles.modalSaveText}>Add Technician</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Edit Technician Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Technician</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            {editingTech && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingTech.name}
                    onChangeText={(text) => setEditingTech(prev => prev ? { ...prev, name: text } : null)}
                    placeholder="Enter technician name"
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingTech.email}
                    onChangeText={(text) => setEditingTech(prev => prev ? { ...prev, email: text } : null)}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingTech.phone}
                    onChangeText={(text) => setEditingTech(prev => prev ? { ...prev, phone: text } : null)}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Specialties</Text>
                  <TextInput
                    style={styles.textInput}
                    value={(editingTech.specialties && editingTech.specialties.length > 0) 
                      ? editingTech.specialties.join(', ') 
                      : (editingTech.skills && editingTech.skills.length > 0) 
                        ? editingTech.skills.join(', ') 
                        : ''
                    }
                    onChangeText={(text) => setEditingTech(prev => prev ? { 
                      ...prev, 
                      specialties: text.split(',').map(s => s.trim()).filter(s => s)
                    } : null)}
                    placeholder="e.g., HVAC, Refrigeration, Electrical"
                    multiline
                  />
                  <Text style={styles.inputHint}>Separate multiple specialties with commas</Text>
                </View>
              </ScrollView>
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEditTechnician}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
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
  techActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});