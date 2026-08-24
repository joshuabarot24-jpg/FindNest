import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { getAuth } from "../lib/auth";

const subjects = [
  "Account Recovery",
  "Account Help",
  "Report a Problem",
  "Claim Dispute",
  "Lost Item Inquiry",
  "Found Item Inquiry",
  "General Feedback",
];

const NAVY = "#1a237e";

export default function SupportScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Account Recovery");
  const [message, setMessage] = useState("");
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getAuth();
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/support", {
        name: name.trim(),
        email: email.trim(),
        message: `[${subject}] ${message.trim()}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:findnest@sjdmcci.edu.ph");
  };

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {submitted ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={40} color="#22c55e" style={{ marginBottom: 10 }} />
            <Text style={styles.successTitle}>Ticket Submitted!</Text>
            <Text style={styles.successMessage}>Our team will get back to you shortly.</Text>
            <TouchableOpacity style={styles.successButton} onPress={() => { setSubmitted(false); setMessage(""); }}>
              <Text style={styles.successButtonText}>Submit Another Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Support & Feedback</Text>
            <Text style={styles.pageSubtitle}>Contact an admin for account help or feedback.</Text>

            <Text style={styles.label}>Subject</Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowSubjectPicker(true)}>
              <Text style={styles.selectText}>{subject}</Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="How can we help you?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, (!message.trim() || loading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!message.trim() || loading}
            >
              <Text style={styles.submitButtonText}>{loading ? "Sending..." : "Submit Ticket"}</Text>
            </TouchableOpacity>

            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>Contact Information</Text>

              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactLabel}>Guidance Counselor</Text>
                  <Text style={styles.contactValue}>Ms. Shelly S. Durban</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.contactRow} onPress={handleEmailPress}>
                <Ionicons name="mail-outline" size={18} color={NAVY} style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValueLink}>findnest@sjdmcci.edu.ph</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.contactRow}>
                <Ionicons name="time-outline" size={18} color="#9ca3af" style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactLabel}>Office Hours</Text>
                  <Text style={styles.contactValue}>Mon-Fri, 8AM - 5PM</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={showSubjectPicker} animationType="slide" transparent onRequestClose={() => setShowSubjectPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSubjectPicker(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Subject</Text>
            {subjects.map((item) => (
              <TouchableOpacity key={item} style={styles.subjectOption} onPress={() => { setSubject(item); setShowSubjectPicker(false); }}>
                <Text style={[styles.subjectOptionText, subject === item && styles.subjectOptionTextActive]}>{item}</Text>
                {subject === item && <Ionicons name="checkmark" size={18} color={NAVY} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Ionicons name="search-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Ionicons name="document-text-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY, marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: "#9ca3af", marginBottom: 22 },
  label: { fontSize: 12.5, fontWeight: "800", color: "#374151", marginBottom: 8 },
  selectBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 18 },
  selectText: { fontSize: 13.5, color: "#374151", fontWeight: "600" },
  textArea: { backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, padding: 16, fontSize: 13.5, color: "#374151", minHeight: 130, marginBottom: 18 },
  errorText: { color: "#ef4444", fontSize: 12, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  submitButton: { backgroundColor: NAVY, borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 24 },
  submitButtonDisabled: { backgroundColor: "#c7d2fe" },
  submitButtonText: { color: "white", fontWeight: "900", fontSize: 15 },
  contactCard: { backgroundColor: "white", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#f0f0f0" },
  contactTitle: { fontSize: 14, fontWeight: "900", color: "#374151", marginBottom: 14 },
  contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  contactIcon: { marginRight: 12, marginTop: 2 },
  contactLabel: { fontSize: 11.5, color: "#9ca3af", fontWeight: "700" },
  contactValue: { fontSize: 13, color: "#374151", fontWeight: "700", marginTop: 2 },
  contactValueLink: { fontSize: 13, color: NAVY, fontWeight: "800", marginTop: 2, textDecorationLine: "underline" },
  successCard: { backgroundColor: "white", borderRadius: 20, padding: 32, alignItems: "center", marginTop: 60 },
  successTitle: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 6 },
  successMessage: { fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 20 },
  successButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24 },
  successButtonText: { color: "white", fontWeight: "800", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.6)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: "900", color: NAVY, textAlign: "center", marginBottom: 16 },
  subjectOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  subjectOptionText: { fontSize: 14, color: "#374151", fontWeight: "600" },
  subjectOptionTextActive: { color: NAVY, fontWeight: "800" },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});