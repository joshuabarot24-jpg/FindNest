import React, { useState } from "react";
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

const foundItems = [
  { id: 1, name: "Scientific Calculator", location: "Room 402", icon: "❓" },
  { id: 2, name: "Brown Wallet", location: "Canteen", icon: "❓" },
];

const reportHistory = [
  { id: 1, item: "Wallet", turnedIn: "April 05, 2026" },
];

export default function BrowseScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<"browse" | "history">("browse");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<typeof foundItems[0] | null>(null);

  const filtered = foundItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
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
          <Text style={styles.iconText}>🛠️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "browse" && styles.tabButtonActive]}
          onPress={() => setActiveTab("browse")}
        >
          <Text style={[styles.tabText, activeTab === "browse" && styles.tabTextActive]}>
            Browse Found Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "history" && styles.tabButtonActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
            Report History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {activeTab === "browse" ? (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search found items..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />

            <TouchableOpacity
              style={styles.reportFoundButton}
              onPress={() => navigation.navigate("ReportFound")}
            >
              <Text style={styles.reportFoundIcon}>🔍</Text>
              <Text style={styles.reportFoundText}>Report Found Item</Text>
            </TouchableOpacity>

            {filtered.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemRow}
                activeOpacity={0.85}
                onPress={() => setSelectedItem(item)}
              >
                <View style={styles.itemIconBox}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>
                <View style={styles.itemTextBox}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemLocation}>Location: {item.location}</Text>
                </View>
                <Text style={styles.itemArrow}>›</Text>
              </TouchableOpacity>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.historyHeading}>Report History</Text>
            <Text style={styles.historySubheading}>
              Details of past activities and incident reporting
            </Text>

            {reportHistory.map((report) => (
              <View key={report.id} style={styles.historyCard}>
                <View style={styles.historyTextBox}>
                  <Text style={styles.historyItem}>Found: {report.item}</Text>
                  <Text style={styles.historyDate}>Turned in: {report.turnedIn}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Support")}>
                  <Text style={styles.reportIncidentLink}>Report Incident</Text>
                </TouchableOpacity>
              </View>
            ))}
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
                  <Text style={styles.modalIcon}>{selectedItem.icon}</Text>
                </View>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                <Text style={styles.modalItemLocation}>
                  Found at: {selectedItem.location}
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
                      claimItemName: itemToClaim.name,
                      claimItemLocation: itemToClaim.location,
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
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navIconActive}>🔍</Text>
          <Text style={styles.navLabelActive}>Browse</Text>
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
  tabRow: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: NAVY,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#9ca3af",
  },
  tabTextActive: {
    color: NAVY,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  searchInput: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 13.5,
    color: "#374151",
    marginBottom: 14,
  },
  reportFoundButton: {
    flexDirection: "row",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  reportFoundIcon: {
    fontSize: 16,
    color: "#22c55e",
  },
  reportFoundText: {
    color: "#22c55e",
    fontWeight: "800",
    fontSize: 13.5,
  },
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
  },
  itemIcon: {
    fontSize: 20,
  },
  itemTextBox: {
    flex: 1,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#374151",
  },
  itemLocation: {
    fontSize: 11.5,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemArrow: {
    fontSize: 22,
    color: "#d1d5db",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: "#9ca3af",
    fontWeight: "700",
  },
  historyHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 4,
  },
  historySubheading: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 18,
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  historyTextBox: {
    marginBottom: 10,
  },
  historyItem: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
  },
  historyDate: {
    fontSize: 11.5,
    color: "#9ca3af",
    marginTop: 3,
  },
  reportIncidentLink: {
    fontSize: 12.5,
    color: "#ef4444",
    fontWeight: "700",
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
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e7eb",
    marginBottom: 20,
  },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalItemName: {
    fontSize: 17,
    fontWeight: "900",
    color: NAVY,
    marginBottom: 4,
  },
  modalItemLocation: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 18,
  },
  modalNote: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    width: "100%",
  },
  modalNoteText: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 17,
    textAlign: "center",
  },
  claimButton: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  claimButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
  },
  modalCloseText: {
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 13,
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