import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  ScrollView,
} from "react-native";

export default function LandingScreen({ navigation }: any) {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Logo */}
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.brand}>
          FIND<Text style={styles.brandAccent}>NEST</Text>
        </Text>

        <Text style={styles.title}>
          Never Lose{"\n"}
          <Text style={styles.titleAccent}>What Matters</Text>{"\n"}
          Most.
        </Text>

        <Text style={styles.subtitle}>
          FindNest uses advanced AI image recognition to match lost and found items on campus.
        </Text>

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.lostButton}>
            <Text style={styles.actionText}>📋 Report Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.foundButton}>
            <Text style={styles.actionText}>🔍 Found Item</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>675+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Powered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* Log In Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => setShowLoginOptions(true)}
        >
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          SJDM Cornerstone College Inc. © 2026
        </Text>
      </ScrollView>

      {/* Login Options Modal */}
      <Modal
        visible={showLoginOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLoginOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLoginOptions(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Account Type</Text>
            <Text style={styles.modalSubtitle}>Choose your login portal</Text>

            {/* Super Admin */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowLoginOptions(false);
                navigation.navigate("SuperAdminLogin");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#1a237e" }]}>
                <Text style={styles.optionEmoji}>👑</Text>
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Super Admin</Text>
                <Text style={styles.optionDesc}>CCI IT Coordinator Access</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Admin */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowLoginOptions(false);
                navigation.navigate("AdminLogin");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#ffd700" }]}>
                <Text style={styles.optionEmoji}>🛡️</Text>
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Admin Login</Text>
                <Text style={styles.optionDesc}>Guidance Counselor Access</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Student */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowLoginOptions(false);
                navigation.navigate("StudentLogin");
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#22c55e" }]}>
                <Text style={styles.optionEmoji}>🎓</Text>
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Student Login</Text>
                <Text style={styles.optionDesc}>Student Portal Access</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalFooter}>
              Authorized access only — SJDM Cornerstone College Inc.
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLoginOptions(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a237e",
  },
  scrollContent: {
    alignItems: "center",
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    marginBottom: 20,
    letterSpacing: 1,
  },
  brandAccent: {
    color: "#ffd700",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16,
  },
  titleAccent: {
    color: "#ffd700",
  },
  subtitle: {
    fontSize: 14,
    color: "#c5cae9",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
    width: "100%",
  },
  lostButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  foundButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  actionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffd700",
  },
  statLabel: {
    fontSize: 11,
    color: "#c5cae9",
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: "#ffd700",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 50,
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#1a237e",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1,
  },
  footerText: {
    color: "#7986cb",
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a237e",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a237e",
  },
  optionDesc: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  modalFooter: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#6b7280",
    fontWeight: "700",
    fontSize: 14,
  },
});