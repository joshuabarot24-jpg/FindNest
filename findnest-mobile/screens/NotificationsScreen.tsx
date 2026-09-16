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

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function iconFor(type: string) {
  const t = type?.toLowerCase() || "";
  if (t.includes("match")) return "checkmark-circle-outline";
  if (t.includes("reject")) return "close-circle-outline";
  if (t.includes("support")) return "chatbubble-ellipses-outline";
  if (t.includes("status") || t.includes("claim")) return "document-text-outline";
  return "notifications-outline";
}

function cardStyleFor(type: string) {
  const t = type?.toLowerCase() || "";
  if (t.includes("match")) return { bg: "#f0fdf4", border: "#bbf7d0" };
  if (t.includes("reject")) return { bg: "#fef2f2", border: "#fecaca" };
  if (t.includes("support")) return { bg: "#f5f3ff", border: "#ddd6fe" };
  if (t.includes("status") || t.includes("claim")) return { bg: "#eff6ff", border: "#bfdbfe" };
  return { bg: "#f8f9fc", border: "#f0f0f0" };
}

const NAVY = "#1a237e";

export default function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setItems(response.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotifPress = (notif: NotificationItem) => {
    if (!notif.is_read) markAsRead(notif.id);
    const t = notif.type?.toLowerCase() || "";
    if (t.includes("support")) {
      navigation.navigate("Support");
    } else if (t.includes("match") || t.includes("status") || t.includes("reminder") || t.includes("claim")) {
      navigation.navigate("ClaimStatus");
    }
  };

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

        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading notifications...</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={32} color="#d1d5db" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          items.map((notif) => {
            const cardStyle = cardStyleFor(notif.type);
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard,
                  { backgroundColor: notif.is_read ? "white" : cardStyle.bg, borderColor: notif.is_read ? "#f0f0f0" : cardStyle.border },
                ]}
                onPress={() => handleNotifPress(notif)}
                activeOpacity={0.7}
              >
                <View style={styles.notifIconBox}>
                  <Ionicons name={iconFor(notif.type) as any} size={20} color={NAVY} />
                </View>
                <View style={styles.notifTextBox}>
                  <View style={styles.notifTitleRow}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {!notif.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{formatTime(notif.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
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
  scrollContent: { padding: 20, paddingBottom: 30 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY },
  unreadBadge: { backgroundColor: "#eff6ff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  unreadBadgeText: { fontSize: 11, fontWeight: "800", color: "#2563eb" },
  markAllButton: { alignSelf: "flex-end", marginBottom: 14 },
  markAllText: { fontSize: 12, fontWeight: "800", color: NAVY },
  loadingText: { color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 },
  notifCard: { flexDirection: "row", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  notifIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(26,35,126,0.08)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  notifTextBox: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifTitle: { fontSize: 13.5, fontWeight: "800", color: "#374151" },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#3b82f6" },
  notifMessage: { fontSize: 12, color: "#6b7280", marginTop: 3, lineHeight: 17 },
  notifTime: { fontSize: 10.5, color: "#9ca3af", marginTop: 6 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#9ca3af", fontWeight: "700" },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});