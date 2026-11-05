import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";

const GREEN = "#0D5C3A";

const RULES = [
  { label: "At least 8 characters", ok: (p: string) => p.length >= 8 },
  { label: "An uppercase letter", ok: (p: string) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", ok: (p: string) => /[a-z]/.test(p) },
  { label: "A number", ok: (p: string) => /[0-9]/.test(p) },
  { label: "A symbol", ok: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ForcePasswordScreen({ navigation }: any) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // The hardware back button cannot leave this screen
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const allOk = RULES.every((r) => r.ok(pw));

  async function submit() {
    if (busy) return;
    if (!allOk) return setError("Your password does not meet all the rules below.");
    if (pw !== confirm) return setError("The two passwords do not match.");
    setError("");
    setBusy(true);
    try {
      await api.post("/profile/set-new-password", { new_password: pw, new_password_confirmation: confirm });
      setSuccess(true);
      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: "Home" }] }), 1800);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(" ") ||
          "Could not change the password. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Action Required: Temporary Password Detected</Text>
          </View>
          <View style={styles.body}>
            {success ? (
              <View style={{ alignItems: "center", paddingVertical: 30 }}>
                <Text style={styles.successTitle}>Password updated successfully!</Text>
                <Text style={styles.sub}>Welcome to FindNest.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sub}>
                  You are logged in with a temporary password (new account or recent reset). For your security, create a new permanent password before using the system.
                </Text>

                <Text style={styles.label}>NEW PASSWORD</Text>
                <View>
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={pw}
                    onChangeText={setPw}
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={styles.eye} onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                    <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {RULES.map((r) => (
                  <Text key={r.label} style={[styles.rule, r.ok(pw) && styles.ruleOk]}>
                    {r.ok(pw) ? "✓" : "○"} {r.label}
                  </Text>
                ))}

                <Text style={[styles.label, { marginTop: 14 }]}>CONFIRM NEW PASSWORD</Text>
                <View>
                  <TextInput
                    style={[styles.input, { paddingRight: 44 }]}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={submit}
                  />
                  <TouchableOpacity style={styles.eye} onPress={() => setShowConfirm((s) => !s)} hitSlop={8}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={[styles.btn, busy && { opacity: 0.5 }]} onPress={submit} disabled={busy} activeOpacity={0.85}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Set New Password</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F8F5" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#E2EFE9" },
  header: { backgroundColor: GREEN, paddingHorizontal: 20, paddingVertical: 14 },
  headerText: { color: "white", fontWeight: "900", fontSize: 13 },
  body: { padding: 20 },
  sub: { color: "#6b7280", fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "800", color: "#6b7280", marginBottom: 6 },
  input: { borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1f2937" },
  rule: { fontSize: 12, fontWeight: "600", color: "#9ca3af", marginTop: 4 },
  ruleOk: { color: "#16a34a" },
  eye: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  error: { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1, color: "#B91C1C", fontSize: 12, fontWeight: "600", borderRadius: 10, padding: 10, marginTop: 14 },
  btn: { backgroundColor: "#DC2626", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  btnText: { color: "white", fontWeight: "800", fontSize: 15 },
  successTitle: { color: GREEN, fontWeight: "900", fontSize: 17, marginBottom: 4 },
});