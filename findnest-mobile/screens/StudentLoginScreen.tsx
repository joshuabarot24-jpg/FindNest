import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import api from "../lib/api";
import { setAuth } from "../lib/auth";

export default function StudentLoginScreen({ navigation }: any) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<"login" | "otp">("login");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
      navigation.navigate("Home");
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <View style={styles.logoBox}>
          <Image source={require("../assets/icon.png")} style={styles.logo} />
        </View>

        {step === "login" ? (
          <>
            <Text style={styles.title}>Student Login</Text>
            <Text style={styles.subtitle}>Use your school credentials</Text>

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

            <TextInput
              style={[styles.input, error && !password.trim() && styles.inputError]}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError("");
              }}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Sign In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </>
        ) : (
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

            <TouchableOpacity onPress={() => { setStep("login"); setOtp(""); setOtpError(""); }}>
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#1a237e",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: "#1a237e",
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 14,
    color: "#374151",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 8,
    marginTop: 20,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
    backgroundColor: "#1a237e",
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
    color: "#1a237e",
    fontSize: 13,
    marginTop: 16,
    fontWeight: "700",
  },
});