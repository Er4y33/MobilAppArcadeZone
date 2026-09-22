import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("ortak.hata"), t("giris.zorunlu"));
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert(t("giris.basarisiz"), error);
    } else {
      router.replace("/(drawer)/(tabs)");
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

        <Text style={[styles.title, { color: colors.text }]}>
          {t("giris.baslik")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("giris.altBaslik")}
        </Text>

        <View style={styles.inputWrap}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t("giris.eposta")}
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
            placeholder={t("giris.epostaOrnek")}
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t("giris.sifre")}
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
            <Text style={styles.btnPrimaryText}>{t("giris.btn")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text
            style={{
              color: colors.textMuted,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {t("giris.sifremiUnuttum")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={[styles.linkText, { color: colors.textMuted }]}>
            {t("giris.hesabinYok")}
            <Text style={[styles.linkAccent, { color: colors.primary }]}>
              {t("giris.kayitOl")}
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
