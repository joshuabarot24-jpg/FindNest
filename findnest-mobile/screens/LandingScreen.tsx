import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#1a237e";
const GOLD = "#ffd700";

const FEATURES = [
  {
    icon: "camera-outline" as const,
    title: "Snap a Photo",
    description: "Our AI reads item details automatically — no long forms to fill out.",
  },
  {
    icon: "flash-outline" as const,
    title: "Automatic Matching",
    description: "Lost and found reports are compared instantly, no waiting for staff.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Verified Claims",
    description: "Secret ownership questions confirm items go back to their real owner.",
  },
];

export default function LandingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image source={require("../assets/icon.png")} style={styles.logo} />
          </View>
          <Text style={styles.brand}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
          <Text style={styles.tagLabel}>SJDM Cornerstone College Inc.</Text>
        </View>

        <Text style={styles.title}>
          Lost something?{"\n"}Let AI find it.
        </Text>
        <Text style={styles.subtitle}>
          FindNest matches lost and found reports automatically using image recognition — report it, and we take it from there.
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((feature, index) => (
            <View key={feature.title} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name={feature.icon} size={20} color={NAVY} />
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("StudentLogin")}
        >
          <Text style={styles.loginButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>

        <Text style={styles.footerText}>SJDM Cornerstone College Inc. &copy; 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fc" },
  scrollContent: { padding: 28, paddingTop: 50, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 36 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: NAVY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logo: { width: 46, height: 46, resizeMode: "contain" },
  brand: { fontSize: 20, fontWeight: "900", color: NAVY, letterSpacing: 1 },
  brandAccent: { color: "#c99700" },
  tagLabel: { fontSize: 11, fontWeight: "700", color: "#9ca3af", marginTop: 4 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1f2937",
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 36,
  },
  featureList: { gap: 20, marginBottom: 40 },
  featureRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  featureTextBox: { flex: 1, paddingTop: 2 },
  featureTitle: { fontSize: 14.5, fontWeight: "800", color: "#1f2937", marginBottom: 3 },
  featureDescription: { fontSize: 12.5, color: "#6b7280", lineHeight: 18 },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 17,
    borderRadius: 16,
    marginBottom: 20,
  },
  loginButtonText: { color: "white", fontWeight: "800", fontSize: 15 },
  footerText: { color: "#9ca3af", fontSize: 11, textAlign: "center" },
});