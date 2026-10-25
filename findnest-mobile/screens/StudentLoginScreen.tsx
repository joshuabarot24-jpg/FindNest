import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";
import { setAuth } from "../lib/auth";
import { loginErrorMessage } from "../lib/loginError";

const GREEN = "#0F4C3A";
const MINT = "#F2FAF5";
const OUTLINE = "#CFE6D8";

export default function StudentLoginScreen({ navigation }: any) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Restore the saved login only if "Remember me" was ticked last time
  useEffect(() => {
    const restoreDraft = async () => {
      try {
        const remembered = await AsyncStorage.getItem("findnest_remember_me");
        if (remembered !== "true") return;
        setRememberMe(true);
        const draft = await AsyncStorage.getItem("findnest_login_draft");
        if (draft) {
          const { studentId: savedId, password: savedPw } = JSON.parse(draft);
          if (savedId) setStudentId(savedId);
          if (savedPw) setPassword(savedPw);
        }
      } catch (err) {
        console.error("Failed to restore login draft:", err);
      } finally {
        setDraftLoaded(true);
      }
    };
    restoreDraft();
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    if (rememberMe) {
      AsyncStorage.setItem("findnest_remember_me", "true").catch(() => {});
      AsyncStorage.setItem("findnest_login_draft", JSON.stringify({ studentId, password })).catch(() => {});
    } else {
      AsyncStorage.removeItem("findnest_remember_me").catch(() => {});
      AsyncStorage.removeItem("findnest_login_draft").catch(() => {});
    }
  }, [studentId, password, rememberMe, draftLoaded]);

  const [step, setStep] = useState<"login" | "otp" | "forgot">("login");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      setError("Please enter your Student ID and Password!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/student/login", {
        school_id: studentId.trim(),
        password: password,
      });
      setMaskedEmail(response.data.email);
      setStep("otp");
      startResendTimer();
    } catch (err: any) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const response = await api.post("/auth/student/verify-otp", {
        school_id: studentId.trim(),
        otp: otp,
      });
      await setAuth(response.data.token, response.data.user);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err: any) {
      setOtpError(loginErrorMessage(err, "Invalid OTP code"));
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post("/auth/student/resend-otp", { school_id: studentId.trim() });
      startResendTimer();
      setOtp("");
      setOtpError("");
    } catch (err: any) {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail.trim() });
      setResetEmailSent(true);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const backToLogin = () => {
    setStep("login");
    setResetEmailSent(false);
    setForgotEmail("");
    setForgotError("");
    setOtp("");
    setOtpError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >

        <View style={styles.card}>
          <Image source={require("../assets/findnest-logo.png")} style={styles.logo} />
          <Text style={styles.brand}>FindNest</Text>
          <Text style={styles.tagline}>Lost and found with AI Matching</Text>

          {step === "login" && (
            <>
              <View style={[styles.pill, error && !studentId.trim() && styles.pillError]}>
                <Ionicons name="person-outline" size={20} color={GREEN} style={styles.pillIcon} />
                <TextInput
                  style={styles.pillInput}
                  placeholder="Student ID/ Email"
                  placeholderTextColor={GREEN}
                  value={studentId}
                  editable={!loading}
                  onChangeText={(text) => {
                    setStudentId(text);
                    if (error) setError("");
                  }}
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.pill, error && !password.trim() && styles.pillError]}>
                <Ionicons name="lock-closed-outline" size={20} color={GREEN} style={styles.pillIcon} />
                <TextInput
                  style={styles.pillInput}
                  placeholder="Password"
                  placeholderTextColor={GREEN}
                  secureTextEntry={!showPassword}
                  value={password}
                  editable={!loading}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError("");
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={GREEN} />
                </TouchableOpacity>
              </View>

              <View style={styles.utilityRow}>
                <TouchableOpacity
                  style={styles.rememberWrap}
                  activeOpacity={0.8}
                  onPress={() => !loading && setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={styles.utilityText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep("forgot")} disabled={loading}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.cta, loading && styles.ctaDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={styles.ctaText}>{loading ? "Sending OTP..." : "Log In"}</Text>
                {!loading && <Ionicons name="chevron-forward" size={18} color="white" />}
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to</Text>
              <Text style={styles.emailText}>{maskedEmail}</Text>

              <View style={[styles.pill, otpError && styles.pillError]}>
                <TextInput
                  style={[styles.pillInput, styles.otpInput]}
                  placeholder="000000"
                  placeholderTextColor="#9ca3af"
                  value={otp}
                  editable={!otpLoading}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
                    if (otpError) setOtpError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

              <TouchableOpacity
                style={[styles.cta, otpLoading && styles.ctaDisabled]}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
                activeOpacity={0.9}
              >
                <Text style={styles.ctaText}>{otpLoading ? "Verifying..." : "Verify OTP"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0}>
                <Text style={[styles.linkText, resendTimer > 0 && styles.linkDisabled]}>
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={backToLogin}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "forgot" &&
            (resetEmailSent ? (
              <>
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.subtitle}>
                  We sent a reset link to {forgotEmail.trim()}. Open the email and tap the link to set your new password. The link expires in 60 minutes.
                </Text>

                <TouchableOpacity style={styles.cta} onPress={backToLogin} activeOpacity={0.9}>
                  <Text style={styles.ctaText}>Back to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setResetEmailSent(false)}>
                  <Text style={styles.linkText}>Didn&apos;t get it? Send again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>Enter your registered email to receive a reset link</Text>

                <View style={styles.pill}>
                  <Ionicons name="mail-outline" size={20} color={GREEN} style={styles.pillIcon} />
                  <TextInput
                    style={styles.pillInput}
                    placeholder="your@email.com"
                    placeholderTextColor={GREEN}
                    value={forgotEmail}
                    editable={!forgotLoading}
                    onChangeText={(text) => {
                      setForgotEmail(text);
                      if (forgotError) setForgotError("");
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {forgotError ? <Text style={styles.errorText}>{forgotError}</Text> : null}

                <TouchableOpacity
                  style={[styles.cta, forgotLoading && styles.ctaDisabled]}
                  onPress={handleForgotSubmit}
                  disabled={forgotLoading}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ctaText}>{forgotLoading ? "Sending..." : "Send Reset Link"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={backToLogin}>
                  <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            ))}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MINT },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  card: {
    backgroundColor: MINT,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: "100%",
    alignItems: "center",
  },
  logo: { width: 96, height: 96, resizeMode: "contain", marginBottom: 6 },
  brand: { fontFamily: "Montserrat_800ExtraBold", fontSize: 26, color: "#0B4F2C", letterSpacing: 0.5 },
  tagline: { fontSize: 11, color: "#4B6358", marginTop: 2, marginBottom: 26 },
  title: { fontSize: 22, fontWeight: "900", color: GREEN, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 13, color: "#4B6358", marginBottom: 18, textAlign: "center", lineHeight: 19 },
  emailText: { fontSize: 13, color: GREEN, fontWeight: "700", marginBottom: 18 },
  pill: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: 999,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  pillError: { borderColor: "#ef4444" },
  pillIcon: { marginRight: 10 },
  pillInput: { flex: 1, paddingVertical: 15, fontSize: 14, color: GREEN },
  otpInput: { textAlign: "center", fontSize: 22, fontWeight: "900", letterSpacing: 8 },
  eyeButton: { padding: 4 },
  utilityRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 18,
  },
  rememberWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: GREEN },
  utilityText: { color: "#6b7280", fontSize: 13, fontWeight: "500" },
  forgotText: { color: GREEN, fontSize: 13, fontWeight: "800" },
  errorText: {
    width: "100%",
    color: "#ef4444",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  cta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 16,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "white", fontWeight: "800", fontSize: 16 },
  linkText: { color: GREEN, fontSize: 13, marginTop: 16, fontWeight: "700" },
  linkDisabled: { opacity: 0.5 },
});