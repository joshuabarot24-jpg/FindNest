import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { getAuth } from "../lib/auth";
import { useAutoRefresh } from "../lib/useAutoRefresh";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import StudentHeader from "../components/StudentHeader";
import StudentBottomNav from "../components/StudentBottomNav";

const GREEN = "#0E4D34";
const MINT = "#EAF5EF";
const CARD = "#F3FAF6";
const OUTLINE = "#CFE6D8";
const SAGE = "#B9CBBF";

interface SupportMessage {
  id: number;
  message: string;
  status: string;
  created_at: string;
}

interface SupportReplyItem {
  id: number;
  sender_type: "student" | "admin";
  message: string;
  created_at: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function SupportScreen({ navigation }: any) {
  useForcePasswordChange(navigation);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [myMessages, setMyMessages] = useState<SupportMessage[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replies, setReplies] = useState<SupportReplyItem[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getAuth();
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    };
    loadUser();
  }, []);

  const fetchMyMessages = async () => {
    try {
      const res = await api.get("/support/my-messages");
      setMyMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching my messages:", err);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMessages();
  }, []);

  // showSpinner is false for background refreshes so the open thread doesn't flicker
  const fetchThread = async (id: number, showSpinner = true) => {
    if (showSpinner) setThreadLoading(true);
    try {
      const res = await api.get(`/support/${id}/thread`);
      setReplies(res.data.replies || []);
    } catch (err) {
      console.error("Error fetching thread:", err);
    } finally {
      if (showSpinner) setThreadLoading(false);
    }
  };

  useAutoRefresh(() => {
    fetchMyMessages();
    if (expandedId !== null) fetchThread(expandedId, false);
  });

  const handleExpand = (msg: SupportMessage) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(msg.id);
    setReplyText("");
    fetchThread(msg.id);
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      await api.post(`/support/${id}/reply`, { message: replyText.trim() });
      setReplyText("");
      fetchThread(id, false);
      fetchMyMessages();
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setReplySending(false);
    }
  };

  const openCompose = () => {
    setSubmitted(false);
    setMessage("");
    setError("");
    setComposeOpen(true);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/support", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      fetchMyMessages();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StudentHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <Text style={styles.pageTitle}>Support</Text>
        </View>

        <TouchableOpacity style={styles.composeButton} onPress={openCompose} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={styles.composeText}>Send a Message</Text>
        </TouchableOpacity>

        {/* Conversations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Conversations</Text>
          <Text style={styles.cardSub}>Messages you&apos;ve sent and replies from the Guidance Office</Text>

          {conversationsLoading ? (
            <Text style={styles.loadingText}>Loading conversations...</Text>
          ) : myMessages.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={30} color="#9FC5B0" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySub}>Tap Send a Message to contact the Guidance Office.</Text>
            </View>
          ) : (
            myMessages.map((msg) => (
              <View key={msg.id} style={styles.messageBlock}>
                <TouchableOpacity style={styles.messageHeader} onPress={() => handleExpand(msg)} activeOpacity={0.8}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.messageTitleRow}>
                      <Text style={styles.messagePreview} numberOfLines={1}>{msg.message}</Text>
                      {msg.status === "responded" ? (
                        <View style={styles.repliedBadge}>
                          <Text style={styles.repliedBadgeText}>REPLIED</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
                  </View>
                  <Ionicons name={expandedId === msg.id ? "chevron-up" : "chevron-down"} size={18} color="#6b8f7c" />
                </TouchableOpacity>

                {expandedId === msg.id ? (
                  <View style={styles.threadArea}>
                    <View style={styles.yourBubble}>
                      <Text style={styles.bubbleSender}>You</Text>
                      <Text style={styles.bubbleText}>{msg.message}</Text>
                    </View>

                    {threadLoading ? (
                      <Text style={styles.loadingText}>Loading conversation...</Text>
                    ) : (
                      replies.map((r) => (
                        <View key={r.id} style={r.sender_type === "admin" ? styles.adminBubble : styles.yourBubble}>
                          <Text style={[styles.bubbleSender, r.sender_type === "admin" && { color: "#1E3F2E" }]}>
                            {r.sender_type === "admin" ? "Guidance Office" : "You"} &middot; {formatTime(r.created_at)}
                          </Text>
                          <Text style={[styles.bubbleText, r.sender_type === "admin" && { color: "#0A2618", fontWeight: "600" }]}>
                            {r.message}
                          </Text>
                        </View>
                      ))
                    )}

                    <View style={styles.replyInputRow}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Type your reply..."
                        placeholderTextColor="#6b8f7c"
                        value={replyText}
                        onChangeText={setReplyText}
                      />
                      <TouchableOpacity
                        style={[styles.replySendButton, (replySending || !replyText.trim()) && { opacity: 0.5 }]}
                        onPress={() => handleSendReply(msg.id)}
                        disabled={replySending || !replyText.trim()}
                      >
                        <Text style={styles.replySendButtonText}>{replySending ? "..." : "Reply"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* Contact information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>

          <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={18} color={GREEN} style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Guidance Counselor</Text>
              <Text style={styles.contactValue}>Ms. Shelly S. Durban</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={GREEN} style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValueLink}>findnest@sjdmcci.edu.ph</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={18} color={GREEN} style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Office Hours</Text>
              <Text style={styles.contactValue}>Mon-Fri, 8AM - 5PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Send a message popup */}
      <Modal visible={composeOpen} animationType="slide" transparent onRequestClose={() => setComposeOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setComposeOpen(false)}>
                <Text style={styles.modalCloseText}>&times;</Text>
              </TouchableOpacity>

              {submitted ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={40} color="#22c55e" style={{ marginBottom: 8 }} />
                  <Text style={styles.successTitle}>Message Sent!</Text>
                  <Text style={styles.successText}>The Guidance Office will get back to you within 1-2 school days.</Text>
                  <TouchableOpacity style={styles.actionButton} onPress={() => setComposeOpen(false)}>
                    <Text style={styles.actionButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Send a Message</Text>
                  <Text style={styles.cardSub}>Can&apos;t find what you&apos;re looking for? Send us a message.</Text>

                  <Text style={styles.fieldLabel}>Message</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your concern or question..."
                    placeholderTextColor="#6b8f7c"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  <TouchableOpacity
                    style={[styles.actionButton, (loading || !message.trim()) && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={loading || !message.trim()}
                  >
                    <Text style={styles.actionButtonText}>{loading ? "Sending..." : "Send Message"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <StudentBottomNav navigation={navigation} active="Home" hideActive />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FBF8" },
  scrollContent: { padding: 20, paddingBottom: 30, backgroundColor: MINT, flexGrow: 1 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  titleBar: { width: 5, height: 24, borderRadius: 3, backgroundColor: "#2FD18B" },
  pageTitle: { fontSize: 20, fontWeight: "900", color: "#1f2937" },

  composeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 16,
  },
  composeText: { color: "white", fontWeight: "800", fontSize: 14 },

  card: { backgroundColor: "white", borderRadius: 22, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#D9E8DF" },
  cardTitle: { fontSize: 15, fontWeight: "900", color: GREEN },
  cardSub: { fontSize: 11, color: "#6b7280", marginTop: 3, marginBottom: 12, lineHeight: 15 },

  loadingText: { color: "#6b8f7c", fontSize: 12.5, marginVertical: 8 },
  empty: { alignItems: "center", paddingVertical: 20, gap: 4 },
  emptyText: { color: "#1f2937", fontWeight: "800", fontSize: 14, marginTop: 4 },
  emptySub: { color: "#6b7280", fontSize: 11.5, textAlign: "center" },

  messageBlock: { borderWidth: 1.5, borderColor: OUTLINE, backgroundColor: CARD, borderRadius: 18, marginBottom: 10, overflow: "hidden" },
  messageHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
  messageTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  messagePreview: { fontSize: 12.5, fontWeight: "800", color: "#0A2618", flexShrink: 1 },
  repliedBadge: { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  repliedBadgeText: { fontSize: 8.5, fontWeight: "800", color: "white" },
  messageTime: { fontSize: 10.5, color: "#6b7280", marginTop: 3 },

  threadArea: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  yourBubble: { backgroundColor: "white", borderRadius: 14, padding: 12, marginLeft: 22 },
  adminBubble: { backgroundColor: SAGE, borderRadius: 14, padding: 12, marginRight: 22 },
  bubbleSender: { fontSize: 9.5, fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  bubbleText: { fontSize: 12.5, color: "#374151", lineHeight: 17 },

  replyInputRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  replyInput: { flex: 1, backgroundColor: "white", borderWidth: 1.5, borderColor: OUTLINE, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12.5, color: "#374151" },
  replySendButton: { backgroundColor: GREEN, borderRadius: 999, paddingHorizontal: 18, justifyContent: "center" },
  replySendButtonText: { color: "white", fontWeight: "800", fontSize: 12 },

  contactRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 12 },
  contactIcon: { marginRight: 12, marginTop: 2 },
  contactLabel: { fontSize: 11, color: "#6b7280", fontWeight: "700" },
  contactValue: { fontSize: 12.5, color: "#1f2937", fontWeight: "700", marginTop: 2 },
  contactValueLink: { fontSize: 12.5, color: GREEN, fontWeight: "800", marginTop: 2, textDecorationLine: "underline" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", justifyContent: "flex-end", paddingTop: 60 },
  modalScroll: { justifyContent: "flex-end", flexGrow: 1 },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 34, paddingBottom: 36 },
  modalClose: { position: "absolute", top: 14, right: 18, zIndex: 10, padding: 6 },
  modalCloseText: { fontSize: 24, color: "#9ca3af", fontWeight: "700" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: GREEN },

  fieldLabel: { fontSize: 11.5, fontWeight: "800", color: "#374151", marginBottom: 6 },
  textArea: { backgroundColor: CARD, borderWidth: 1.5, borderColor: OUTLINE, borderRadius: 16, padding: 14, fontSize: 13, color: "#374151", minHeight: 110, marginBottom: 12 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  actionButton: { backgroundColor: GREEN, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "800", fontSize: 13.5 },
  successBox: { alignItems: "center", paddingVertical: 10 },
  successTitle: { fontSize: 17, fontWeight: "900", color: GREEN, marginBottom: 4 },
  successText: { fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 16 },
});