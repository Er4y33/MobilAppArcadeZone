import { Stack } from "expo-router";
import React from "react";
import { ScoreProvider } from "../context/ScoreContext";

export default function RootLayout() {
  return (
    <ScoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
          name="game/play/swipe"
          options={{ headerShown: true, title: "Swipe Dodge" }}
        />
      </Stack>
    </ScoreProvider>
  );
}
