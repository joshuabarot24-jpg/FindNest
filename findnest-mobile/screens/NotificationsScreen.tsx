import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";

const notifications = [
  {
    id: 1,
    type: "match",
    title: "AI Match Notification",
    message: "A matching item was found in the Canteen.",
    time: "10 minutes ago",
    read: false,
    icon: "🤖",
  },
  {
    id: 2,
    type: "status",
    title: "Claim Status Updated",
    message: "Your claim for \"Black Wallet\" is now under review.",
    time: "2 hours ago",
    read: false,
    icon: "📋",
  },
  {
    id: 3,
    type: "reminder",
    title: "Pickup Reminder",
    message: "Your approved item \"Student ID\" must be collected within 3 school days.",
    time: "5 hours ago",
    read: true,
    icon: "⏰",
  },
  {
    id: 4,
    type: "status",
    title: "Report Approved",
    message: "Your found item report \"Calculator\" has been approved by the admin.",
    time: "2 days ago",
    read: true,
    icon: "✅",
  },
  {
    id: 5,
    type: "system",
    title: "Welcome to FindNest",
    message: "Your student account has been successfully activated.",
    time: "1 week ago",
    read: true,
    icon: "🎉",
  },
];

export default function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setItems(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const iconColors: Record<string, string> = {
    match: "#ecfdf5",
    status: "#eff6ff",
    reminder: "#fefce8",
    system: "#f5f3ff",
  };

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

        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {items.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
            onPress={() => markAsRead(notif.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.notifIconBox, { backgroundColor: iconColors[notif.type] }]}>
              <Text style={styles.notifIcon}>{notif.icon}</Text>
            </View>
            <View style={styles.notifTextBox}>
              <View style={styles.notifTitleRow}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage}>{notif.message}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 35,
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: NAVY,
  },
  unreadBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  notifCardUnread: {
    backgroundColor: "#f5f7ff",
    borderColor: "#e0e7ff",
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notifIcon: {
    fontSize: 18,
  },
  notifTextBox: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#374151",
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  notifMessage: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
    lineHeight: 17,
  },
  notifTime: {
    fontSize: 10.5,
    color: "#9ca3af",
    marginTop: 6,
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
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 50,
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
  navLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
  },
});