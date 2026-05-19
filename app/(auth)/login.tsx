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
import { useTheme } from "../../context/ThemeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors } = useTheme();

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <View style={styles.logoWrap}>
          <Text style={[styles.logo, { color: colors.primary }]}>ARCADE</Text>
          <Text style={[styles.logoSub, { color: colors.primaryAlt }]}>
            ZONE
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Giriş Yap</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Hesabına gir ve oynamaya başla!
        </Text>

        <View style={styles.inputWrap}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            E-Posta Adresi
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Şifre</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: colors.primaryAlt }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimaryText}>OYUNA GİR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={[styles.linkText, { color: colors.textMuted }]}>
            Hesabın yok mu?{" "}
            <Text style={[styles.linkAccent, { color: colors.primary }]}>
              Kayıt Ol
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  logoWrap: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 42, fontWeight: "900", letterSpacing: 4 },
  logoSub: { fontSize: 28, fontWeight: "900", letterSpacing: 6, marginTop: -8 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 28 },
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  btnPrimary: {
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
  linkWrap: { alignItems: "center", marginTop: 4 },
  linkText: { fontSize: 14 },
  linkAccent: { fontWeight: "700" },
});
