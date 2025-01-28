import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "@/hooks/useColorScheme";

const INACTIVE_COLOR = "#000000"; // Black color for inactive icons

export default function CustomTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white", // Set background to white
          ...Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="(journal)"
        options={{
          title: "My Journals",
          headerShown: true,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="book" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
