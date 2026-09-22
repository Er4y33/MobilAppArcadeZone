import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useHaptics } from "../../../context/HapticsContext";
import { useSound } from "../../../context/SoundContext";
import { useTheme } from "../../../context/ThemeContext";
import { hapticLight } from "../../../lib/haptics";
import { DILLER, DilKodu, dilDegistir } from "../../../lib/i18n";
import { supabase } from "../../../lib/supabase";

export default function SettingsScreen() {
  const { sesAcik, muzikAcik, sesAyarla, muzikAyarla, cal } = useSound();
  const { signOut } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const { hapticsEnabled, setHaptics } = useHaptics();
  // i18n'i de alıyoruz: dil değişince bu ekran kendini yeniler
  const { t, i18n } = useTranslation();
  const isDark = mode === "dark";
  const seciliDil = i18n.language?.split("-")[0];

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const handleToggleHaptics = (value: boolean) => {
    setHaptics(value);
    // Açıldığı anda örnek titreşim ver — kullanıcı ne açtığını hissetsin
    if (value) hapticLight();
  };

  const handleDilSec = (kod: DilKodu) => {
    if (kod === seciliDil) return;
    cal("click");
    dilDegistir(kod);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("ayarlar.hesapSilBaslik"), t("ayarlar.hesapSilMetin"), [
      { text: t("ayarlar.vazgec"), style: "cancel" },
      {
        text: t("ayarlar.hesabiSil"),
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.rpc("delete_my_account");
          if (error) {
            Alert.alert(t("ayarlar.hesapSilinemedi"), error.message);
            return;
          }
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        {/* Tema Toggle */}
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={colors.accent}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {isDark ? t("ayarlar.karanlikTema") : t("ayarlar.aydinlikTema")}
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
              name={
                hapticsEnabled ? "phone-portrait" : "phone-portrait-outline"
              }
              size={22}
              color={colors.primaryAlt}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("ayarlar.titresim")}
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={handleToggleHaptics}
            trackColor={{ false: "#D1D5DB", true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Ses Toggle */}
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <Ionicons
              name={sesAcik ? "volume-high" : "volume-mute"}
              size={22}
              color={colors.primaryAlt}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("ayarlar.sesEfektleri")}
            </Text>
          </View>
          <Switch
            value={sesAcik}
            onValueChange={(v) => {
              sesAyarla(v);
              if (v) cal("click");
            }}
            trackColor={{ false: "#D1D5DB", true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Müzik Toggle */}
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <Ionicons
              name={muzikAcik ? "musical-notes" : "musical-notes-outline"}
              size={22}
              color={colors.primaryAlt}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("ayarlar.arkaPlanMuzigi")}
            </Text>
          </View>
          <Switch
            value={muzikAcik}
            onValueChange={muzikAyarla}
            trackColor={{ false: "#D1D5DB", true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Dil seçimi */}
        <View style={[styles.dilKutu, { backgroundColor: colors.surface }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="language" size={22} color={colors.info} />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("ayarlar.dil")}
            </Text>
          </View>

          <View style={styles.dilSatiri}>
            {DILLER.map((d) => {
              const aktif = seciliDil === d.kod;
              return (
                <TouchableOpacity
                  key={d.kod}
                  style={[
                    styles.dilBtn,
                    { borderColor: colors.border },
                    aktif && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleDilSec(d.kod)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.dilMetin,
                      { color: aktif ? "#FFFFFF" : colors.textMuted },
                    ]}
                  >
                    {d.bayrak} {d.ad}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Hakkinda */}
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.surface }]}
          onPress={() => router.push("/about")}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle" size={22} color={colors.info} />
            <Text style={[styles.label, { color: colors.text }]}>
              {t("sekmeler.hakkinda")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Çıkış Yap */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t("ayarlar.cikisYap")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: colors.danger }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.deleteText, { color: colors.danger }]}>
            {t("ayarlar.hesabiSil")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icerik: {
    padding: 20,
    paddingBottom: 32,
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

  // Dil bölümü
  dilKutu: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  dilSatiri: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  dilBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dilMetin: { fontSize: 14, fontWeight: "700" },

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
