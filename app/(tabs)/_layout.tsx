import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Tabs, usePathname } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  const HeaderSag = () => {
    const yol = usePathname();
    const profildeyiz = yol.includes("/profile");
    const ayarlardayiz = yol.includes("/settings");

    return (
      <View style={{ flexDirection: "row", gap: 18, marginRight: 16 }}>
        {!profildeyiz && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Ionicons
              name="person-circle"
              size={26}
              color={colors.headerText}
            />
          </TouchableOpacity>
        )}
        {!ayarlardayiz && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.headerText}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.headerText,
        headerTitleAlign: "center",
        headerRight: () => <HeaderSag />,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Menü",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: "Oyunlar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Görevler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Mağaza",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Skor",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />

      {/* Tab bar'da gizli — header'daki ikonlardan açılır */}
      <Tabs.Screen name="profile" options={{ title: "Profil", href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Ayarlar", href: null }} />
      <Tabs.Screen name="backend" options={{ href: null }} />
    </Tabs>
  );
}
