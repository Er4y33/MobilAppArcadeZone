import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ScoreProvider } from "../context/ScoreContext";
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
        options={{ headerShown: true, title: "Reaction Tap" }}
      />
      <Stack.Screen
        name="game/play/memory"
        options={{ headerShown: true, title: "Memory Match" }}
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
    <ThemeProvider>
      <AuthProvider>
        <ScoreProvider>
          <RootNavigator />
        </ScoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
