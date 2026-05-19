import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { colors } = useTheme();

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Hata", "Tüm alanlar zorunludur.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (error) {
      Alert.alert("Kayıt Başarısız", error);
    } else {
      Alert.alert(
        "Kayıt Başarılı! 🎉",
        "Hesabın oluşturuldu. Şimdi giriş yapabilirsin.",
        [{ text: "Tamam", onPress: () => router.replace("/(auth)/login") }],
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Text style={[styles.logo, { color: colors.primary }]}>ARCADE</Text>
            <Text style={[styles.logoSub, { color: colors.primaryAlt }]}>
              ZONE
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Hesap Oluştur
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Katıl, oyna ve lider tablosuna gir!
          </Text>

          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Kullanıcı Adı
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
              value={username}
              onChangeText={setUsername}
              placeholder="ArcadeKing"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

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
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Şifre
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
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>HESAP OLUŞTUR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Zaten hesabın var mı?{" "}
              <Text style={[styles.linkAccent, { color: colors.primaryAlt }]}>
                Giriş Yap
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 24, justifyContent: "center", flexGrow: 1 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
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
