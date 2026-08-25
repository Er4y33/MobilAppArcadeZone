import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../context/AuthContext";
import { HapticsProvider } from "../context/HapticsContext";
import { ScoreProvider } from "../context/ScoreContext";
import { SoundProvider } from "../context/SoundContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
function RootNavigator() {
  const { colors } = useTheme();

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
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="game/[id]"
        options={{ headerShown: true, title: "Oyun Detayı" }}
      />
      <Stack.Screen
        name="game/play/reaction"
        options={{ headerShown: true, title: "Tepki Testi" }}
      />
      <Stack.Screen
        name="game/play/memory"
        options={{ headerShown: true, title: "Hafıza Eşleştirme" }}
      />
      <Stack.Screen
        name="game/play/sonsaniye"
        options={{ headerShown: true, title: "Son Saniye" }}
      />
      <Stack.Screen
        name="game/play/mathrush"
        options={{ headerShown: true, title: "Sayı Avı" }}
      />
      <Stack.Screen
        name="game/play/pattern"
        options={{ headerShown: true, title: "Sırayı Takip Et" }}
      />
      <Stack.Screen
        name="about"
        options={{ headerShown: true, title: "Hakkında" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
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
