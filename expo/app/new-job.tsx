import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Clock, User, MapPin, FileText, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/app-store';
import { Job } from '@/types';

export default function NewJobScreen() {
  const { customers, technicians, addJob } = useAppStore();
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [jobType, setJobType] = useState<Job['type']>('repair');
  const [priority, setPriority] = useState<Job['priority']>('normal');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [duration, setDuration] = useState('60');

  const handleSubmit = () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    if (!description) {
      Alert.alert('Error', 'Please enter a project description');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    const technician = technicians.find(t => t.id === selectedTechnician);

    const newJob: Omit<Job, 'id'> = {
      customerId: selectedCustomer,
      customerName: customer?.name || '',
      address: customer?.address || '',
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      priority,
      type: jobType,
      description,
      technicianId: selectedTechnician || undefined,
      technicianName: technician?.name || undefined,
      duration: parseInt(duration),
      notes: notes || undefined,
    };

    addJob(newJob);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer *</Text>
          <View style={styles.pickerContainer}>
            <User size={20} color={Colors.text.secondary} />
            <View style={styles.picker}>
              {customers.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  style={[
                    styles.pickerOption,
                    selectedCustomer === customer.id && styles.pickerOptionSelected
                  ]}
                  onPress={() => setSelectedCustomer(customer.id)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedCustomer === customer.id && styles.pickerOptionTextSelected
                  ]}>
                    {customer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Job Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Type</Text>
          <View style={styles.buttonGroup}>
            {(['repair', 'maintenance', 'installation', 'inspection', 'construction', 'consulting'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  jobType === type && styles.typeButtonSelected
                ]}
                onPress={() => setJobType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  jobType === type && styles.typeButtonTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.buttonGroup}>
            {(['low', 'normal', 'high', 'emergency'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonSelected,
                  priority === p && { backgroundColor: getPriorityColor(p) }
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === p && styles.priorityButtonTextSelected
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.inputContainer}>
            <Calendar size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={scheduledDate}
              onChangeText={setScheduledDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.text.light}
            />
          </View>
          <View style={styles.inputContainer}>
            <Clock size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholder="HH:MM"
              placeholderTextColor={Colors.text.light}
            />
          </View>
        </View>

        {/* Technician */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Crew Member</Text>
          <View style={styles.pickerContainer}>
            <User size={20} color={Colors.text.secondary} />
            <View style={styles.picker}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  !selectedTechnician && styles.pickerOptionSelected
                ]}
                onPress={() => setSelectedTechnician('')}
              >
                <Text style={[
                  styles.pickerOptionText,
                  !selectedTechnician && styles.pickerOptionTextSelected
                ]}>
                  Unassigned
                </Text>
              </TouchableOpacity>
              {technicians.map(tech => (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.pickerOption,
                    selectedTechnician === tech.id && styles.pickerOptionSelected
                  ]}
                  onPress={() => setSelectedTechnician(tech.id)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedTechnician === tech.id && styles.pickerOptionTextSelected
                  ]}>
                    {tech.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <View style={styles.textAreaContainer}>
            <FileText size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the project..."
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <View style={styles.textAreaContainer}>
            <FileText size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Duration (minutes)</Text>
          <View style={styles.inputContainer}>
            <Clock size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="60"
              placeholderTextColor={Colors.text.light}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Project</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getPriorityColor(priority: Job['priority']) {
  switch (priority) {
    case 'emergency':
      return Colors.status.emergency;
    case 'high':
      return Colors.accent;
    case 'normal':
      return Colors.primary;
    default:
      return Colors.text.secondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  picker: {
    flex: 1,
    marginLeft: 12,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  pickerOptionTextSelected: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  typeButtonTextSelected: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityButtonSelected: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  priorityButtonTextSelected: {
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
  },
});