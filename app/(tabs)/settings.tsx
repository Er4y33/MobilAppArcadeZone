import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
export default function SettingsScreen() {
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const { signOut } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>

      {/* Tema Toggle */}
      <View style={[styles.row, { backgroundColor: colors.surface }]}>
        <View style={styles.rowLeft}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={22}
            color={colors.accent}
          />
          <Text style={[styles.label, { color: colors.text }]}>
            {isDark ? "Karanlık Tema" : "Aydınlık Tema"}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Müzik */}
      <View style={[styles.row, { backgroundColor: colors.surface }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="musical-notes" size={22} color={colors.info} />
          <Text style={[styles.label, { color: colors.text }]}>Müzik</Text>
        </View>
        <Switch
          value={music}
          onValueChange={setMusic}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
        />
      </View>

      {/* Ses Efektleri */}
      <View style={[styles.row, { backgroundColor: colors.surface }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="volume-high" size={22} color={colors.success} />
          <Text style={[styles.label, { color: colors.text }]}>
            Ses Efektleri
          </Text>
        </View>
        <Switch
          value={sound}
          onValueChange={setSound}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
        />
      </View>

      {/* Bildirimler */}
      <View style={[styles.row, { backgroundColor: colors.surface }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="notifications" size={22} color={colors.primaryAlt} />
          <Text style={[styles.label, { color: colors.text }]}>
            Bildirimler
          </Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
        />
      </View>
      {/* Hakkinda */}
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface }]}
        onPress={() => router.push("/about")}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="information-circle" size={22} color={colors.info} />
          <Text style={[styles.label, { color: colors.text }]}>Hakkinda</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {/* Çıkış Yap */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.danger }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        <Text style={styles.logoutText}>Hesaptan Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  row: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
