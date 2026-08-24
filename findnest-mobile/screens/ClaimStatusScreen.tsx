import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";

interface Claim {
  id: number;
  claim_status: string;
  admin_notes: string | null;
  created_at: string;
  claimed_at: string | null;
  match: {
    lost_report: { item_name: string; location_lost: string } | null;
    found_record: { item_name: string; location_found: string } | null;
  } | null;
}

const steps = [
  { key: "submitted", label: "Submitted", desc: "Report received by the system" },
  { key: "review", label: "Under AI Review", desc: "AI is analyzing your report" },
  { key: "matched", label: "Matched", desc: "Potential match identified" },
  { key: "claim", label: "Claim Submitted", desc: "Ownership claim filed" },
  { key: "pending", label: "Pending Verification", desc: "Admin is verifying evidence" },
  { key: "approved", label: "Approved", desc: "Ready for pickup at office" },
  { key: "returned", label: "Returned", desc: "Item successfully recovered" },
];

function currentStepFor(status: string) {
  switch (status) {
    case "approved":
      return 6;
    case "pending":
    default:
      return 5;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "approved":
      return { text: "Approved", bg: "#eff6ff", color: "#2563eb" };
    case "rejected":
      return { text: "Rejected", bg: "#fef2f2", color: "#dc2626" };
    default:
      return { text: "In Verification", bg: "#fefce8", color: "#ca8a04" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const NAVY = "#1a237e";

export default function ClaimStatusScreen({ navigation }: any) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Claim | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get("/claims/my-claims");
        const result: Claim[] = response.data.claims || [];
        setClaims(result);
        if (result.length > 0) setSelected(result[0]);
      } catch (err) {
        console.error("Error fetching claims:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const getItemInfo = (claim: Claim) => {
    const item = claim.match?.found_record || claim.match?.lost_report;
    return {
      name: item?.item_name || "Unknown Item",
      location: claim.match?.found_record?.location_found || claim.match?.lost_report?.location_lost || "Unknown",
    };
  };

  const currentStep = selected ? currentStepFor(selected.claim_status) : 0;
  const progressPct = selected ? Math.round((currentStep / steps.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
          <Ionicons name="help-circle-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Claim Status</Text>
        <Text style={styles.pageSubtitle}>Track the progress of your submitted claims</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading claims...</Text>
        ) : claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
            <Text style={styles.emptyText}>No claims submitted yet</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={{ paddingRight: 8 }}>
              {claims.map((claim) => {
                const info = getItemInfo(claim);
                const status = statusLabel(claim.claim_status);
                const isActive = selected?.id === claim.id;
                const step = currentStepFor(claim.claim_status);
                const pct = Math.round((step / steps.length) * 100);
                return (
                  <TouchableOpacity
                    key={claim.id}
                    style={[styles.carouselCard, isActive && styles.carouselCardActive]}
                    onPress={() => setSelected(claim)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.carouselName} numberOfLines={1}>{info.name}</Text>
                    <View style={[styles.carouselPill, { backgroundColor: status.bg }]}>
                      <Text style={[styles.carouselPillText, { color: status.color }]}>{status.text}</Text>
                    </View>
                    <View style={styles.carouselRing}>
                      <View style={[styles.carouselRingFill, { width: `${pct}%` }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selected && (
              <>
                <View style={styles.bannerCard}>
                  <View style={styles.bannerTextBox}>
                    <Text style={styles.bannerName}>{getItemInfo(selected).name}</Text>
                    <Text style={styles.bannerSub}>{getItemInfo(selected).location} · {formatDate(selected.created_at)}</Text>
                  </View>
                  {selected.claim_status !== "rejected" && (
                    <View style={styles.bannerPercentBox}>
                      <Text style={styles.bannerPercent}>{progressPct}%</Text>
                      <Text style={styles.bannerPercentLabel}>DONE</Text>
                    </View>
                  )}
                </View>

                {selected.claim_status === "rejected" ? (
                  <View style={styles.rejectedCard}>
                    <Ionicons name="close-circle" size={22} color="#dc2626" style={{ marginBottom: 6 }} />
                    <Text style={styles.rejectedTitle}>Claim Rejected</Text>
                    {selected.admin_notes && <Text style={styles.rejectedText}>Reason: {selected.admin_notes}</Text>}
                  </View>
                ) : (
                  <View style={styles.timelineWrap}>
                    {steps.map((step, index) => {
                      const stepNumber = index + 1;
                      const isComplete = stepNumber < currentStep;
                      const isCurrent = stepNumber === currentStep;
                      const isDone = stepNumber <= currentStep;

                      return (
                        <View key={step.key} style={[styles.timelineCard, isCurrent && styles.timelineCardCurrent, !isDone && styles.timelineCardInactive]}>
                          <View style={[styles.timelineBadge, (isComplete || isCurrent) && styles.timelineBadgeDone]}>
                            {isComplete ? (
                              <Ionicons name="checkmark" size={16} color="white" />
                            ) : (
                              <Text style={styles.timelineBadgeText}>{stepNumber}</Text>
                            )}
                          </View>
                          <View style={styles.timelineTextBox}>
                            <Text style={[styles.timelineLabel, isDone && styles.timelineLabelDone]}>{step.label}</Text>
                            <Text style={styles.timelineDesc}>{step.desc}</Text>
                          </View>
                          {isCurrent && (
                            <View style={styles.timelineNowTag}>
                              <Text style={styles.timelineNowText}>NOW</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {selected.claim_status === "approved" && (
                  <View style={styles.actionAlert}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#15803d" style={{ marginRight: 8 }} />
                    <Text style={styles.actionAlertText}>
                      Visit the Guidance Office to collect your item
                      {selected.claimed_at && ` — approved ${formatDate(selected.claimed_at)}`}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

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
          <Ionicons name="document-text" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Status</Text>
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
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY, marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: "#9ca3af", marginBottom: 18 },
  loadingText: { color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#9ca3af", fontWeight: "700" },
  carousel: { marginBottom: 18 },
  carouselCard: { width: 130, backgroundColor: "white", borderRadius: 18, padding: 14, marginRight: 10, borderWidth: 1.5, borderColor: "#f0f0f0" },
  carouselCardActive: { borderColor: NAVY, backgroundColor: "#eef2ff" },
  carouselName: { fontSize: 12.5, fontWeight: "800", color: "#374151", marginBottom: 8 },
  carouselPill: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8, alignSelf: "flex-start", marginBottom: 10 },
  carouselPillText: { fontSize: 9, fontWeight: "800" },
  carouselRing: { height: 4, borderRadius: 2, backgroundColor: "#f3f4f6", overflow: "hidden" },
  carouselRingFill: { height: 4, borderRadius: 2, backgroundColor: NAVY },
  bannerCard: { flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 18, marginBottom: 16, backgroundColor: NAVY },
  bannerTextBox: { flex: 1 },
  bannerName: { color: "white", fontWeight: "900", fontSize: 16 },
  bannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11.5, marginTop: 2 },
  bannerPercentBox: { alignItems: "center" },
  bannerPercent: { color: "white", fontWeight: "900", fontSize: 20 },
  bannerPercentLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  rejectedCard: { backgroundColor: "#fef2f2", borderRadius: 16, padding: 16, marginBottom: 16, alignItems: "center" },
  rejectedTitle: { color: "#dc2626", fontWeight: "900", fontSize: 14, marginBottom: 4 },
  rejectedText: { color: "#b91c1c", fontSize: 12.5, textAlign: "center" },
  timelineWrap: { gap: 10 },
  timelineCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: "#f0f0f0" },
  timelineCardCurrent: { borderColor: NAVY, backgroundColor: "#eef2ff" },
  timelineCardInactive: { opacity: 0.5 },
  timelineBadge: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  timelineBadgeDone: { backgroundColor: NAVY },
  timelineBadgeText: { fontSize: 13, fontWeight: "800", color: "#9ca3af" },
  timelineTextBox: { flex: 1 },
  timelineLabel: { fontSize: 13, fontWeight: "800", color: "#9ca3af" },
  timelineLabelDone: { color: "#1f2937" },
  timelineDesc: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  timelineNowTag: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: NAVY },
  timelineNowText: { color: "white", fontSize: 9, fontWeight: "900" },
  actionAlert: { flexDirection: "row", alignItems: "center", backgroundColor: "#ecfdf5", marginTop: 14, borderRadius: 14, padding: 14 },
  actionAlertText: { flex: 1, fontSize: 11.5, color: "#15803d", lineHeight: 16 },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
});