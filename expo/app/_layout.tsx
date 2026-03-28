import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppStore } from "@/hooks/app-store";
import { ThemeProvider } from "@/hooks/theme-store";

import PinSetupScreen from "@/components/PinSetupScreen";
import PinAuthScreen from "@/components/PinAuthScreen";
import RoleSelectionScreen, { UserRole } from "@/components/RoleSelectionScreen";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const { isAuthenticated, hasPin, hasRole, userRole, language, setPin, setUserRole, authenticatePin, isLoading, hasCompletedOnboarding, completeOnboarding } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  React.useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);
  
  console.log('AuthenticatedApp state:', { 
    hasRole, 
    hasPin, 
    isAuthenticated,
    userRole,
    language,
    isLoading,
    isReady
  });
  
  // Wait until data is loaded before making auth decisions
  if (!isReady) {
    return null;
  }
  
  // Check if user has selected a role
  if (!hasRole) {
    return (
      <RoleSelectionScreen 
        language={language}
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

  // Show onboarding for first-time users
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingTutorial
        onComplete={async () => {
          await completeOnboarding();
        }}
      />
    );
  }
  
  return <RootLayoutNav />;
}

export default function RootLayout() {
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