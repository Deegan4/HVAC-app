import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import TechnicianLocationService from '@/components/TechnicianLocationService';
import { useAppStore } from '@/hooks/app-store';

export default function TechnicianLocationPage() {
  const { technicianId } = useLocalSearchParams<{ technicianId: string }>();
  const { technicians } = useAppStore();
  
  const technician = technicians.find(t => t.id === technicianId);
  const technicianName = technician?.name || 'Technician';

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: technicianName,
          headerStyle: { backgroundColor: '#0066CC' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      <TechnicianLocationService 
        technicianId={technicianId || 'tech1'} 
        onStatusUpdate={(status) => {
          console.log('Status updated:', status);
        }}
      />
    </>
  );
}