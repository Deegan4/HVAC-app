import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppStore } from "@/hooks/app-store";
import LoadingScreen from "@/components/LoadingScreen";
import PinSetupScreen from "@/components/PinSetupScreen";
import PinAuthScreen from "@/components/PinAuthScreen";

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
  const { isAuthenticated, hasPin, setPin, authenticatePin } = useAppStore();
  
  if (!hasPin) {
    return (
      <PinSetupScreen 
        onPinSet={setPin}
        isFirstTime={true}
      />
    );
  }
  
  if (!isAuthenticated) {
    return (
      <PinAuthScreen 
        onAuthenticate={authenticatePin}
      />
    );
  }
  
  return <RootLayoutNav />;
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
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthenticatedApp />
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}