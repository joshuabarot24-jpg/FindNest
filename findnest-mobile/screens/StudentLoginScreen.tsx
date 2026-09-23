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

const NAVY = "#1a237e";

export default function StudentLoginScreen({ navigation }: any) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const restoreDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem("findnest_login_draft");
        if (draft) {
          const { studentId: savedId, password: savedPw } = JSON.parse(draft);
          if (savedId) setStudentId(savedId);
          if (savedPw) setPassword(savedPw);
        }
      } catch (err) {
        console.error("Failed to restore login draft:", err);
      }
    };
    restoreDraft();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("findnest_login_draft", JSON.stringify({ studentId, password })).catch(() => {});
  }, [studentId, password]);

  const clearLoginDraft = () => {
    AsyncStorage.removeItem("findnest_login_draft").catch(() => {});
  };

  const [step, setStep] = useState<"login" | "otp" | "forgot" | "reset">("login");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

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
      setError(err.response?.data?.message || "Invalid credentials");
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
      setOtpError(err.response?.data?.message || "Invalid OTP code");
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
      setStep("reset");
    } catch (err: any) {
      setForgotError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    setResetError("");
    if (!resetToken.trim()) {
      setResetError("Please enter the reset code from your email");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: forgotEmail.trim(),
        token: resetToken.trim(),
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.response?.data?.message || "Failed to reset password. The code may be invalid or expired.");
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setStep("login");
    setForgotEmail("");
    setForgotError("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess(false);
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

          <View style={styles.logoBox}>
            <Image source={require("../assets/icon.png")} style={styles.logo} />
          </View>

          {step === "login" && (
            <>
              <Text style={styles.title}>Student Login</Text>
              <Text style={styles.subtitle}>Use your school credentials</Text>

              <View style={styles.inputWrap}>
                <Ionicons name="school-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, error && !studentId.trim() && styles.inputError]}
                  placeholder="Student ID"
                  placeholderTextColor="#9ca3af"
                  value={studentId}
                  onChangeText={(text) => {
                    setStudentId(text);
                    if (error) setError("");
                  }}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, error && !password.trim() && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError("");
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Sign In"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("forgot")}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to</Text>
              <Text style={styles.emailText}>{maskedEmail}</Text>

              <TextInput
                style={[styles.input, styles.otpInput, otpError && styles.inputError]}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
                  if (otpError) setOtpError("");
                }}
                keyboardType="number-pad"
                maxLength={6}
              />

              {otpError && <Text style={styles.errorText}>{otpError}</Text>}

              <TouchableOpacity
                style={[styles.button, otpLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                <Text style={styles.buttonText}>{otpLoading ? "Verifying..." : "Verify OTP"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0}>
                <Text style={[styles.forgotText, resendTimer > 0 && styles.forgotTextDisabled]}>
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={backToLogin}>
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "forgot" && (
            <>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>Enter your registered email to receive a reset code</Text>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  value={forgotEmail}
                  onChangeText={(text) => {
                    setForgotEmail(text);
                    if (forgotError) setForgotError("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {forgotError && <Text style={styles.errorText}>{forgotError}</Text>}

              <TouchableOpacity
                style={[styles.button, forgotLoading && styles.buttonDisabled]}
                onPress={handleForgotSubmit}
                disabled={forgotLoading}
              >
                <Text style={styles.buttonText}>{forgotLoading ? "Sending..." : "Send Reset Code"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={backToLogin}>
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "reset" && (
            resetSuccess ? (
              <>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
                </View>
                <Text style={styles.title}>Password Reset!</Text>
                <Text style={styles.subtitle}>You can now log in with your new password</Text>

                <TouchableOpacity style={styles.button} onPress={backToLogin}>
                  <Text style={styles.buttonText}>Go to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Enter Reset Code</Text>
                <Text style={styles.subtitle}>Check your email for the reset code, then set a new password</Text>

                <View style={styles.inputWrap}>
                  <Ionicons name="key-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Paste the reset code from your email"
                    placeholderTextColor="#9ca3af"
                    value={resetToken}
                    onChangeText={setResetToken}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                {resetError && <Text style={styles.errorText}>{resetError}</Text>}

                <TouchableOpacity
                  style={[styles.button, resetLoading && styles.buttonDisabled]}
                  onPress={handleResetSubmit}
                  disabled={resetLoading}
                >
                  <Text style={styles.buttonText}>{resetLoading ? "Resetting..." : "Reset Password"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={backToLogin}>
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 20,
    textAlign: "center",
  },
  emailText: {
    fontSize: 13,
    color: NAVY,
    fontWeight: "700",
    marginBottom: 24,
  },
  successIconBox: {
    marginBottom: 8,
  },
  inputWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  eyeButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: "#374151",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 8,
    marginTop: 8,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    width: "100%",
    color: "#ef4444",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: -4,
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  forgotText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 16,
    fontWeight: "600",
  },
  forgotTextDisabled: {
    opacity: 0.5,
  },
  backText: {
    color: NAVY,
    fontSize: 13,
    marginTop: 16,
    fontWeight: "700",
  },
});