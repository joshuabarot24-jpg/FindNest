import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";
import { clearAuth } from "../lib/auth";

const NAVY = "#1a237e";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  school_id: string | null;
  course: string | null;
  year_level: string | null;
  trust_score: number;
  password_change_requested: boolean;
  password_change_approved: boolean;
  password_change_reason: string | null;
  password_is_temporary?: boolean;
}

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestPasswordChange = async () => {
    if (!reason.trim()) {
      setRequestError("Please tell us why you need a password change.");
      return;
    }
    setRequestError("");
    setRequestSuccess("");
    setRequestLoading(true);
    try {
      await api.post("/profile/request-password-change", { reason: reason.trim() });
      setRequestSuccess("Your request has been sent to the Super Admin.");
      setReason("");
      fetchProfile();
    } catch (err: any) {
      setRequestError(err.response?.data?.message || "Failed to send request.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setSetPasswordError("Please fill in both fields.");
      return;
    }
    if (newPassword.length < 8) {
      setSetPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetPasswordError("Passwords do not match.");
      return;
    }
    setSetPasswordError("");
    setSetPasswordLoading(true);
    try {
      await api.post("/profile/set-new-password", {
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password Updated", "Your new password is saved. Use it the next time you log in.");
      fetchProfile();
    } catch (err: any) {
      setSetPasswordError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSetPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      await clearAuth();
      navigation.reset({ index: 0, routes: [{ name: "Landing" }] });
    }
  };

  function trustScoreColor(score: number) {
    if (score >= 70) return "#16a34a";
    if (score >= 40) return "#ca8a04";
    return "#dc2626";
  }

  function trustScoreBg(score: number) {
    if (score >= 70) return "#f0fdf4";
    if (score >= 40) return "#fefce8";
    return "#fef2f2";
  }

  function trustScoreLabel(score: number) {
    if (score >= 70) return "Good Standing";
    if (score >= 40) return "Moderate";
    return "Restricted";
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.studentName}>{user?.name}</Text>
          <Text style={styles.studentInfo}>{user?.email}</Text>

          <View style={[styles.trustBox, { backgroundColor: trustScoreBg(user?.trust_score ?? 100) }]}>
            <Text style={[styles.trustScore, { color: trustScoreColor(user?.trust_score ?? 100) }]}>
              {user?.trust_score ?? 100}
            </Text>
            <Text style={[styles.trustLabel, { color: trustScoreColor(user?.trust_score ?? 100) }]}>
              {trustScoreLabel(user?.trust_score ?? 100)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>Managed by the school — contact the Guidance Office to request changes</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>{user?.name}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>School ID</Text>
            <Text style={styles.detailValue}>{user?.school_id || "—"}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Course</Text>
            <Text style={styles.detailValue}>{user?.course || "—"}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year Level</Text>
            <Text style={styles.detailValue}>{user?.year_level || "—"}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Password</Text>
          <Text style={styles.sectionSubtitle}>
              {user?.password_is_temporary
              ? "You are using a temporary password — set your own now"
              : user?.password_change_approved
              ? "Your request was approved — set your new password below"
              : "Passwords are changed by the Super Admin after your request is reviewed"}
          </Text>

            {user?.password_is_temporary || user?.password_change_approved ? (
            <>
              <View style={styles.approvedNote}>
                <Text style={styles.approvedNoteText}>
                  {user?.password_is_temporary
                    ? "Your account was created with a temporary password. Set one only you will know. After this, further changes need Super Admin approval."
                    : "Your Super Admin approved your request. Set a new password only you will know."}
                </Text>
              </View>
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {setPasswordError ? <Text style={styles.errorText}>{setPasswordError}</Text> : null}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSetNewPassword}
                disabled={setPasswordLoading}
              >
                <Text style={styles.actionButtonText}>{setPasswordLoading ? "Saving..." : "Set New Password"}</Text>
              </TouchableOpacity>
            </>
          ) : user?.password_change_requested ? (
            <View style={styles.pendingNote}>
              <Text style={styles.pendingNoteTitle}>Request Pending</Text>
              <Text style={styles.pendingNoteText}>
                Your password change request is awaiting Super Admin approval.
                {user.password_change_reason ? `\n"${user.password_change_reason}"` : ""}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Why do you need a password change?</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. I forgot my password, or want to update it for security"
                placeholderTextColor="#9ca3af"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {requestError ? <Text style={styles.errorText}>{requestError}</Text> : null}
              {requestSuccess ? <Text style={styles.successText}>{requestSuccess}</Text> : null}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRequestPasswordChange}
                disabled={requestLoading}
              >
                <Text style={styles.actionButtonText}>{requestLoading ? "Sending..." : "Request Password Change"}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#dc2626" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Ionicons name="document-text-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  profileCard: { backgroundColor: "white", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#f0f0f0" },
  avatarBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: NAVY, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarInitial: { fontSize: 28, fontWeight: "900", color: "white" },
  studentName: { fontSize: 16, fontWeight: "900", color: NAVY, textAlign: "center" },
  studentInfo: { fontSize: 12, color: "#9ca3af", marginTop: 4, marginBottom: 14 },
  trustBox: { borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, alignItems: "center" },
  trustScore: { fontSize: 20, fontWeight: "900" },
  trustLabel: { fontSize: 10, fontWeight: "800", marginTop: 2 },
  sectionCard: { backgroundColor: "white", borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#f0f0f0" },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#374151" },
  sectionSubtitle: { fontSize: 11, color: "#9ca3af", marginTop: 3, marginBottom: 14, lineHeight: 15 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  detailLabel: { fontSize: 12.5, color: "#9ca3af", fontWeight: "600" },
  detailValue: { fontSize: 12.5, color: "#374151", fontWeight: "700" },
  detailDivider: { height: 1, backgroundColor: "#f3f4f6" },
  fieldLabel: { fontSize: 11.5, fontWeight: "800", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#374151", marginBottom: 14 },
  textArea: { backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 13, color: "#374151", minHeight: 80, marginBottom: 12 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  successText: { color: "#16a34a", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  actionButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "800", fontSize: 13.5 },
  pendingNote: { backgroundColor: "#fefce8", borderRadius: 14, padding: 16, alignItems: "center" },
  pendingNoteTitle: { color: "#a16207", fontWeight: "800", fontSize: 13, marginBottom: 4 },
  pendingNoteText: { color: "#ca8a04", fontSize: 11.5, textAlign: "center", lineHeight: 16, fontStyle: "italic" },
  approvedNote: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 14 },
  approvedNoteText: { color: "#15803d", fontSize: 11, lineHeight: 15 },
  logoutButton: { flexDirection: "row", backgroundColor: "#fef2f2", borderRadius: 16, paddingVertical: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fecaca" },
  logoutButtonText: { color: "#dc2626", fontWeight: "800", fontSize: 14 },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
});