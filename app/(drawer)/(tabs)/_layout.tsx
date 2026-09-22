import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { router, Tabs, useNavigation, usePathname } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Sol: hamburger — drawer'ı açar
  const HeaderSol = () => (
    <TouchableOpacity
      style={{ marginLeft: 16 }}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      hitSlop={10}
    >
      <Ionicons name="menu" size={26} color={colors.headerText} />
    </TouchableOpacity>
  );

  // Sağ: profil kısayolu (Ayarlar drawer'a taşındı)
  const HeaderSag = () => {
    const yol = usePathname();
    if (yol.includes("/profile")) return null;

    return (
      <View style={{ marginRight: 16 }}>
        <TouchableOpacity onPress={() => router.push("/profile")} hitSlop={10}>
          <Ionicons name="person-circle" size={26} color={colors.headerText} />
        </TouchableOpacity>
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
        headerLeft: () => <HeaderSol />,
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

      {/* Tab bar'da gizli — drawer'dan veya header'dan açılır */}
      <Tabs.Screen name="profile" options={{ title: "Profil", href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Ayarlar", href: null }} />
      <Tabs.Screen name="backend" options={{ href: null }} />
    </Tabs>
  );
}
