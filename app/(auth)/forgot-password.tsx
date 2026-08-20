import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("E-posta gerekli", "Lütfen e-posta adresini gir.");
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
    setSending(false);

    if (error) {
      Alert.alert("Gönderilemedi", error.message);
      return;
    }

    Alert.alert(
      "E-posta gönderildi",
      "Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Gelen kutunu kontrol et.",
      [{ text: "Tamam", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Şifremi Unuttum
      </Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        Hesabına kayıtlı e-posta adresini gir, sıfırlama bağlantısı gönderelim.
      </Text>

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
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="ornek@mail.com"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={handleReset}
        disabled={sending}
      >
        <Text style={styles.btnText}>
          {sending ? "GÖNDERİLİYOR..." : "BAĞLANTI GÖNDER"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.back, { color: colors.textMuted }]}>
          Giriş ekranına dön
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 8 },
  sub: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  btn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1,
  },
  back: { textAlign: "center", fontSize: 14, fontWeight: "600" },
});
