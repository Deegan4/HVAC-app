import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppStore } from "@/hooks/app-store";
import LoadingScreen from "@/components/LoadingScreen";
import PinSetupScreen from "@/components/PinSetupScreen";
import PinAuthScreen from "@/components/PinAuthScreen";
import RoleSelectionScreen, { UserRole } from "@/components/RoleSelectionScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import LanguageSelectionScreen, { Language } from "@/components/LanguageSelectionScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import TourManager from "@/components/TourManager";

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
  const { isAuthenticated, hasPin, hasRole, hasLanguage, hasCompletedOnboarding, userRole, language, setPin, setUserRole, setLanguage, authenticatePin, completeOnboarding } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  console.log('AuthenticatedApp state:', { 
    hasLanguage, 
    hasCompletedOnboarding, 
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
  
  // Then show onboarding
  if (!hasCompletedOnboarding) {
    console.log('Showing onboarding with language:', language);
    return (
      <OnboardingScreen 
        onComplete={async () => {
          await completeOnboarding();
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
  
  return (
    <>
      <RootLayoutNav />
      <TourManager autoStart={true} />
    </>
  );
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Show the spinning snowflake for at least 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Hide the splash screen and show the app
      await SplashScreen.hideAsync();
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Welcome to Oliva Refrigeration" size={72} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthenticatedApp />
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}