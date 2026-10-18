import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { useAutoRefresh } from "../lib/useAutoRefresh";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import StudentHeader from "../components/StudentHeader";
import StudentBottomNav from "../components/StudentBottomNav";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  match_id?: number | null;
}

const GREEN = "#0E4D34";
const SAGE = "#A8C3B4";
const MINT = "#EAF5EF";

// "Just now", "6 Hrs ago", "2 Days ago"
function formatTime(dateStr: string) {
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} Min${diffMins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `${hrs} Hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} Day${days === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsScreen({ navigation }: any) {
  useForcePasswordChange(navigation);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");

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

  useAutoRefresh(fetchNotifications);

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

  const q = query.trim().toLowerCase();
  const shown = items
    .filter((n) => (tab === "unread" ? !n.is_read : true))
    .filter((n) => !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StudentHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <Text style={styles.pageTitle}>Notifications</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#4b5563" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tabsRow}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === "all" && styles.tabOn]} onPress={() => setTab("all")}>
              <Text style={[styles.tabText, tab === "all" && styles.tabTextOn]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === "unread" && styles.tabOn]} onPress={() => setTab("unread")}>
              <Text style={[styles.tabText, tab === "unread" && styles.tabTextOn]}>
                {unreadCount > 0 ? `Unread (${unreadCount})` : "Unread"}
              </Text>
            </TouchableOpacity>
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} hitSlop={8}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.rule} />

        {loading ? (
          <Text style={styles.loadingText}>Loading notifications...</Text>
        ) : shown.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={32} color="#9FC5B0" />
            <Text style={styles.emptyText}>{tab === "unread" ? "No unread notifications" : "No notifications"}</Text>
          </View>
        ) : (
          shown.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.card, notif.is_read ? styles.cardRead : styles.cardUnread]}
              onPress={() => handleNotifPress(notif)}
              activeOpacity={0.8}
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardMessage}>{notif.message}</Text>
                <Text style={styles.cardTime}>{formatTime(notif.created_at)}</Text>
              </View>
              {!notif.is_read ? <View style={styles.dot} /> : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <StudentBottomNav navigation={navigation} active={"Home"} hideActive />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FBF8" },
  scrollContent: { padding: 20, paddingBottom: 30, backgroundColor: MINT, flexGrow: 1 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  titleBar: { width: 5, height: 24, borderRadius: 3, backgroundColor: "#2FD18B" },
  pageTitle: { fontSize: 20, fontWeight: "900", color: "#1f2937" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 13.5, color: "#1f2937" },

  tabsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tabs: { flexDirection: "row", gap: 22 },
  tab: { paddingVertical: 8, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: GREEN },
  tabText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  tabTextOn: { color: GREEN, fontWeight: "900" },
  markAllText: { fontSize: 12, fontWeight: "800", color: GREEN },
  rule: { height: 1, backgroundColor: "#CFE0D5", marginBottom: 14, marginTop: -1 },

  loadingText: { color: "#6b8f7c", fontSize: 13, textAlign: "center", marginTop: 20 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#6b8f7c", fontWeight: "700" },

  card: { flexDirection: "row", alignItems: "flex-start", backgroundColor: SAGE, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardUnread: { borderWidth: 1.5, borderColor: "rgba(14,77,52,0.45)" },
  cardRead: { opacity: 0.85 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14.5, fontWeight: "900", color: "#0A2618" },
  cardMessage: { fontSize: 12.5, color: "#1E3F2E", marginTop: 3, lineHeight: 18, fontWeight: "500" },
  cardTime: { fontSize: 10.5, color: "#3b4a43", marginTop: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#ef4444", marginTop: 4, marginLeft: 8 },
});