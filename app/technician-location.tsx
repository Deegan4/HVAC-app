import React from 'react';
import { Stack } from 'expo-router';
import TechnicianLocationService from '@/components/TechnicianLocationService';
import { useAppStore } from '@/hooks/app-store';

export default function TechnicianLocationPage() {
  const { currentTechnicianId } = useAppStore();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Location & Status',
          headerStyle: { backgroundColor: '#0066CC' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      <TechnicianLocationService 
        technicianId={currentTechnicianId || 'tech1'} 
        onStatusUpdate={(status) => {
          console.log('Status updated:', status);
          // In a real app, this would send the update to a server
        }}
      />
    </>
  );
}