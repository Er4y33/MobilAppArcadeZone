import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

type Props = {
  kalan: number;
  renk?: string;
  baslik?: string;
};

// Oyun başlamadan önce ekranı kaplayan 3-2-1 göstergesi
export default function GeriSayim({ kalan, renk = "#FBBF24", baslik }: Props) {
  return (
    <View style={styles.kutu}>
      {baslik ? <Text style={styles.baslik}>{baslik}</Text> : null}
      <Animated.Text
        key={kalan}
        entering={ZoomIn.duration(300)}
        style={[styles.sayi, { color: renk }]}
      >
        {kalan}
      </Animated.Text>
      <Text style={styles.alt}>Hazır ol!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kutu: { flex: 1, justifyContent: "center", alignItems: "center" },
  baslik: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sayi: { fontSize: 120, fontWeight: "900" },
  alt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9CA3AF",
    marginTop: 8,
  },
});
