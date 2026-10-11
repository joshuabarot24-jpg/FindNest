// [UX] Styled logout confirmation (same navy/red look as the web popup).
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ visible, busy, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="log-out-outline" size={28} color="#ef4444" />
          </View>
          <Text style={styles.title}>Log out?</Text>
          <Text style={styles.message}>Are you sure you want to log out of FindNest?</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={busy}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, busy && { opacity: 0.6 }]} onPress={onConfirm} disabled={busy}>
              <Text style={styles.confirmText}>{busy ? "Logging out..." : "Log out"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(13,23,87,0.7)", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { backgroundColor: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, alignItems: "center" },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "900", color: "#1a237e", marginBottom: 6 },
  message: { fontSize: 14, color: "#9ca3af", textAlign: "center", marginBottom: 24 },
  row: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  cancelText: { color: "#6b7280", fontWeight: "700" },
  confirmBtn: { flex: 1, backgroundColor: "#ef4444", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  confirmText: { color: "white", fontWeight: "700" },
});