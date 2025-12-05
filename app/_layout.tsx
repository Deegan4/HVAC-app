import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppStore } from "@/hooks/app-store";
import { ThemeProvider } from "@/hooks/theme-store";

import PinSetupScreen from "@/components/PinSetupScreen";
import PinAuthScreen from "@/components/PinAuthScreen";
import RoleSelectionScreen, { UserRole } from "@/components/RoleSelectionScreen";

import LanguageSelectionScreen, { Language } from "@/components/LanguageSelectionScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="job-details" options={{ 
        title: "Job Details",
        presentation: "modal",
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFFFFF',
      }} />
      <Stack.Screen name="new-job" options={{ 
        title: "New Job",
        presentation: "modal",
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFFFFF',
      }} />
      <Stack.Screen name="customer-details" options={{ 
        title: "Customer Details",
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#FFFFFF',
      }} />
      <Stack.Screen name="camera" options={{ 
        title: "Camera",
        presentation: "fullScreenModal",
        headerShown: false,
      }} />
      <Stack.Screen name="signature" options={{ 
        title: "Signature",
        presentation: "fullScreenModal",
        headerShown: false,
      }} />
    </Stack>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, hasPin, hasRole, hasLanguage, userRole, language, setPin, setUserRole, setLanguage, authenticatePin } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  console.log('AuthenticatedApp state:', { 
    hasLanguage, 
    hasRole, 
    hasPin, 
    isAuthenticated,
    userRole,
    language
  });
  
  // First show language selection
  if (!hasLanguage) {
    return (
      <LanguageSelectionScreen 
        onLanguageSelected={async (language: Language) => {
          console.log('_layout - onLanguageSelected called with:', language);
          await setLanguage(language);
        }}
      />
    );
  }
  
  // Then check if user has selected a role
  if (!hasRole) {
    return (
      <RoleSelectionScreen 
        onRoleSelected={async (role: UserRole) => {
          setSelectedRole(role);
          await setUserRole(role);
        }}
      />
    );
  }
  
  // Then check if user has set up a PIN
  if (!hasPin) {
    return (
      <PinSetupScreen 
        onPinSet={async (pin: string) => {
          console.log('_layout - PinSetupScreen onPinSet called');
          await setPin(pin);
          console.log('_layout - setPin completed');
        }}
        isFirstTime={true}
        userRole={userRole || selectedRole || undefined}
      />
    );
  }
  
  // Finally check if user is authenticated
  if (!isAuthenticated) {
    return (
      <PinAuthScreen 
        onAuthenticate={async (pin: string) => {
          return await authenticatePin(pin);
        }}
      />
    );
  }
  
  return <RootLayoutNav />;
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      await SplashScreen.hideAsync();
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AuthenticatedApp />
            </GestureHandlerRootView>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}