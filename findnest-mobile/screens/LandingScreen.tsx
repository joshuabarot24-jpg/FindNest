import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#0F4C3A";
const DARK_GREEN = "#0A3021";

export default function LandingScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../assets/landing-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Soft light wash so the dark green text stays readable on the photo */}
      <View style={styles.wash} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <Image source={require("../assets/findnest-logo.png")} style={styles.logo} />
            <Text style={styles.brand}>FindNest</Text>
            <Text style={styles.tagline}>Lost and found with AI Matching</Text>
          </View>

          <Text style={styles.title}>WELCOME TO FINDNEST!</Text>
          <Text style={styles.subtitle}>
            Lost something? Found something?{"\n"}
            Let&apos;s bring it back where it belongs.{"\n"}
            Your campus lost-and-found starts here.{"\n"}
            Let FindNest help you!
          </Text>

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("StudentLogin")}
          >
            <Text style={styles.ctaText}>Let&apos;s get Started</Text>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Image source={require("../assets/findnest-logo.png")} style={styles.footerLogo} />
            <Text style={styles.footerText}>© 2026/Information College. LostandFound.com</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Dark green wave along the bottom edge */}
      <View pointerEvents="none" style={styles.waveWrap}>
        <View style={styles.waveBack} />
        <View style={styles.waveFront} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#cfe8f5" },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: { alignItems: "center", marginBottom: 28 },
  logo: { width: 84, height: 84, resizeMode: "contain" },
  brand: { fontFamily: "Montserrat_800ExtraBold", fontSize: 26, color: "#0B4F2C", marginTop: 6 },
  tagline: { fontSize: 10, color: DARK_GREEN, marginTop: 2, fontWeight: "500" },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: GREEN,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_GREEN,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 30,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    paddingVertical: 15,
    paddingHorizontal: 34,
    borderRadius: 999,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  ctaText: { color: "white", fontWeight: "800", fontSize: 15 },
  footer: { alignItems: "center", marginTop: 34 },
  footerLogo: { width: 26, height: 26, resizeMode: "contain", opacity: 0.45 },
  footerText: { color: "#6b7280", fontSize: 10, marginTop: 6, textAlign: "center" },
  waveWrap: { position: "absolute", left: 0, right: 0, bottom: 0, height: 110 },
  waveBack: {
    position: "absolute",
    left: -120,
    right: -120,
    bottom: -95,
    height: 160,
    borderRadius: 999,
    backgroundColor: "#14654d",
  },
  waveFront: {
    position: "absolute",
    left: -120,
    right: -120,
    bottom: -115,
    height: 160,
    borderRadius: 999,
    backgroundColor: GREEN,
  },
});