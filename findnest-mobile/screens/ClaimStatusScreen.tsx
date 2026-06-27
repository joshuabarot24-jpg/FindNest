import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const claims = [
  {
    id: 1,
    item: "Blue Umbrella",
    icon: "☂️",
    location: "Main Entrance",
    date: "2026-03-12",
    currentStep: 3,
    color: "#3b82f6",
  },
  {
    id: 2,
    item: "Black Wallet",
    icon: "👛",
    location: "Canteen",
    date: "2026-05-20",
    currentStep: 6,
    color: "#f59e0b",
  },
  {
    id: 3,
    item: "Calculator",
    icon: "🧮",
    location: "Room 402",
    date: "2026-04-15",
    currentStep: 7,
    color: "#22c55e",
  },
];

const steps = [
  { key: "submitted", label: "Submitted", icon: "📝", desc: "Report received by the system" },
  { key: "review", label: "Under AI Review", icon: "🤖", desc: "AI is analyzing your report" },
  { key: "matched", label: "Matched", icon: "🔍", desc: "Potential match identified" },
  { key: "claim", label: "Claim Submitted", icon: "📨", desc: "Ownership claim filed" },
  { key: "pending", label: "Pending Verification", icon: "🔐", desc: "Admin is verifying evidence" },
  { key: "approved", label: "Approved", icon: "✅", desc: "Ready for pickup at office" },
  { key: "returned", label: "Returned", icon: "🎉", desc: "Item successfully recovered" },
];

const statusLabel = (step: number) => {
  if (step >= 7) return { text: "Returned", bg: "#ecfdf5", color: "#16a34a" };
  if (step >= 6) return { text: "Approved", bg: "#eff6ff", color: "#2563eb" };
  if (step >= 4) return { text: "In Verification", bg: "#fefce8", color: "#ca8a04" };
  if (step >= 3) return { text: "Match Found", bg: "#f5f3ff", color: "#7c3aed" };
  return { text: "Searching", bg: "#f3f4f6", color: "#6b7280" };
};

export default function ClaimStatusScreen({ navigation }: any) {
  const [selected, setSelected] = useState(claims[0]);
  const progressPct = Math.round((selected.currentStep / steps.length) * 100);

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
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
          <Text style={styles.iconText}>🛠️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Claim Status</Text>
        <Text style={styles.pageSubtitle}>Track the progress of your submitted reports</Text>

        {/* Horizontal Carousel of Reports */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {claims.map((claim) => {
            const status = statusLabel(claim.currentStep);
            const isActive = selected.id === claim.id;
            const pct = Math.round((claim.currentStep / steps.length) * 100);
            return (
              <TouchableOpacity
                key={claim.id}
                style={[
                  styles.carouselCard,
                  isActive && { borderColor: claim.color, backgroundColor: `${claim.color}10` },
                ]}
                onPress={() => setSelected(claim)}
                activeOpacity={0.8}
              >
                <View style={[styles.carouselIconBox, { backgroundColor: `${claim.color}20` }]}>
                  <Text style={styles.carouselIcon}>{claim.icon}</Text>
                </View>
                <Text style={styles.carouselName} numberOfLines={1}>{claim.item}</Text>
                <View style={[styles.carouselPill, { backgroundColor: status.bg }]}>
                  <Text style={[styles.carouselPillText, { color: status.color }]}>{status.text}</Text>
                </View>
                <View style={styles.carouselRing}>
                  <View style={[styles.carouselRingFill, { width: `${pct}%`, backgroundColor: claim.color }]} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Item Banner */}
        <View style={[styles.bannerCard, { backgroundColor: selected.color }]}>
          <View style={styles.bannerIconCircle}>
            <Text style={styles.bannerIcon}>{selected.icon}</Text>
          </View>
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerName}>{selected.item}</Text>
            <Text style={styles.bannerSub}>{selected.location} · {selected.date}</Text>
          </View>
          <View style={styles.bannerPercentBox}>
            <Text style={styles.bannerPercent}>{progressPct}%</Text>
            <Text style={styles.bannerPercentLabel}>DONE</Text>
          </View>
        </View>

        {/* Timeline Cards */}
        <View style={styles.timelineWrap}>
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < selected.currentStep;
            const isCurrent = stepNumber === selected.currentStep;
            const isDone = stepNumber <= selected.currentStep;

            return (
              <View
                key={step.key}
                style={[
                  styles.timelineCard,
                  isCurrent && { borderColor: selected.color, backgroundColor: `${selected.color}08` },
                  !isDone && styles.timelineCardInactive,
                ]}
              >
                <View
                  style={[
                    styles.timelineBadge,
                    isComplete && { backgroundColor: "#22c55e" },
                    isCurrent && { backgroundColor: selected.color },
                  ]}
                >
                  <Text style={styles.timelineBadgeText}>
                    {isComplete ? "✓" : step.icon}
                  </Text>
                </View>
                <View style={styles.timelineTextBox}>
                  <Text style={[styles.timelineLabel, isDone && styles.timelineLabelDone]}>
                    {step.label}
                  </Text>
                  <Text style={styles.timelineDesc}>{step.desc}</Text>
                </View>
                {isCurrent && (
                  <View style={[styles.timelineNowTag, { backgroundColor: selected.color }]}>
                    <Text style={styles.timelineNowText}>NOW</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {selected.currentStep === 6 && (
          <View style={styles.actionAlert}>
            <Text style={styles.actionAlertIcon}>⚠️</Text>
            <Text style={styles.actionAlertText}>
              Collect your item within 5 school days or it returns to unclaimed status.
            </Text>
          </View>
        )}
      </ScrollView>

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
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>📋</Text>
          <Text style={styles.navLabelActive}>Status</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    marginBottom: 18,
  },

  /* Carousel */
  carousel: {
    marginBottom: 18,
  },
  carouselCard: {
    width: 130,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
  },
  carouselIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  carouselIcon: {
    fontSize: 18,
  },
  carouselName: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  carouselPill: {
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  carouselPillText: {
    fontSize: 9,
    fontWeight: "800",
  },
  carouselRing: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  carouselRingFill: {
    height: 4,
    borderRadius: 2,
  },

  /* Banner */
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  bannerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerName: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11.5,
    marginTop: 2,
  },
  bannerPercentBox: {
    alignItems: "center",
  },
  bannerPercent: {
    color: "white",
    fontWeight: "900",
    fontSize: 20,
  },
  bannerPercentLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* Timeline */
  timelineWrap: {
    gap: 10,
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
  },
  timelineCardInactive: {
    opacity: 0.5,
  },
  timelineBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timelineBadgeText: {
    fontSize: 15,
    color: "white",
  },
  timelineTextBox: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9ca3af",
  },
  timelineLabelDone: {
    color: "#1f2937",
  },
  timelineDesc: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  timelineNowTag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timelineNowText: {
    color: "white",
    fontSize: 9,
    fontWeight: "900",
  },

  actionAlert: {
    flexDirection: "row",
    backgroundColor: "#fefce8",
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  actionAlertIcon: {
    fontSize: 16,
  },
  actionAlertText: {
    flex: 1,
    fontSize: 11.5,
    color: "#a16207",
    lineHeight: 16,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
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
  navIconActive: {
    fontSize: 20,
    marginBottom: 3,
  },
  navLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
  },
  navLabelActive: {
    fontSize: 10,
    color: NAVY,
    fontWeight: "800",
  },
});