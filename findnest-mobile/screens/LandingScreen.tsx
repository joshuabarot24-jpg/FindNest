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

export default function LandingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Image source={require("../assets/icon.png")} style={styles.logo} />
          </View>
          <Text style={styles.brand}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
          <Text style={styles.tagLabel}>SJDM Cornerstone College Inc.</Text>
        </View>

        <Text style={styles.title}>
          Never Lose{"\n"}
          <Text style={styles.titleAccent}>What Matters</Text>{"\n"}
          Most.
        </Text>

        <Text style={styles.subtitle}>
          AI image recognition matches lost and found items across campus — every report tagged, tracked, and resolved.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.lostCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("StudentLogin")}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="alert-circle-outline" size={24} color="white" />
            </View>
            <Text style={styles.actionTitle}>Report Lost</Text>
            <Text style={styles.actionSub}>Something missing?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.foundCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("StudentLogin")}
          >
            <View style={[styles.actionIconCircle, styles.actionIconCircleAlt]}>
              <Ionicons name="search-outline" size={24} color="#1a237e" />
            </View>
            <Text style={[styles.actionTitle, styles.actionTitleAlt]}>Found Item</Text>
            <Text style={styles.actionSubAlt}>Turn it in here</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBlock}>
            <Ionicons name="people-outline" size={20} color="#ffd700" />
            <Text style={styles.statNumber}>675+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Ionicons name="sparkles-outline" size={20} color="#ffd700" />
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Powered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Ionicons name="notifications-outline" size={20} color="#ffd700" />
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("StudentLogin")}
        >
          <Text style={styles.loginButtonText}>LOG IN</Text>
          <Ionicons name="arrow-forward" size={18} color="#1a237e" />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          SJDM Cornerstone College Inc. © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const NAVY = "#1a237e";
const GOLD = "#ffd700";
const RED = "#ef4444";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  scrollContent: {
    alignItems: "center",
    padding: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: GOLD,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: GOLD,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#9fa8da",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  lostCard: {
    flex: 1,
    backgroundColor: RED,
    padding: 20,
    borderRadius: 22,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  foundCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIconCircleAlt: {
    backgroundColor: "rgba(26,35,126,0.08)",
  },
  actionTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 3,
  },
  actionTitleAlt: {
    color: NAVY,
  },
  actionSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
  },
  actionSubAlt: {
    color: "#6b7280",
    fontSize: 11,
  },
  statsCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
  },
  statLabel: {
    fontSize: 9,
    color: "#9fa8da",
    letterSpacing: 0.5,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 17,
    paddingHorizontal: 60,
    borderRadius: 50,
    marginBottom: 18,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: NAVY,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 1.5,
  },
  footerText: {
    color: "#7986cb",
    fontSize: 11,
  },
});