import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

// Metinler locales/*.json içinde: onboarding.s1baslik, onboarding.s1aciklama ...
const SLIDE_IDS = ["s1", "s2", "s3"] as const;
const SLIDE_EMOJIS: Record<(typeof SLIDE_IDS)[number], string> = {
  s1: "🎮",
  s2: "⚡🧠⏱",
  s3: "🏆",
};

const ONBOARDING_KEY = "arcadezone:onboarding_done";

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
}

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  // Dil değişirse metinler de yenilensin
  const slides = useMemo(
    () =>
      SLIDE_IDS.map((id) => ({
        id,
        emoji: SLIDE_EMOJIS[id],
        title: t(`onboarding.${id}baslik`),
        desc: t(`onboarding.${id}aciklama`),
      })),
    [t],
  );

  const goNext = async () => {
    if (current < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      await markOnboardingDone();
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.desc, { color: colors.textMuted }]}>
              {item.desc}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === current ? colors.primary : colors.border,
                width: i === current ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Buton */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={goNext}
      >
        <Text style={styles.btnText}>
          {current === slides.length - 1 ? t("ortak.basla") : t("ortak.ileri")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emoji: { fontSize: 72, marginBottom: 32, textAlign: "center" },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  desc: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
