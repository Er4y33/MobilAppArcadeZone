import Constants from "expo-constants";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
const TEKNOLOJILER = [
  "React Native",
  "Expo",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Reanimated",
];

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>⭐</Text>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            ARCADE ZONE
          </Text>
          <Text style={[styles.logoSub, { color: colors.textMuted }]}>
            v{Constants.expoConfig?.version ?? "1.1.0"}
          </Text>
        </View>

        {/* Hakkında */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            ArcadeZone, refleks, hafıza, kelime ve matematik becerilerini
            geliştiren beş mini oyundan oluşan bir koleksiyondur. Bir okul
            projesi olarak başladı, sonrasında geliştirilerek yayınlandı.
          </Text>
        </View>

        {/* Ekip */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          EKİP
        </Text>

        <View
          style={[
            styles.devCard,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
        >
          <Text style={[styles.devName, { color: colors.text }]}>Eray</Text>
          <Text style={[styles.devRole, { color: colors.accent }]}>
            Geliştirme & Backend
          </Text>
          <Text style={[styles.devDetail, { color: colors.textMuted }]}>
            Oyun mekanikleri, zorluk sistemi, veritabanı mimarisi, skor ve ödül
            altyapısı, ses sistemi, yayın süreci
          </Text>
          <TouchableOpacity
            style={[styles.ghBtn, { borderColor: colors.border }]}
            onPress={() => Linking.openURL("https://github.com/er4y33")}
          >
            <Text style={[styles.ghText, { color: colors.info }]}>
              github.com/er4y33
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.devCard,
            { backgroundColor: colors.surface, borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.devName, { color: colors.text }]}>
            Melih Atahan Akgün
          </Text>
          <Text style={[styles.devRole, { color: colors.primary }]}>
            Arayüz Tasarımı
          </Text>
          <Text style={[styles.devDetail, { color: colors.textMuted }]}>
            İlk sürüm arayüz tasarımı ve görsel yönelim
          </Text>
          <TouchableOpacity
            style={[styles.ghBtn, { borderColor: colors.border }]}
            onPress={() =>
              Linking.openURL("https://github.com/MelihAtahanAkgun")
            }
          >
            <Text style={[styles.ghText, { color: colors.info }]}>
              github.com/MelihAtahanAkgun
            </Text>
          </TouchableOpacity>
        </View>

        {/* Teknolojiler */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          KULLANILAN TEKNOLOJİLER
        </Text>

        <View style={styles.etiketSatiri}>
          {TEKNOLOJILER.map((t) => (
            <View
              key={t}
              style={[
                styles.etiket,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.etiketMetin, { color: colors.textMuted }]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        {/* Teşekkürler */}
        <View style={[styles.thanksBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.thanksLabel, { color: colors.textMuted }]}>
            ÖZEL TEŞEKKÜRLER
          </Text>
          <Text style={[styles.thanksText, { color: colors.textSecondary }]}>
            Tüm ArcadeZone Oyuncularına!
          </Text>
          <TouchableOpacity
            style={{ marginTop: 14 }}
            onPress={() =>
              Linking.openURL("https://er4y33.github.io/arcadezone-privacy")
            }
          >
            <Text style={[styles.thanksText, { color: colors.info }]}>
              Gizlilik Politikası
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.menuBtnText, { color: colors.text }]}>
            GERİ DÖN
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  icerik: { padding: 24, paddingBottom: 32 },

  logoWrap: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: "900", letterSpacing: 3 },
  logoSub: { fontSize: 13, marginTop: 4 },

  infoBox: { borderRadius: 16, padding: 18, marginBottom: 24 },
  infoText: { fontSize: 14, lineHeight: 21 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  devCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  devName: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  devRole: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  devDetail: { fontSize: 12, lineHeight: 18 },
  ghBtn: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  ghText: { fontSize: 12, fontWeight: "700" },
  etiketSatiri: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  etiket: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  etiketMetin: { fontSize: 12, fontWeight: "600" },

  thanksBox: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    alignItems: "center",
  },
  thanksLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  thanksText: { fontSize: 15, fontWeight: "600" },

  menuBtn: { padding: 14, borderRadius: 14, alignItems: "center" },
  menuBtnText: { fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
