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

interface FoundItem {
  id: number;
  item_name: string;
  location_found: string;
  photo_url: string | null;
}

interface LostReport {
  id: number;
  item_name: string;
  status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: string) {
  switch (status) {
    case "returned":
      return "Returned";
    case "matched":
      return "Match Found";
    default:
      return "Searching";
  }
}

const NAVY = "#1a237e";

export default function BrowseScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<"browse" | "history">("browse");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);

  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [foundLoading, setFoundLoading] = useState(true);

  const [myReports, setMyReports] = useState<LostReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/found-items", { params: { status: "unclaimed" } });
        setFoundItems(response.data.records || []);
      } catch (err) {
        console.error("Error fetching found items:", err);
      } finally {
        setFoundLoading(false);
      }
    };

    const fetchMyReports = async () => {
      try {
        const response = await api.get("/lost-items/my-reports");
        setMyReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching my reports:", err);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchItems();
    fetchMyReports();
  }, []);

  const filtered = foundItems.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

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
          style={[styles.tabButton, activeTab === "browse" && styles.tabButtonActive]}
          onPress={() => setActiveTab("browse")}
        >
          <Text style={[styles.tabText, activeTab === "browse" && styles.tabTextActive]}>
            My Found Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "history" && styles.tabButtonActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
            My Lost Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {activeTab === "browse" ? (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search found items..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {foundLoading ? (
              <Text style={styles.loadingText}>Loading found items...</Text>
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
                        <Text style={styles.itemLocation}>{item.location_found}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                  </TouchableOpacity>
                ))}

                {filtered.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="cube-outline" size={32} color="#d1d5db" />
                    <Text style={styles.emptyText}>No items found</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.historyHeading}>My Lost Reports</Text>
            <Text style={styles.historySubheading}>
              Items you have reported as lost
            </Text>

            {reportsLoading ? (
              <Text style={styles.loadingText}>Loading your reports...</Text>
            ) : myReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>You haven't reported any lost items yet</Text>
              </View>
            ) : (
              myReports.map((report) => (
                <View key={report.id} style={styles.historyCard}>
                  <View style={styles.historyTextBox}>
                    <Text style={styles.historyItem}>{report.item_name}</Text>
                    <Text style={styles.historyDate}>Reported {formatDate(report.created_at)}</Text>
                  </View>
                  <Text style={styles.historyStatus}>{statusLabel(report.status)}</Text>
                </View>
              ))
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
                  Found at: {selectedItem.location_found}
                </Text>

                <View style={styles.modalNote}>
                  <Text style={styles.modalNoteText}>
                    If this is your item, submit a claim so an administrator can verify ownership.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => {
                    const itemToClaim = selectedItem;
                    setSelectedItem(null);
                    navigation.navigate("ReportLost", {
                      claimItemName: itemToClaim.item_name,
                      claimItemLocation: itemToClaim.location_found,
                    });
                  }}
                >
                  <Text style={styles.claimButtonText}>Submit Claim</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedItem(null)}>
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
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  tabRow: { flexDirection: "row", backgroundColor: "white", paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabButtonActive: { borderBottomColor: NAVY },
  tabText: { fontSize: 12.5, fontWeight: "700", color: "#9ca3af" },
  tabTextActive: { color: NAVY },
  scrollContent: { padding: 20, paddingBottom: 30 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 13.5,
    color: "#374151",
  },
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
  historyStatus: { fontSize: 11, fontWeight: "800", color: NAVY },
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
  modalItemLocation: { fontSize: 13, color: "#9ca3af", marginBottom: 18 },
  modalNote: { backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, marginBottom: 20, width: "100%" },
  modalNoteText: { fontSize: 12, color: "#1e40af", lineHeight: 17, textAlign: "center" },
  claimButton: { backgroundColor: NAVY, borderRadius: 16, paddingVertical: 16, width: "100%", alignItems: "center", marginBottom: 14 },
  claimButtonText: { color: "white", fontWeight: "900", fontSize: 14 },
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