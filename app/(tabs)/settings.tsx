import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(false);

  // AuthContext'ten çıkış yapma fonksiyonunu alıyoruz
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut(); // Supabase'den ve telefon hafızasından oturumu siler
    router.replace("/(auth)/login"); // Login ekranına geri şutlar
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Müzik</Text>
        <Switch value={music} onValueChange={setMusic} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ses Efektleri</Text>
        <Switch value={sound} onValueChange={setSound} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Bildirimler</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Hesaptan Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  row: {
    backgroundColor: "#151B2E",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#EF4444", // Kırmızı çıkış butonu rengi
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
