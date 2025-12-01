import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/hooks/app-store';
import OwnerPasswordSetupScreen from '@/components/OwnerPasswordSetupScreen';
import OwnerPasswordAuthScreen from '@/components/OwnerPasswordAuthScreen';

interface OwnerAuthGuardProps {
  children: React.ReactNode;
}

export default function OwnerAuthGuard({ children }: OwnerAuthGuardProps) {
  const { 
    userRole, 
    hasOwnerPassword, 
    isOwnerAuthenticated, 
    setOwnerPassword, 
    authenticateOwnerPassword
  } = useAppStore();

  useEffect(() => {
    console.log('OwnerAuthGuard check:', { userRole, hasOwnerPassword, isOwnerAuthenticated });
  }, [userRole, hasOwnerPassword, isOwnerAuthenticated]);

  if (userRole === 'owner' && !hasOwnerPassword) {
    return (
      <OwnerPasswordSetupScreen
        onPasswordSet={async (password) => {
          await setOwnerPassword(password);
        }}
      />
    );
  }

  if (userRole === 'technician' && hasOwnerPassword && !isOwnerAuthenticated) {
    return (
      <OwnerPasswordAuthScreen
        onAuthenticate={async (password) => {
          return await authenticateOwnerPassword(password);
        }}
        onCancel={() => {
          router.back();
        }}
      />
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
