import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";
import { getAuth } from "../lib/auth";

const NAVY = "#1a237e";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  const fetchThread = async (id: number) => {
    setThreadLoading(true);
    try {
      const res = await api.get(`/support/${id}/thread`);
      setReplies(res.data.replies || []);
    } catch (err) {
      console.error("Error fetching thread:", err);
    } finally {
      setThreadLoading(false);
    }
  };

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
      fetchThread(id);
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setReplySending(false);
    }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={30}
      >
        {!conversationsLoading && myMessages.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Your Conversations</Text>
            <Text style={styles.sectionSubtitle}>Messages you've sent and replies from the Guidance Office</Text>

            {myMessages.map((msg) => (
              <View key={msg.id} style={styles.messageBlock}>
                <TouchableOpacity style={styles.messageHeader} onPress={() => handleExpand(msg)}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.messageTitleRow}>
                      <Text style={styles.messagePreview} numberOfLines={1}>{msg.message}</Text>
                      {msg.status === "responded" && (
                        <View style={styles.repliedBadge}>
                          <Text style={styles.repliedBadgeText}>REPLIED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
                  </View>
                  <Ionicons
                    name={expandedId === msg.id ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>

                {expandedId === msg.id && (
                  <View style={styles.threadArea}>
                    <View style={styles.originalMessageBox}>
                      <Text style={styles.originalMessageText}>{msg.message}</Text>
                    </View>

                    {threadLoading ? (
                      <Text style={styles.loadingText}>Loading conversation...</Text>
                    ) : (
                      replies.map((r) => (
                        <View
                          key={r.id}
                          style={[
                            styles.replyBubble,
                            r.sender_type === "admin" ? styles.replyBubbleAdmin : styles.replyBubbleStudent,
                          ]}
                        >
                          <Text style={styles.replySender}>
                            {r.sender_type === "admin" ? "Guidance Office" : "You"} &middot; {formatTime(r.created_at)}
                          </Text>
                          <Text style={styles.replyText}>{r.message}</Text>
                        </View>
                      ))
                    )}

                    <View style={styles.replyInputRow}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Type your reply..."
                        placeholderTextColor="#9ca3af"
                        value={replyText}
                        onChangeText={setReplyText}
                      />
                      <TouchableOpacity
                        style={styles.replySendButton}
                        onPress={() => handleSendReply(msg.id)}
                        disabled={replySending || !replyText.trim()}
                      >
                        <Text style={styles.replySendButtonText}>{replySending ? "..." : "Reply"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Send a Message</Text>
          <Text style={styles.sectionSubtitle}>Can't find what you're looking for? Send us a message.</Text>

          {submitted ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={36} color="#22c55e" style={{ marginBottom: 8 }} />
              <Text style={styles.successTitle}>Message Sent!</Text>
              <Text style={styles.successText}>The Guidance Office will get back to you within 1-2 school days.</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => { setSubmitted(false); setMessage(""); }}
              >
                <Text style={styles.actionButtonText}>Send Another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your concern or question..."
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSubmit}
                disabled={loading || !message.trim()}
              >
                <Text style={styles.actionButtonText}>{loading ? "Sending..." : "Send Message"}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Guidance Counselor</Text>
              <Text style={styles.contactValue}>Ms. Shelly S. Durban</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={NAVY} style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValueLink}>findnest@sjdmcci.edu.ph</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={18} color="#9ca3af" style={styles.contactIcon} />
            <View>
              <Text style={styles.contactLabel}>Office Hours</Text>
              <Text style={styles.contactValue}>Mon-Fri, 8AM - 5PM</Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
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
  scrollContent: { padding: 20, paddingBottom: 30 },
  sectionCard: { backgroundColor: "white", borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#f0f0f0" },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: NAVY },
  sectionSubtitle: { fontSize: 11, color: "#9ca3af", marginTop: 3, marginBottom: 14, lineHeight: 15 },
  messageBlock: { borderWidth: 1, borderColor: "#f3f4f6", borderRadius: 14, marginBottom: 10, overflow: "hidden" },
  messageHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
  messageTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  messagePreview: { fontSize: 12.5, fontWeight: "700", color: "#374151", flexShrink: 1 },
  repliedBadge: { backgroundColor: "#f0fdf4", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  repliedBadgeText: { fontSize: 8.5, fontWeight: "800", color: "#16a34a" },
  messageTime: { fontSize: 10.5, color: "#9ca3af", marginTop: 3 },
  threadArea: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  originalMessageBox: { backgroundColor: "#f8f9fc", borderRadius: 12, padding: 12 },
  originalMessageText: { fontSize: 12.5, color: "#374151", lineHeight: 18 },
  loadingText: { color: "#9ca3af", fontSize: 12 },
  replyBubble: { borderRadius: 12, padding: 12 },
  replyBubbleAdmin: { backgroundColor: "#eef2ff", marginRight: 24 },
  replyBubbleStudent: { backgroundColor: "#f8f9fc", marginLeft: 24 },
  replySender: { fontSize: 9.5, fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 },
  replyText: { fontSize: 12.5, color: "#374151", lineHeight: 17 },
  replyInputRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  replyInput: { flex: 1, backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 12.5, color: "#374151" },
  replySendButton: { backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  replySendButtonText: { color: "white", fontWeight: "800", fontSize: 12 },
  fieldLabel: { fontSize: 11.5, fontWeight: "800", color: "#374151", marginBottom: 6 },
  textArea: { backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 13, color: "#374151", minHeight: 100, marginBottom: 12 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  actionButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "800", fontSize: 13.5 },
  successBox: { alignItems: "center", paddingVertical: 10 },
  successTitle: { fontSize: 15, fontWeight: "900", color: NAVY, marginBottom: 4 },
  successText: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 16 },
  contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  contactIcon: { marginRight: 12, marginTop: 2 },
  contactLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "700" },
  contactValue: { fontSize: 12.5, color: "#374151", fontWeight: "700", marginTop: 2 },
  contactValueLink: { fontSize: 12.5, color: NAVY, fontWeight: "800", marginTop: 2, textDecorationLine: "underline" },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
});