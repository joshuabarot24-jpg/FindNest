import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { useUnreadCount } from "../lib/useUnreadCount";

const GREEN = "#0E4D34";

// Shared top bar: hamburger drawer, logo, live bell count, avatar
export default function StudentHeader({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { count } = useUnreadCount(navigation);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/profile");
        setPhoto(res.data.user?.profile_photo_url || null);
        setInitial((res.data.user?.name || "?").charAt(0).toUpperCase());
      } catch {}
    };
    load();
    const unsub = navigation?.addListener?.("focus", load);
    return () => { if (typeof unsub === "function") unsub(); };
  }, [navigation]);

  const goTo = (screen: string) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  return (
    <>
      <View style={styles.topBar}>
        <View style={styles.left}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={10}>
            <Ionicons name="menu" size={28} color={GREEN} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Image source={require("../assets/findnest-logo.png")} style={styles.logo} />
          <Text style={styles.brand}>FINDNEST</Text>
        </View>
        <View style={styles.right}>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={GREEN} />
            {count > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count > 9 ? "9+" : String(count)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate("Profile")} activeOpacity={0.85}>
            {photo ? <Image source={{ uri: photo }} style={styles.avatarImg} /> : <Text style={styles.avatarText}>{initial}</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.drawer, { paddingTop: insets.top + 20 }]}>
            <View style={styles.drawerBrand}>
              <Image source={require("../assets/findnest-logo.png")} style={styles.drawerLogo} />
              <View style={styles.drawerBrandCol}>
                <Text style={styles.drawerBrandText}>
                  FIND<Text style={styles.drawerBrandGold}>NEST</Text>
                </Text>
                <Text style={styles.drawerRole}>Student Portal</Text>
              </View>
            </View>
            {[
              { label: "Home", icon: "home-outline" as const, screen: "Home" },
              { label: "Claim Status", icon: "cube-outline" as const, screen: "ClaimStatus" },
              { label: "Support", icon: "chatbubbles-outline" as const, screen: "Support" },
              { label: "Student profile", icon: "person-outline" as const, screen: "Profile" },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.drawerItem} onPress={() => goTo(item.screen)} activeOpacity={0.8}>
                <Ionicons name={item.icon} size={22} color="white" />
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setMenuOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#F6FBF8", borderBottomWidth: 1, borderBottomColor: "#E3EEE7" },
  left: { width: 90, alignItems: "flex-start" },
  center: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  logo: { width: 30, height: 30, resizeMode: "contain" },
  brand: { fontFamily: "Inter_900Black", fontSize: 18, color: "#0B4F2C" },
  right: { width: 90, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  badge: { position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  badgeText: { color: "white", fontSize: 9, fontWeight: "800" },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  avatarText: { color: "white", fontWeight: "800", fontSize: 14 },
  overlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(17,20,36,0.6)" },
  drawer: { width: 270, backgroundColor: GREEN, paddingHorizontal: 18 },
  drawerBrand: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
  drawerLogo: { width: 48, height: 48, resizeMode: "contain", marginRight: 12 },
  drawerBrandCol: { flexDirection: "column", justifyContent: "center" },
  drawerBrandText: { fontFamily: "Inter_900Black", color: "#E2EFE9", fontSize: 20, lineHeight: 24, includeFontPadding: false },
  drawerBrandGold: { color: "#ffd700" },
  drawerRole: { fontFamily: "Inter_500Medium", color: "rgba(226,239,233,0.7)", fontSize: 12, lineHeight: 16, marginTop: 0, includeFontPadding: false },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14 },
  drawerItemText: { color: "white", fontSize: 15, fontWeight: "700" },
});