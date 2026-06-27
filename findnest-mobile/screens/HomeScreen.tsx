import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";

const recentFoundItems = [
  { name: "Keys", icon: "❓" },
  { name: "Student ID", icon: "❓" },
  { name: "Aqua Flask", icon: "❓" },
  { name: "Calculator", icon: "❓" },
];

export default function HomeScreen({ navigation }: any) {
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
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.iconBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
            <Text style={styles.iconText}>🛠️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* AI Match Notification */}
        <View style={styles.notifBanner}>
          <View style={styles.notifIconBox}>
            <Text style={styles.notifIcon}>🤖</Text>
          </View>
          <View style={styles.notifTextBox}>
            <Text style={styles.notifTitle}>AI Match Found!</Text>
            <Text style={styles.notifMessage}>
              A "Blue Umbrella" matches your report.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.lostButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportLost")}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Lost Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.foundButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportFound")}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Found Item</Text>
          </TouchableOpacity>
        </View>

        {/* Recently Found Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Found Items</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
          {recentFoundItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.itemCard}>
              <View style={styles.itemIconBox}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Browse")}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Browse</Text>
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
const GOLD = "#ffd700";

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
  topBarIcons: {
    flexDirection: "row",
    gap: 10,
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
  iconBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  notifBanner: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  notifIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#22c55e",
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
  notifTitle: {
    fontWeight: "800",
    color: "#15803d",
    fontSize: 13,
  },
  notifMessage: {
    color: "#16a34a",
    fontSize: 11.5,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },
  lostButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
  },
  foundButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  actionText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1f2937",
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },
  itemsScroll: {
    marginBottom: 10,
  },
  itemCard: {
    width: 90,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  itemIcon: {
    fontSize: 22,
  },
  itemName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 60,
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