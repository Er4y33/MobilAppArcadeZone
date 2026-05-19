import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ScoreProvider } from "../context/ScoreContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScoreProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="game/[id]"
              options={{ headerShown: true, title: "Oyun Detayi" }}
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
              name="about"
              options={{ headerShown: true, title: "Hakkinda" }}
            />
          </Stack>
        </ScoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
