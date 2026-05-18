import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "E-posta ve şifre zorunludur.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert("Giriş Başarısız", error);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>ARCADE</Text>
          <Text style={styles.logoSub}>ZONE</Text>
        </View>

        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Hesabına gir ve oynamaya başla!</Text>

        {/* E-posta */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>E-Posta Adresi</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            placeholderTextColor="#4B5563"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Şifre */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#4B5563"
            secureTextEntry
          />
        </View>

        {/* Giriş Butonu */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnPrimaryText}>OYUNA GİR</Text>
          )}
        </TouchableOpacity>

        {/* Kayıt ol linki */}
        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.linkText}>
            Hesabın yok mu? <Text style={styles.linkAccent}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#A855F7",
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 28,
    fontWeight: "900",
    color: "#EC4899",
    letterSpacing: 6,
    marginTop: -8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 28,
  },
  inputWrap: {
    marginBottom: 16,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#151B2E",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1F2B47",
  },
  btnPrimary: {
    backgroundColor: "#EC4899",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  linkWrap: {
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  linkAccent: {
    color: "#A855F7",
    fontWeight: "700",
  },
});
