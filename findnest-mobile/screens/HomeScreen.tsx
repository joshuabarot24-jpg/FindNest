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

interface FoundItem {
  id: number;
  item_name: string;
  photo_url: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

const NAVY = "#1a237e";

export default function HomeScreen({ navigation }: any) {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [foundLoading, setFoundLoading] = useState(true);
  const [matchNotification, setMatchNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        const response = await api.get("/found-items", { params: { status: "unclaimed" } });
        setFoundItems((response.data.records || []).slice(0, 6));
      } catch (err) {
        console.error("Error fetching found items:", err);
      } finally {
        setFoundLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications: NotificationItem[] = response.data.notifications || [];
        const unreadMatch = notifications.find(
          (n) => !n.is_read && n.type?.toLowerCase().includes("match")
        );
        setMatchNotification(unreadMatch || null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchFoundItems();
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            {matchNotification && <View style={styles.iconBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {matchNotification && (
          <TouchableOpacity
            style={styles.notifBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ClaimStatus")}
          >
            <View style={styles.notifIconBox}>
              <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
            </View>
            <View style={styles.notifTextBox}>
              <Text style={styles.notifTitle}>{matchNotification.title}</Text>
              <Text style={styles.notifMessage}>{matchNotification.message}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#16a34a" />
          </TouchableOpacity>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.lostButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportLost")}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="alert-circle-outline" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Lost Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.foundButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportFound")}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="search-outline" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Found Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Found Items</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Browse")} style={styles.seeAllButton}>
            <Text style={styles.seeAll}>See All</Text>
            <Ionicons name="chevron-forward" size={14} color={NAVY} />
          </TouchableOpacity>
        </View>

        {foundLoading ? (
          <Text style={styles.loadingText}>Loading found items...</Text>
        ) : foundItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={28} color="#d1d5db" />
            <Text style={styles.loadingText}>No found items available right now.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
            {foundItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("Browse")}
              >
                <View style={styles.itemIconBox}>
                  {item.photo_url ? (
                    <Image source={{ uri: item.photo_url }} style={styles.itemImage} />
                  ) : (
                    <Ionicons name="image-outline" size={22} color="#9ca3af" />
                  )}
                </View>
                <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Ionicons name="search-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Browse</Text>
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
  topBarIcons: { flexDirection: "row", gap: 10 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "white",
  },
  scrollContent: { padding: 20, paddingBottom: 30 },
  notifBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  notifIconBox: { marginRight: 12 },
  notifTextBox: { flex: 1 },
  notifTitle: { fontWeight: "800", color: "#15803d", fontSize: 13 },
  notifMessage: { color: "#16a34a", fontSize: 11.5, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 26 },
  lostButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  foundButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { color: "white", fontWeight: "800", fontSize: 13 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#1f2937" },
  seeAllButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAll: { fontSize: 12, fontWeight: "700", color: NAVY },
  loadingText: { color: "#9ca3af", fontSize: 13, marginTop: 8 },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 6,
  },
  itemsScroll: { marginBottom: 10 },
  itemCard: {
    width: 92,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%" },
  itemName: { fontSize: 11, fontWeight: "700", color: "#374151", textAlign: "center" },
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