import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";

const GREEN = "#0F4C3A";
const RULES = [
  { label: "At least 8 characters", ok: (p: string) => p.length >= 8 },
  { label: "An uppercase letter", ok: (p: string) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", ok: (p: string) => /[a-z]/.test(p) },
  { label: "A number", ok: (p: string) => /[0-9]/.test(p) },
  { label: "A symbol", ok: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[styles.input, { paddingRight: 44 }]}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={50}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setShow((s) => !s)} hitSlop={8}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordForm({ onDone }: { onDone: (message: string) => void }) {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode() {
    if (cooldown > 0) return;
    setError("");
    try {
      await api.post("/profile/send-password-otp");
      setCodeSent(true);
      setCooldown(60);
    } catch (err: any) {
      if (err.response?.status === 429) setCooldown(Math.ceil(err.response.data?.retry_after || 60));
      setError(err.response?.data?.message || "Could not send the code. Please try again.");
    }
  }

  async function submit() {
    if (busy) return;
    if (!current) return setError("Enter your current password.");
    if (!RULES.every((r) => r.ok(pw))) return setError("Your new password does not meet all the rules.");
    if (pw !== confirm) return setError("The two new passwords do not match.");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit verification code sent to your Gmail address.");
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/profile/change-password", {
        current_password: current,
        new_password: pw,
        new_password_confirmation: confirm,
        otp_code: code,
      });
      setCurrent(""); setPw(""); setConfirm(""); setCode(""); setCodeSent(false); setCooldown(0);
      onDone(res.data?.message || "Password updated successfully.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(" ") ||
          "Could not update the password. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <PwField label="Current Password" value={current} onChange={setCurrent} />
      <PwField label="New Password" value={pw} onChange={setPw} />
      {RULES.map((r) => (
        <Text key={r.label} style={[styles.rule, r.ok(pw) && { color: "#16a34a" }]}>
          {r.ok(pw) ? "✓" : "○"} {r.label}
        </Text>
      ))}
      <View style={{ height: 12 }} />
      <PwField label="Confirm New Password" value={confirm} onChange={setConfirm} />

      <Text style={styles.label}>Email Verification Code</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1, letterSpacing: 8, textAlign: "center", fontWeight: "800", fontSize: 18 }]}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#cbd5e1"
        />
        <TouchableOpacity onPress={sendCode} disabled={cooldown > 0} style={[styles.sendBtn, cooldown > 0 && { opacity: 0.5 }]}>
          <Text style={styles.sendBtnText}>{cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Resend Code" : "Send Code"}</Text>
        </TouchableOpacity>
      </View>
      {codeSent ? <Text style={styles.note}>A 6-digit verification code has been sent to your registered Gmail address.</Text> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={[styles.btn, busy && { opacity: 0.5 }]} onPress={submit} disabled={busy} activeOpacity={0.85}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "800", color: "#6b7280", marginBottom: 6 },
  input: { borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1f2937" },
  eye: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  rule: { fontSize: 12, fontWeight: "600", color: "#9ca3af", marginTop: 3 },
  sendBtn: { borderWidth: 2, borderColor: GREEN, borderRadius: 12, paddingHorizontal: 10, justifyContent: "center", maxWidth: 120 },
  sendBtnText: { color: GREEN, fontWeight: "800", fontSize: 11, textAlign: "center" },
  note: { color: "#16a34a", fontSize: 12, fontWeight: "600", marginTop: 8 },
  error: { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1, color: "#B91C1C", fontSize: 12, fontWeight: "600", borderRadius: 10, padding: 10, marginTop: 14 },
  btn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  btnText: { color: "white", fontWeight: "800", fontSize: 15 },
});