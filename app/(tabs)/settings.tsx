import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHaptics } from "../../context/HapticsContext";
import { useTheme } from "../../context/ThemeContext";
import { hapticLight } from "../../lib/haptics";
import { supabase } from "../../lib/supabase";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const { hapticsEnabled, setHaptics } = useHaptics();
  const isDark = mode === "dark";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const handleToggleHaptics = (value: boolean) => {
    setHaptics(value);
    // Açıldığı anda örnek titreşim ver — kullanıcı ne açtığını hissetsin
    if (value) hapticLight();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı sil",
      "Tüm skorların, XP'in ve coinlerin kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabımı Sil",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.rpc("delete_my_account");
            if (error) {
              Alert.alert("Hesap silinemedi", error.message);
              return;
            }
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
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

      {/* Titreşim Toggle */}
      <View style={[styles.row, { backgroundColor: colors.surface }]}>
        <View style={styles.rowLeft}>
          <Ionicons
            name={hapticsEnabled ? "phone-portrait" : "phone-portrait-outline"}
            size={22}
            color={colors.primaryAlt}
          />
          <Text style={[styles.label, { color: colors.text }]}>Titreşim</Text>
        </View>
        <Switch
          value={hapticsEnabled}
          onValueChange={handleToggleHaptics}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Hakkinda */}
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface }]}
        onPress={() => router.push("/about")}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="information-circle" size={22} color={colors.info} />
          <Text style={[styles.label, { color: colors.text }]}>Hakkında</Text>
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

      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: colors.danger }]}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
        <Text style={[styles.deleteText, { color: colors.danger }]}>
          Hesabımı Sil
        </Text>
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
  deleteButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  deleteText: { fontSize: 15, fontWeight: "700" },
});
