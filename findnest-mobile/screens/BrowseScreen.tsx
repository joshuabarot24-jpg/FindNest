import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";

interface LostReportPublic {
  id: number;
  item_name: string;
  category: string;
  location_lost: string;
  date_lost: string;
  photo_url: string | null;
}

interface MyReport {
  id: number;
  item_name: string;
  status: string;
  created_at: string;
}

const CATEGORIES = ["All", "Electronics", "Personal Belongings", "Accessories", "ID/Cards", "Keys", "School Supplies"];

const NAVY = "#1a237e";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusStyles(status: string) {
  switch (status) {
    case "returned":
      return { label: "Returned", badge: "#22c55e", bg: "#ecfdf5" };
    case "matched":
      return { label: "Match Found", badge: "#7c3aed", bg: "#f5f3ff" };
    default:
      return { label: "Searching", badge: NAVY, bg: "#eef2ff" };
  }
}

export default function BrowseScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<"reports" | "mine">("reports");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<LostReportPublic | null>(null);

  const [publicReports, setPublicReports] = useState<LostReportPublic[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);

  const [myReports, setMyReports] = useState<MyReport[]>([]);
  const [myReportsLoading, setMyReportsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicReports = async () => {
      try {
        const response = await api.get("/lost-items", { params: { status: "searching" } });
        setPublicReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching lost item reports:", err);
      } finally {
        setPublicLoading(false);
      }
    };

    const fetchMyReports = async () => {
      try {
        const response = await api.get("/lost-items/my-reports");
        setMyReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching my reports:", err);
      } finally {
        setMyReportsLoading(false);
      }
    };

    fetchPublicReports();
    fetchMyReports();
  }, []);

  const filtered = publicReports.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "reports" && styles.tabButtonActive]}
          onPress={() => setActiveTab("reports")}
        >
          <Text style={[styles.tabText, activeTab === "reports" && styles.tabTextActive]}>
            Report Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mine" && styles.tabButtonActive]}
          onPress={() => setActiveTab("mine")}
        >
          <Text style={[styles.tabText, activeTab === "mine" && styles.tabTextActive]}>
            My Lost Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "reports" ? (
          <>
            <View style={styles.statBanner}>
              <View>
                <Text style={styles.statNumber}>{publicReports.length}</Text>
                <Text style={styles.statLabel}>active lost reports</Text>
              </View>
              <View style={styles.statIconCircle}>
                <Ionicons name="megaphone-outline" size={20} color="white" />
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search lost item reports..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {publicLoading ? (
              <Text style={styles.loadingText}>Loading reports...</Text>
            ) : (
              <>
                {filtered.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    activeOpacity={0.85}
                    onPress={() => setSelectedItem(item)}
                  >
                    <View style={styles.itemIconBox}>
                      {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.itemImage} />
                      ) : (
                        <Ionicons name="image-outline" size={20} color="#9ca3af" />
                      )}
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemName}>{item.item_name}</Text>
                      <View style={styles.itemLocationRow}>
                        <Ionicons name="location-outline" size={12} color="#9ca3af" />
                        <Text style={styles.itemLocation}>{item.location_lost}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {filtered.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="cube-outline" size={32} color="#d1d5db" />
                    <Text style={styles.emptyText}>No active lost reports</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.historyHeading}>My Lost Reports</Text>
            <Text style={styles.historySubheading}>Items you have reported as lost</Text>

            {myReportsLoading ? (
              <Text style={styles.loadingText}>Loading your reports...</Text>
            ) : myReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>You haven't reported any lost items yet</Text>
              </View>
            ) : (
              myReports.map((report) => {
                const styles2 = statusStyles(report.status);
                return (
                  <View key={report.id} style={styles.historyCard}>
                    <View style={styles.historyTextBox}>
                      <Text style={styles.historyItem}>{report.item_name}</Text>
                      <Text style={styles.historyDate}>Reported {formatDate(report.created_at)}</Text>
                    </View>
                    <View style={[styles.historyStatusPill, { backgroundColor: styles2.bg }]}>
                      <Text style={[styles.historyStatusText, { color: styles2.badge }]}>{styles2.label}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            {selectedItem && (
              <>
                <View style={styles.modalIconBox}>
                  {selectedItem.photo_url ? (
                    <Image source={{ uri: selectedItem.photo_url }} style={styles.modalImage} />
                  ) : (
                    <Ionicons name="image-outline" size={30} color="#9ca3af" />
                  )}
                </View>
                <Text style={styles.modalItemName}>{selectedItem.item_name}</Text>
                <Text style={styles.modalItemLocation}>
                  Last seen: {selectedItem.location_lost}
                </Text>
                <Text style={styles.modalItemDate}>
                  {formatDate(selectedItem.date_lost)}
                </Text>

                <View style={styles.modalNote}>
                  <Ionicons name="information-circle-outline" size={16} color="#1e40af" style={{ marginBottom: 4 }} />
                  <Text style={styles.modalNoteText}>
                    Recognize this item? Report it as found from the Home screen — our AI will automatically check for a match.
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Ionicons name="search" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Browse</Text>
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
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  tabRow: { flexDirection: "row", backgroundColor: "white", paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabButtonActive: { borderBottomColor: NAVY },
  tabText: { fontSize: 12.5, fontWeight: "700", color: "#9ca3af" },
  tabTextActive: { color: NAVY },
  scrollContent: { padding: 20, paddingBottom: 30 },
  statBanner: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statNumber: { fontSize: 26, fontWeight: "900", color: "white" },
  statLabel: { fontSize: 11.5, color: "#b8c0e8", marginTop: 2 },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 13.5, color: "#374151" },
  categoryScroll: { marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: NAVY, borderColor: NAVY },
  categoryChipText: { fontSize: 11.5, fontWeight: "700", color: "#9ca3af" },
  categoryChipTextActive: { color: "white" },
  loadingText: { color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%" },
  itemTextBox: { flex: 1 },
  itemName: { fontSize: 13.5, fontWeight: "800", color: "#374151" },
  itemLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  itemLocation: { fontSize: 11.5, color: "#9ca3af" },
  categoryTag: { backgroundColor: "#eef2ff", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  categoryTagText: { fontSize: 9.5, fontWeight: "800", color: NAVY },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#9ca3af", fontWeight: "700" },
  historyHeading: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 4 },
  historySubheading: { fontSize: 12, color: "#9ca3af", marginBottom: 18 },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  historyTextBox: { flex: 1 },
  historyItem: { fontSize: 14, fontWeight: "800", color: "#374151" },
  historyDate: { fontSize: 11.5, color: "#9ca3af", marginTop: 3 },
  historyStatusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  historyStatusText: { fontSize: 10.5, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    alignItems: "center",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", marginBottom: 20 },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  modalImage: { width: "100%", height: "100%" },
  modalItemName: { fontSize: 17, fontWeight: "900", color: NAVY, marginBottom: 4 },
  modalItemLocation: { fontSize: 13, color: "#9ca3af" },
  modalItemDate: { fontSize: 11.5, color: "#c1c7d6", marginBottom: 18, marginTop: 2 },
  modalNote: { backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, marginBottom: 20, width: "100%", alignItems: "center" },
  modalNoteText: { fontSize: 12, color: "#1e40af", lineHeight: 17, textAlign: "center" },
  modalCloseButton: { paddingVertical: 6 },
  modalCloseText: { color: "#9ca3af", fontWeight: "700", fontSize: 13 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
});