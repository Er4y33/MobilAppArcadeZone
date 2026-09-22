import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../context/AuthContext";
import { HapticsProvider } from "../context/HapticsContext";
import { ScoreProvider } from "../context/ScoreContext";
import { SoundProvider } from "../context/SoundContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { dilBaslat } from "../lib/i18n";

function RootNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      {/* Tabs artık drawer'ın içinde */}
      <Stack.Screen name="(drawer)" />
      <Stack.Screen
        name="game/[id]"
        options={{ headerShown: true, title: t("oyun.detay") }}
      />
      <Stack.Screen
        name="game/play/reaction"
        options={{ headerShown: true, title: t("oyunlar.reaction.ad") }}
      />
      <Stack.Screen
        name="game/play/memory"
        options={{ headerShown: true, title: t("oyunlar.memory.ad") }}
      />
      <Stack.Screen
        name="game/play/sonsaniye"
        options={{ headerShown: true, title: t("oyunlar.sonsaniye.ad") }}
      />
      <Stack.Screen
        name="game/play/mathrush"
        options={{ headerShown: true, title: t("oyunlar.mathrush.ad") }}
      />
      <Stack.Screen
        name="game/play/pattern"
        options={{ headerShown: true, title: t("oyunlar.pattern.ad") }}
      />
      <Stack.Screen
        name="about"
        options={{ headerShown: true, title: t("hakkinda.baslik") }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // Dil, ilk ekran çizilmeden önce hazır olmalı
  const [dilHazir, setDilHazir] = useState(false);

  useEffect(() => {
    dilBaslat().finally(() => setDilHazir(true));
  }, []);

  if (!dilHazir) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <HapticsProvider>
          <AuthProvider>
            <SoundProvider>
              <ScoreProvider>
                <RootNavigator />
              </ScoreProvider>
            </SoundProvider>
          </AuthProvider>
        </HapticsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
