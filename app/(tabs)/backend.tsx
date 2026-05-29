import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../../lib/api";

export default function BackendScreen() {
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // NestJS API'den oyuncuları çek (fetch ile API tüketimi)
    api
      .get("/players")
      .then(setPlayers)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NestJS API — Oyuncular</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={players}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text style={styles.row}>
            👤 {item.username} — {item.email}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  row: { fontSize: 16, paddingVertical: 6 },
  error: { color: "red", marginBottom: 10 },
});
