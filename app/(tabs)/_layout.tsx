import { Tabs } from "expo-router";
import { Calendar, Users, FileText, Grid3x3, MapPin } from "lucide-react-native";
import React from "react";
import { Colors } from "@/constants/colors";
import { useAppStore } from "@/hooks/app-store";
import { useTranslation } from "@/constants/translations";

export default function TabLayout() {
  const { userRole, language } = useAppStore();
  const t = useTranslation(language);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: t.customers,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          href: userRole === 'owner' ? '/customers' : null,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: t.invoices,
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: t.tracking,
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
          href: userRole === 'owner' ? '/tracking' : null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.more,
          tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}