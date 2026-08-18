import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../lib/api";
import { getAuth, setAuth, clearAuth } from "../lib/auth";

export default function ProfileScreen({ navigation }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        const user = response.data.user;
        setName(user.name || "");
        setCourse(user.course || "");
        setYearLevel(user.year_level || "");
        setSchoolId(user.school_id || "");
        setTrustScore(user.trust_score || 0);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditToggle = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setError("");
    setSaving(true);
    try {
      const response = await api.put("/profile", {
        name: name.trim(),
        school_id: schoolId.trim() || null,
        course: course.trim() || null,
        year_level: yearLevel.trim() || null,
      });
      const updatedUser = response.data.user;
      const { token } = await getAuth();
      if (token) {
        await setAuth(token, updatedUser);
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
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
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")} />
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.studentName}>{name}</Text>
          <Text style={styles.studentInfo}>{course} | {schoolId}</Text>

          <View style={styles.trustBox}>
            <View style={styles.trustRing}>
              <Text style={styles.trustScore}>{trustScore}</Text>
            </View>
            <Text style={styles.trustLabel}>TRUST SCORE</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student ID</Text>
            <Text style={styles.detailValue}>{schoolId}</Text>
          </View>
          <View style={styles.detailDivider} />

          {isEditing ? (
            <>
              <View style={styles.editFieldRow}>
                <Text style={styles.editFieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.editFieldRow}>
                <Text style={styles.editFieldLabel}>Course</Text>
                <TextInput
                  style={styles.editInput}
                  value={course}
                  onChangeText={setCourse}
                  placeholder="Course"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.editFieldRow}>
                <Text style={styles.editFieldLabel}>Year Level</Text>
                <TextInput
                  style={styles.editInput}
                  value={yearLevel}
                  onChangeText={setYearLevel}
                  placeholder="Year Level"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course</Text>
                <Text style={styles.detailValue}>{course}</Text>
              </View>
              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year Level</Text>
                <Text style={styles.detailValue}>{yearLevel}</Text>
              </View>
            </>
          )}

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValueGreen}>Active</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.editButton} onPress={handleEditToggle} disabled={saving}>
          <Text style={styles.editButtonText}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.navLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const NAVY = "#1a237e";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  topBarIcons: { flexDirection: "row", gap: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: NAVY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarInitial: { fontSize: 32, fontWeight: "900", color: "white" },
  studentName: { fontSize: 17, fontWeight: "900", color: NAVY, textAlign: "center" },
  studentInfo: { fontSize: 12, color: "#9ca3af", marginTop: 4, marginBottom: 16 },
  trustBox: { alignItems: "center" },
  trustRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  trustScore: { fontSize: 20, fontWeight: "900", color: "#16a34a" },
  trustLabel: { fontSize: 9, fontWeight: "800", color: "#9ca3af", marginTop: 6, letterSpacing: 1 },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#374151", marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  detailLabel: { fontSize: 12.5, color: "#9ca3af", fontWeight: "600" },
  detailValue: { fontSize: 12.5, color: "#374151", fontWeight: "700" },
  detailValueGreen: { fontSize: 12.5, color: "#16a34a", fontWeight: "800" },
  detailDivider: { height: 1, backgroundColor: "#f3f4f6" },
  editFieldRow: { paddingVertical: 8 },
  editFieldLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: "#f8f9fc",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#374151",
  },
  errorText: { color: "#ef4444", fontSize: 12, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  editButton: { backgroundColor: NAVY, borderRadius: 16, paddingVertical: 15, alignItems: "center", marginBottom: 10 },
  editButtonText: { color: "white", fontWeight: "800", fontSize: 14 },
  cancelButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: { color: "#9ca3af", fontWeight: "800", fontSize: 14 },
  logoutButton: { backgroundColor: "#f3f4f6", borderRadius: 16, paddingVertical: 15, alignItems: "center" },
  logoutButtonText: { color: "#6b7280", fontWeight: "800", fontSize: 14 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: { flex: 1, alignItems: "center" },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
});