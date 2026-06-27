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

export default function ProfileScreen({ navigation }: any) {
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
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
            <View style={styles.iconBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
            <Text style={styles.iconText}>🛠️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.studentName}>Chabas Kevin O. Soriano</Text>
          <Text style={styles.studentInfo}>BS IT | 2022-10043</Text>

          {/* Trust Score Ring */}
          <View style={styles.trustBox}>
            <View style={styles.trustRing}>
              <Text style={styles.trustScore}>95</Text>
            </View>
            <Text style={styles.trustLabel}>TRUST SCORE</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Filed</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={[styles.statNumber, styles.statNumberGreen]}>2</Text>
            <Text style={styles.statLabel}>Recovered</Text>
          </View>
          <View style={[styles.statCard, styles.statCardYellow]}>
            <Text style={[styles.statNumber, styles.statNumberYellow]}>1</Text>
            <Text style={styles.statLabel}>Returned</Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student ID</Text>
            <Text style={styles.detailValue}>2022-10043</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Course</Text>
            <Text style={styles.detailValue}>BS Information Technology</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year Level</Text>
            <Text style={styles.detailValue}>4th Year</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValueGreen}>Active</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate("Landing")}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>👤</Text>
          <Text style={styles.navLabelActive}>Profile</Text>
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
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "900",
    color: NAVY,
    textAlign: "center",
  },
  studentInfo: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 16,
  },
  trustBox: {
    alignItems: "center",
  },
  trustRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  trustScore: {
    fontSize: 20,
    fontWeight: "900",
    color: "#16a34a",
  },
  trustLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#9ca3af",
    marginTop: 6,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statCardGreen: {
    backgroundColor: "#ecfdf5",
  },
  statCardYellow: {
    backgroundColor: "#fefce8",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: NAVY,
  },
  statNumberGreen: {
    color: "#16a34a",
  },
  statNumberYellow: {
    color: "#ca8a04",
  },
  statLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#374151",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 12.5,
    color: "#9ca3af",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 12.5,
    color: "#374151",
    fontWeight: "700",
  },
  detailValueGreen: {
    fontSize: 12.5,
    color: "#16a34a",
    fontWeight: "800",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  editButton: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  editButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#6b7280",
    fontWeight: "800",
    fontSize: 14,
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