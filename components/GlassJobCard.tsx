import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Clock, MapPin, Wrench, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Job } from '@/types';

interface GlassJobCardProps {
  job: Job;
  onPress: () => void;
  getStatusColor: (status: Job['status']) => string;
  getStatusText: (status: Job['status']) => string;
}

export default function GlassJobCard({ 
  job, 
  onPress, 
  getStatusColor, 
  getStatusText 
}: GlassJobCardProps) {
  const getPriorityIcon = (priority: Job['priority']) => {
    if (priority === 'emergency') {
      return <AlertCircle size={16} color={Colors.status.emergency} />;
    }
    return null;
  };

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Clock size={14} color={Colors.text.primary} />
          <Text style={styles.time}>{job.scheduledTime}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
        </View>
      </View>

      <Text style={styles.customerName}>{job.customerName}</Text>
      
      <View style={styles.info}>
        <MapPin size={14} color={Colors.text.secondary} />
        <Text style={styles.address} numberOfLines={1}>{job.address}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.typeContainer}>
          <Wrench size={14} color={Colors.text.secondary} />
          <Text style={styles.type}>{job.type}</Text>
          {getPriorityIcon(job.priority)}
        </View>
        {job.technicianName && (
          <Text style={styles.technician}>{job.technicianName}</Text>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={styles.webContainer}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <BlurView intensity={70} tint="light" style={styles.container}>
        <View style={styles.overlay}>
          {renderContent()}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text.inverse,
    textTransform: 'uppercase' as const,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  address: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: 13,
    color: Colors.text.secondary,
    textTransform: 'capitalize' as const,
    fontWeight: '500' as const,
  },
  technician: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  webContainer: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
});
