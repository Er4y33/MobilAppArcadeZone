import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0B1020",
        }}
      >
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/games" />;
  }

  return <Redirect href="/(auth)/login" />;
}
