import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import StudentHeader from "../components/StudentHeader";
import StudentBottomNav from "../components/StudentBottomNav";

const GREEN = "#0F4C3A";
const MINT = "#EAF5EF";

interface StreamItem {
  key: string;
  kind: "message" | "reply" | "system";
  sender?: "student" | "admin";
  text: string;
  at: string;
  is_override_request?: boolean;
  override_status?: string | null;
  pending?: boolean;
  failed?: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function SupportScreen({ navigation }: any) {
  useForcePasswordChange(navigation);

  const [items, setItems] = useState<StreamItem[]>([]);
  const [temps, setTemps] = useState<StreamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  const fetchConversation = async () => {
    try {
      const res = await api.get("/support/my-conversation");
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching the conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
    const timer = setInterval(fetchConversation, 5000);
    return () => clearInterval(timer);
  }, []);

  const shown = [...items, ...temps];

  // The message appears at once, then is confirmed by the server
  const send = async (retry?: StreamItem) => {
    const body = (retry ? retry.text : text).trim();
    if (!body) return;
    const key = retry ? retry.key : `tmp-${Date.now()}`;
    if (retry) setTemps((prev) => prev.map((t) => (t.key === key ? { ...t, failed: false, pending: true } : t)));
    else {
      setTemps((prev) => [...prev, { key, kind: "message", sender: "student", text: body, at: new Date().toISOString(), pending: true }]);
      setText("");
    }
    try {
      await api.post("/support/send", { message: body });
      await fetchConversation();
      setTemps((prev) => prev.filter((t) => t.key !== key));
    } catch (err) {
      setTemps((prev) => prev.map((t) => (t.key === key ? { ...t, pending: false, failed: true } : t)));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StudentHeader navigation={navigation} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleBar} />
            <Text style={styles.pageTitle}>Support</Text>
          </View>

          <View style={styles.contactCard}>
            <Ionicons name="person-outline" size={18} color={GREEN} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>Guidance Office &middot; Ms. Shelly S. Durban</Text>
              <Text style={styles.contactSub}>Mon-Fri, 8AM - 5PM &middot; findnest@sjdmcci.edu.ph</Text>
            </View>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading conversation...</Text>
          ) : shown.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={30} color="#9FC5B0" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>Write below to contact the Guidance Office.</Text>
            </View>
          ) : (
            shown.map((m) =>
              m.kind === "system" ? (
                <Text key={m.key} style={styles.systemText}>{m.text}</Text>
              ) : m.is_override_request ? (
                <View key={m.key} style={styles.overrideCard}>
                  <Text style={styles.overrideTitle}>Manual AI override request</Text>
                  <Text style={styles.overrideText}>{m.text}</Text>
                  <Text style={styles.overrideStatus}>Status: {m.override_status || "pending"}</Text>
                </View>
              ) : (
                <View key={m.key} style={[styles.row, m.sender === "student" ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
                  <Text style={styles.meta}>
                    {m.sender === "student" ? "You" : "Guidance Office"} &middot; {m.pending ? "Sending..." : formatTime(m.at)}
                  </Text>
                  <View style={[styles.bubble, m.sender === "student" ? styles.bubbleMine : styles.bubbleOffice, m.pending && { opacity: 0.6 }]}>
                    <Text style={m.sender === "student" ? styles.textMine : styles.textOffice}>{m.text}</Text>
                  </View>
                  {m.failed ? (
                    <TouchableOpacity onPress={() => send(m)}>
                      <Text style={styles.retry}>Not sent. Tap to retry.</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )
            )
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#6b8f7c"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && { opacity: 0.5 }]}
            onPress={() => send()}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <StudentBottomNav navigation={navigation} active="Home" hideActive />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FBF8" },
  scrollContent: { padding: 20, paddingBottom: 12, backgroundColor: MINT, flexGrow: 1, gap: 10 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  titleBar: { width: 5, height: 24, borderRadius: 3, backgroundColor: "#2FD18B" },
  pageTitle: { fontSize: 20, fontWeight: "900", color: "#1f2937" },

  contactCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#D9E8DF" },
  contactName: { fontSize: 12.5, fontWeight: "800", color: "#1f2937" },
  contactSub: { fontSize: 10.5, color: "#6b7280", marginTop: 2 },

  loadingText: { color: "#6b8f7c", fontSize: 12.5, marginVertical: 8 },
  empty: { alignItems: "center", paddingVertical: 30, gap: 4 },
  emptyText: { color: "#1f2937", fontWeight: "800", fontSize: 14, marginTop: 4 },
  emptySub: { color: "#6b7280", fontSize: 11.5, textAlign: "center" },

  systemText: { textAlign: "center", color: "#9ca3af", fontSize: 11 },
  row: { maxWidth: "100%" },
  meta: { fontSize: 10.5, color: "#6b7280", marginBottom: 3 },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: GREEN, borderTopRightRadius: 4 },
  bubbleOffice: { backgroundColor: "#F1F5F9", borderTopLeftRadius: 4 },
  textMine: { color: "white", fontSize: 13, lineHeight: 18 },
  textOffice: { color: "#1e293b", fontSize: 13, lineHeight: 18 },
  retry: { color: "#DC2626", fontSize: 11, fontWeight: "800", marginTop: 3 },

  overrideCard: { alignSelf: "flex-end", maxWidth: "88%", backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", borderRadius: 16, padding: 12 },
  overrideTitle: { fontSize: 11.5, fontWeight: "800", color: "#92400E" },
  overrideText: { fontSize: 11.5, color: "#B45309", marginTop: 4, lineHeight: 16 },
  overrideStatus: { fontSize: 11, fontWeight: "800", color: "#92400E", marginTop: 6, textTransform: "capitalize" },

  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#D9E8DF" },
  input: { flex: 1, maxHeight: 110, backgroundColor: "#F3FAF6", borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: "#374151" },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
});