import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LandingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Ambient background accents */}
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        {/* ============ CLAIM TAG HERO ============ */}
        <View style={styles.tagWrapper}>
          {/* The notch — like a tag torn from a roll */}
          <View style={styles.tagNotch} />

          <View style={styles.tagCard}>
            {/* Perforation line */}
            <View style={styles.perforationRow}>
              {Array.from({ length: 14 }).map((_, i) => (
                <View key={i} style={styles.perfDot} />
              ))}
            </View>

            <View style={styles.tagBody}>
              <View style={styles.logoBox}>
                <Image source={require("../assets/icon.png")} style={styles.logo} />
              </View>

              <Text style={styles.brand}>
                FIND<Text style={styles.brandAccent}>NEST</Text>
              </Text>
              <Text style={styles.tagLabel}>Securing and Verifying Campus Recoveries</Text>
            </View>
          </View>
        </View>

        {/* ============ HEADLINE ============ */}
        <Text style={styles.title}>
          Never Lose{"\n"}
          <Text style={styles.titleAccent}>What Matters</Text>{"\n"}
          Most.
        </Text>

        <Text style={styles.subtitle}>
          AI image recognition matches lost and found items across campus — every report tagged, tracked, and resolved.
        </Text>

        {/* ============ QUICK ACTIONS ============ */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.lostButton} activeOpacity={0.85}>
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <Text style={styles.actionTitle}>Report Lost</Text>
            <Text style={styles.actionSub}>Something missing?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.foundButton} activeOpacity={0.85}>
            <View style={[styles.actionIconBox, styles.actionIconBoxAlt]}>
              <Text style={styles.actionIcon}>🔍</Text>
            </View>
            <Text style={[styles.actionTitle, styles.actionTitleAlt]}>Found Item</Text>
            <Text style={styles.actionSubAlt}>Turn it in here</Text>
          </TouchableOpacity>
        </View>

        {/* ============ STAMPED MANIFEST / STATS ============ */}
        <View style={styles.manifestCard}>
          <View style={styles.manifestRow}>
            <View style={styles.manifestStat}>
              <Text style={styles.statNumber}>675+</Text>
              <Text style={styles.statLabel}>STUDENTS</Text>
            </View>
            <View style={styles.manifestDivider} />
            <View style={styles.manifestStat}>
              <Text style={styles.statNumber}>AI</Text>
              <Text style={styles.statLabel}>POWERED</Text>
            </View>
            <View style={styles.manifestDivider} />
            <View style={styles.manifestStat}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>ALERTS</Text>
            </View>
          </View>
        </View>

        {/* ============ LOG IN ============ */}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("StudentLogin")}
        >
          <Text style={styles.loginButtonText}>LOG IN</Text>
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
const CREAM = "#fff8e1";
const RED = "#e63946";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  scrollContent: {
    alignItems: "center",
    padding: 24,
    paddingTop: 36,
    paddingBottom: 48,
  },

  /* Ambient glow accents */
  bgGlowTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,215,0,0.06)",
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: 200,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(34,197,94,0.05)",
  },

  /* ===== CLAIM TAG HERO ===== */
  tagWrapper: {
    alignItems: "center",
    marginBottom: 28,
  },
  tagNotch: {
    width: 28,
    height: 14,
    backgroundColor: NAVY,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
    borderTopWidth: 0,
    marginBottom: -2,
    zIndex: 2,
  },
  tagCard: {
    backgroundColor: CREAM,
    borderRadius: 24,
    width: width * 0.62,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgba(26,35,126,0.08)",
    transform: [{ rotate: "-1.2deg" }],
  },
  perforationRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  perfDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(26,35,126,0.18)",
  },
  tagBody: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 19,
    fontWeight: "900",
    color: NAVY,
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: "#c99700",
  },
  tagLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(26,35,126,0.45)",
    letterSpacing: 2,
    marginTop: 4,
  },

  /* ===== HEADLINE ===== */
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

  /* ===== QUICK ACTIONS ===== */
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
    width: "100%",
  },
  lostButton: {
    flex: 1,
    backgroundColor: RED,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#b71c2c",
  },
  foundButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.35)",
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionIconBoxAlt: {
    backgroundColor: "rgba(255,215,0,0.15)",
  },
  actionIcon: {
    fontSize: 16,
  },
  actionTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 2,
  },
  actionTitleAlt: {
    color: GOLD,
  },
  actionSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10.5,
  },
  actionSubAlt: {
    color: "#9fa8da",
    fontSize: 10.5,
  },

  /* ===== MANIFEST / STATS ===== */
  manifestCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 28,
    alignItems: "center",
  },
  manifestRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  manifestStat: {
    flex: 1,
    alignItems: "center",
  },
  manifestDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statNumber: {
    fontSize: 21,
    fontWeight: "900",
    color: GOLD,
  },
  statLabel: {
    fontSize: 9,
    color: "#9fa8da",
    marginTop: 3,
    letterSpacing: 1,
  },

  /* ===== LOGIN BUTTON ===== */
  loginButton: {
    backgroundColor: GOLD,
    paddingVertical: 17,
    paddingHorizontal: 70,
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
    letterSpacing: 2,
    textAlign: "center",
  },
  footerText: {
    color: "#7986cb",
    fontSize: 11,
  },
});