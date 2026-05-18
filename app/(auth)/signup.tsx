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

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>ARCADE</Text>
            <Text style={styles.logoSub}>ZONE</Text>
          </View>

          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            Katıl, oyna ve lider tablosuna gir!
          </Text>

          {/* Kullanıcı Adı */}
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="ArcadeKing"
              placeholderTextColor="#4B5563"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

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
              placeholder="En az 6 karakter"
              placeholderTextColor="#4B5563"
              secureTextEntry
            />
          </View>

          {/* Kayıt Butonu */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnPrimaryText}>HESAP OLUŞTUR</Text>
            )}
          </TouchableOpacity>

          {/* Giriş yap linki */}
          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{" "}
              <Text style={styles.linkAccent}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    padding: 24,
    justifyContent: "center",
    flexGrow: 1,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 32,
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
    backgroundColor: "#A855F7",
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
    color: "#EC4899",
    fontWeight: "700",
  },
});
