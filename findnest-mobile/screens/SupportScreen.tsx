import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
} from "react-native";

const subjects = [
  "Account Recovery",
  "Account Help",
  "Report a Problem",
  "Claim Dispute",
  "Lost Item Inquiry",
  "Found Item Inquiry",
  "General Feedback",
];

export default function SupportScreen({ navigation }: any) {
  const [subject, setSubject] = useState("Account Recovery");
  const [message, setMessage] = useState("");
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message) return;
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Bar */}
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
            <View style={styles.successIconBox}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Ticket Submitted!</Text>
            <Text style={styles.successMessage}>
              Our team will get back to you shortly.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => { setSubmitted(false); setMessage(""); }}
            >
              <Text style={styles.successButtonText}>Submit Another Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Support & Feedback</Text>
            <Text style={styles.pageSubtitle}>
              Contact an admin for account help or feedback.
            </Text>

            {/* Subject Picker */}
            <Text style={styles.label}>Subject</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowSubjectPicker(true)}
            >
              <Text style={styles.selectText}>{subject}</Text>
              <Text style={styles.selectArrow}>⌄</Text>
            </TouchableOpacity>

            {/* Message */}
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, !message && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!message}
            >
              <Text style={styles.submitButtonText}>Submit Ticket</Text>
            </TouchableOpacity>

            {/* Contact Info Card */}
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>Contact Information</Text>

              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>👤</Text>
                <View>
                  <Text style={styles.contactLabel}>Guidance Counselor</Text>
                  <Text style={styles.contactValue}>Ms. Shelly S. Durban</Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📧</Text>
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>findnest@sjdmcci.edu.ph</Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>🕐</Text>
                <View>
                  <Text style={styles.contactLabel}>Office Hours</Text>
                  <Text style={styles.contactValue}>Mon-Fri, 8AM - 5PM</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Subject Picker Modal */}
      <Modal
        visible={showSubjectPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSubjectPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectPicker(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Subject</Text>
            {subjects.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.subjectOption}
                onPress={() => {
                  setSubject(item);
                  setShowSubjectPicker(false);
                }}
              >
                <Text style={[
                  styles.subjectOptionText,
                  subject === item && styles.subjectOptionTextActive
                ]}>
                  {item}
                </Text>
                {subject === item && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const NAVY = "#1a237e";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 35,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoSmall: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  brandText: {
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
  },
  brandAccent: {
    color: "#c99700",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: "#9ca3af",
    marginBottom: 22,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  selectText: {
    fontSize: 13.5,
    color: "#374151",
    fontWeight: "600",
  },
  selectArrow: {
    fontSize: 18,
    color: "#9ca3af",
  },
  textArea: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    fontSize: 13.5,
    color: "#374151",
    minHeight: 130,
    marginBottom: 18,
  },
  submitButton: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#c7d2fe",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#374151",
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  contactIcon: {
    fontSize: 18,
  },
  contactLabel: {
    fontSize: 11.5,
    color: "#9ca3af",
    fontWeight: "700",
  },
  contactValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "700",
    marginTop: 2,
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 60,
  },
  successIconBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 30,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
  },
  successButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  successButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,19,63,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
    textAlign: "center",
    marginBottom: 16,
  },
  subjectOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  subjectOptionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  subjectOptionTextActive: {
    color: NAVY,
    fontWeight: "800",
  },
  checkMark: {
    fontSize: 16,
    color: NAVY,
    fontWeight: "900",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 50,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 3,
    opacity: 0.4,
  },
  navLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
  },
});