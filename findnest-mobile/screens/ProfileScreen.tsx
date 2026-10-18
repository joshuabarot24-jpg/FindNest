import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import api from "../lib/api";
import { clearAuth } from "../lib/auth";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import StudentBottomNav from "../components/StudentBottomNav";

const GREEN = "#0E4D34";
const MINT = "#EAF5EF";

// Remembers the last loaded profile so the screen opens instantly
let cachedUser: any = null;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  school_id: string | null;
  course: string | null;
  year_level: string | null;
  trust_score: number;
  is_active?: boolean;
  password_change_requested: boolean;
  password_change_approved: boolean;
  password_change_reason: string | null;
  password_is_temporary?: boolean;
  profile_photo_url?: string | null;
}

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  const [reason, setReason] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      cachedUser = res.data.user;
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
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setSetPasswordError("Password must be 8+ characters with an uppercase letter, a lowercase letter, a number and a special character.");
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
      setPwOpen(false);
      Alert.alert("Password Updated", "Your new password is saved. Use it the next time you log in.");
      fetchProfile();
    } catch (err: any) {
      setSetPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSetPasswordLoading(false);
    }
  };

  const doLogout = async () => {
    cachedUser = null;
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      await clearAuth();
      navigation.reset({ index: 0, routes: [{ name: "Landing" }] });
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const uploadPhoto = async (uri: string) => {
    setPhotoBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", { uri, name: "profile.jpg", type: "image/jpeg" } as any);
      fd.append("folder", "profiles");
      fd.append("analyze", "false");
      const up = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await api.post("/profile/photo", { photo_url: up.data.url });
      await fetchProfile();
    } catch (err: any) {
      Alert.alert("Photo not saved", err.response?.data?.message || "Could not upload the photo. Please try again.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "Allow camera access to take a profile photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) uploadPhoto(result.assets[0].uri);
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      await api.delete("/profile/photo");
      await fetchProfile();
    } catch {
      Alert.alert("Error", "Could not remove the photo.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const changePhoto = () => {
    const options: any[] = [
      { text: "Take a photo", onPress: takePhoto },
      { text: "Choose from gallery", onPress: pickFromGallery },
    ];
    if (user?.profile_photo_url) options.push({ text: "Remove photo", style: "destructive", onPress: removePhoto });
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Profile photo", undefined, options);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    await doLogout();
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Home");
  };

  const classLine = [user?.year_level, user?.course].filter(Boolean).join(" ");
  const canSetPassword = !!(user?.password_is_temporary || user?.password_change_approved);

  const Row = ({ icon, label, value, last }: { icon: any; label: string; value: React.ReactNode; last?: boolean }) => (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Ionicons name={icon} size={20} color={GREEN} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueWrap}>{typeof value === "string" ? <Text style={styles.rowValue}>{value}</Text> : value}</View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const score = user?.trust_score ?? 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Student profile</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >
        {/* Hero card */}
        <LinearGradient colors={["#FFFFFF", "#BFEBDD"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hero}>
          <View style={styles.heroLeft}>
            <TouchableOpacity onPress={changePhoto} disabled={photoBusy} activeOpacity={0.85} style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {user?.profile_photo_url ? (
                  <Image source={{ uri: user.profile_photo_url }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase() || "?"}</Text>
                )}
                {photoBusy ? (
                  <View style={styles.avatarBusy}>
                    <ActivityIndicator color="white" />
                  </View>
                ) : null}
              </View>
              <View style={styles.camera}>
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>{user?.name}</Text>
              {classLine ? <Text style={styles.sub}>{classLine}</Text> : null}
              <Text style={styles.sub} numberOfLines={1}>ID: {user?.school_id || "—"}</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.credLabel}>Credibility score</Text>
            <Text style={styles.credValue}>{score}%</Text>
          </View>
        </LinearGradient>

        {/* Personal info */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person-outline" size={20} color="#1f2937" />
            <Text style={styles.cardTitle}>Student Personal Info</Text>
          </View>
          <Text style={styles.cardHelp}>Please contact the school admin to change personal details.</Text>
          <Row icon="person-outline" label="Full Name" value={user?.name || "—"} />
          <Row icon="mail-outline" label="Email" value={user?.email || "—"} />
          <Row icon="card-outline" label="School I.D" value={user?.school_id || "—"} />
          <Row icon="school-outline" label="Course/Strand" value={user?.course || "—"} />
          <Row icon="calendar-outline" label="Year/Grade Level" value={user?.year_level || "—"} last />
        </View>

        {/* Account details */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#1f2937" />
            <Text style={styles.cardTitle}>Account Details</Text>
          </View>
          <Text style={styles.cardHelp}>Manage your login information and account settings.</Text>
          <Row icon="person-outline" label="Student LRN" value={user?.school_id || "—"} />
          <Row icon="key-outline" label="Account Type" value="Student Account" />
          <Row
            icon="radio-button-on-outline"
            label="Account status"
            value={
              <Text style={[styles.rowValue, { color: user?.is_active === false ? "#6b7280" : "#10b981", fontWeight: "800" }]}>
                {user?.is_active === false ? "• Archived" : "• Active."}
              </Text>
            }
          />
          <Row
            icon="lock-closed-outline"
            label="Password"
            last
            value={
              <View style={styles.pwValue}>
                <Text style={styles.rowValue}>••••••••••</Text>
                <TouchableOpacity onPress={() => setPwOpen(true)} hitSlop={8}>
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#b91c1c" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Password popup */}
      <Modal visible={pwOpen} animationType="slide" transparent onRequestClose={() => setPwOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setPwOpen(false)}>
                <Text style={styles.modalCloseText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>{canSetPassword ? "Set New Password" : "Request Password Change"}</Text>
              <Text style={styles.cardHelp}>
                {user?.password_is_temporary
                  ? "You are using a temporary password. Set your own now."
                  : user?.password_change_approved
                  ? "Your request was approved. Set your new password below."
                  : "Passwords are changed by the Super Admin after your request is reviewed."}
              </Text>

              {canSetPassword ? (
                <>
                  <View style={styles.approvedNote}>
                    <Text style={styles.approvedNoteText}>
                      {user?.password_is_temporary
                        ? "Your account was created with a temporary password. Set one only you will know. After this, further changes need Super Admin approval."
                        : "Your Super Admin approved your request. Set a new password only you will know."}
                    </Text>
                  </View>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      style={[styles.input, { marginBottom: 0, paddingRight: 46 }]}
                      placeholder="8+ chars, A-Z, a-z, 0-9, symbol"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={50}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword((v) => !v)}>
                      <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.fieldLabel}>Confirm New Password</Text>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      style={[styles.input, { marginBottom: 0, paddingRight: 46 }]}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={50}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
                      <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  {setPasswordError ? <Text style={styles.errorText}>{setPasswordError}</Text> : null}
                  <TouchableOpacity style={styles.actionButton} onPress={handleSetNewPassword} disabled={setPasswordLoading}>
                    <Text style={styles.actionButtonText}>{setPasswordLoading ? "Saving..." : "Set New Password"}</Text>
                  </TouchableOpacity>
                </>
              ) : user?.password_change_requested ? (
                <View style={styles.pendingNote}>
                  <Text style={styles.pendingNoteTitle}>Request Pending</Text>
                  <Text style={styles.pendingNoteText}>
                    Your password change request is awaiting Super Admin approval.
                    {user?.password_change_reason ? `\n"${user.password_change_reason}"` : ""}
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
                  <TouchableOpacity style={styles.actionButton} onPress={handleRequestPasswordChange} disabled={requestLoading}>
                    <Text style={styles.actionButtonText}>{requestLoading ? "Sending..." : "Request Password Change"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <StudentBottomNav navigation={navigation} active="Profile" />
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        busy={loggingOut}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#6b8f7c", fontSize: 14 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E3EEE7" },
  backBtn: { width: 36, alignItems: "flex-start" },
  topTitle: { fontSize: 17, fontWeight: "900", color: "#1f2937" },

  scrollContent: { padding: 16, paddingBottom: 30, backgroundColor: MINT, flexGrow: 1 },

  hero: { borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderWidth: 1, borderColor: "#D5ECE2" },
  heroLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { width: 66, height: 66 },
  avatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitial: { color: "white", fontSize: 26, fontWeight: "900" },
  avatarBusy: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  camera: { position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#111", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white" },
  name: { fontSize: 15, fontWeight: "900", color: "#111827" },
  sub: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  heroRight: { alignItems: "flex-end", marginLeft: 8 },
  credLabel: { fontSize: 10.5, color: "#6b7280" },
  credValue: { fontSize: 26, fontWeight: "900", color: "#111827", marginTop: 2 },

  card: { backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: "#1f2937" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  cardHelp: { fontSize: 11, color: "#9ca3af", marginTop: 4, marginBottom: 8, lineHeight: 15 },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  rowIcon: { width: 28 },
  rowLabel: { fontSize: 13, fontWeight: "700", color: "#1f2937", width: 118 },
  rowValueWrap: { flex: 1, alignItems: "flex-end" },
  rowValue: { fontSize: 12.5, color: "#4b5563", textAlign: "right" },
  pwValue: { flexDirection: "row", alignItems: "center", gap: 10 },
  changeLink: { fontSize: 12.5, fontWeight: "800", color: "#10b981" },

  fieldLabel: { fontSize: 11.5, fontWeight: "800", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#F3FAF6", borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#374151", marginBottom: 14 },
  passwordWrap: { marginBottom: 14, justifyContent: "center" },
  eyeButton: { position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center", paddingHorizontal: 4 },
  textArea: { backgroundColor: "#F3FAF6", borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 12, padding: 14, fontSize: 13, color: "#374151", minHeight: 80, marginBottom: 12 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  successText: { color: "#16a34a", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  actionButton: { backgroundColor: GREEN, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "800", fontSize: 13.5 },
  pendingNote: { backgroundColor: "#fefce8", borderRadius: 14, padding: 16, alignItems: "center" },
  pendingNoteTitle: { color: "#a16207", fontWeight: "800", fontSize: 13, marginBottom: 4 },
  pendingNoteText: { color: "#ca8a04", fontSize: 11.5, textAlign: "center", lineHeight: 16, fontStyle: "italic" },
  approvedNote: { backgroundColor: "#E3EEE7", borderRadius: 12, padding: 12, marginBottom: 14 },
  approvedNoteText: { color: "#1E3F2E", fontSize: 11, lineHeight: 15 },

  logoutButton: { flexDirection: "row", backgroundColor: "#FDECEC", borderRadius: 999, paddingVertical: 15, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#b91c1c" },
  logoutButtonText: { color: "#b91c1c", fontWeight: "900", fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", justifyContent: "flex-end", paddingTop: 60 },
  modalScroll: { justifyContent: "flex-end", flexGrow: 1 },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 34, paddingBottom: 36 },
  modalClose: { position: "absolute", top: 14, right: 18, zIndex: 10, padding: 6 },
  modalCloseText: { fontSize: 24, color: "#9ca3af", fontWeight: "700" },
});