import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const GREEN = "#0E4D34";
const MUTED = "#7a9a89";

type Tab = "Home" | "ClaimStatus" | "Profile";

// Shared bottom bar with a small line above the active tab
export default function StudentBottomNav({ navigation, active, hideActive = false }: { navigation: any; active: Tab; hideActive?: boolean }) {
  const insets = useSafeAreaInsets();
  const items: { key: Tab; label: string; icon: any; iconActive: any }[] = [
    { key: "Home", label: "Home", icon: "home-outline", iconActive: "home" },
    { key: "ClaimStatus", label: "Claim Status", icon: "cube-outline", iconActive: "cube" },
    { key: "Profile", label: "Student profile", icon: "person-outline", iconActive: "person" },
  ];
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10, paddingTop: 4 }]}>
      {items.map((it) => {
        const on = !hideActive && it.key === active;
        return (
          <TouchableOpacity key={it.key} style={styles.item} onPress={() => navigation.navigate(it.key)} activeOpacity={0.8}>
            <View style={[styles.line, on && styles.lineOn]} />
            <Ionicons name={on ? it.iconActive : it.icon} size={22} color={on ? GREEN : MUTED} />
            <Text style={on ? styles.labelOn : styles.label}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#E3EEE7" },
  item: { flex: 1, alignItems: "center", gap: 3, paddingBottom: 2 },
  line: { width: 28, height: 3, borderRadius: 2, backgroundColor: "transparent", marginBottom: 7 },
  lineOn: { backgroundColor: GREEN },
  label: { fontSize: 10, color: MUTED, fontWeight: "600" },
  labelOn: { fontSize: 10, color: GREEN, fontWeight: "800" },
});