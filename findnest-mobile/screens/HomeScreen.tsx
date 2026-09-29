import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";

const FAQ_ITEMS = [
  { q: "How do I report a lost item?", a: "Tap 'Report Lost' on Home, upload a clear photo, and our AI will auto-fill the details. Confirm the category, date, and location, then submit." },
  { q: "How do I know if my item was found?", a: "You'll get a notification when the AI finds a possible match above the confidence threshold. Tap it to view the matched item and submit a claim." },
  { q: "How does the claim process work?", a: "After submitting a claim with a description and evidence photos, you may be asked a few verification questions. Admin reviews everything and makes the final decision." },
  { q: "What if my claim gets rejected?", a: "You can appeal with additional evidence. Your appeal will be reviewed by an administrator for a final decision." },
  { q: "Where do I pick up my item once approved?", a: "Visit the Guidance Office to collect it from Ms. Shelly S. Durban within the given pickup window shown on your Claim Status page." },
];

interface LostReport {
  id: number;
  item_name: string;
  status: string;
  photo_url: string | null;
}

interface PublicLostReport {
  id: number;
  item_name: string;
  category: string;
  location_lost: string;
  date_lost: string;
  photo_url: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

const NAVY = "#1a237e";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function HomeScreen({ navigation }: any) {
  const [matchNotification, setMatchNotification] = useState<NotificationItem | null>(null);

  const [publicReports, setPublicReports] = useState<PublicLostReport[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PublicLostReport | null>(null);
  const insets = useSafeAreaInsets();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleAskChatbot = async () => {
    const question = chatInput.trim();
    if (!question) return;
    setChatHistory((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatThinking(true);
    try {
      const res = await api.post("/support/ask", { question });
      setChatHistory((prev) => [...prev, { role: "bot", text: res.data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again or send us a message below." }]);
    } finally {
      setChatThinking(false);
    }
  };

  useEffect(() => {

    const fetchPublicReports = async () => {
      try {
        const response = await api.get("/lost-items", { params: { status: "searching" } });
        setPublicReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching public reports:", err);
      } finally {
        setPublicLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications: NotificationItem[] = response.data.notifications || [];
        const unreadMatch = notifications.find(
          (n) => !n.is_read && n.type?.toLowerCase().includes("match")
        );
        setMatchNotification(unreadMatch || null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchPublicReports();
    fetchNotifications();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require("../assets/icon.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>
            FIND<Text style={styles.brandAccent}>NEST</Text>
          </Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            {matchNotification && <View style={styles.iconBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {matchNotification && (
          <TouchableOpacity
            style={styles.notifBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ClaimStatus")}
          >
            <View style={styles.notifIconBox}>
              <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
            </View>
            <View style={styles.notifTextBox}>
              <Text style={styles.notifTitle}>{matchNotification.title}</Text>
              <Text style={styles.notifMessage}>{matchNotification.message}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#16a34a" />
          </TouchableOpacity>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.lostButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportLost")}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="alert-circle-outline" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Lost Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.foundButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportFound")}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="search-outline" size={26} color="white" />
            </View>
            <Text style={styles.actionText}>Found Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Report Items</Text>
          <Text style={styles.sectionCount}>{publicReports.length} active</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Items reported lost by other students &mdash; photos blurred for privacy</Text>

        {publicLoading ? (
          <Text style={styles.loadingText}>Loading reports...</Text>
        ) : publicReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={28} color="#d1d5db" />
            <Text style={styles.loadingText}>No active lost reports</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.publicScroll}>
            {publicReports.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.publicCard}
                activeOpacity={0.85}
                onPress={() => setSelectedItem(item)}
              >
                <View style={styles.publicImageBox}>
                  {item.photo_url ? (
                    <Image
                      source={{ uri: item.photo_url }}
                      style={styles.publicImage}
                      blurRadius={40}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={22} color="#9ca3af" />
                  )}
                </View>
                <Text style={styles.publicItemName} numberOfLines={1}>{item.item_name}</Text>
                <Text style={styles.publicCategory}>{item.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            {selectedItem && (
              <>
                <View style={styles.modalIconBox}>
                  {selectedItem.photo_url ? (
                    <Image source={{ uri: selectedItem.photo_url }} style={styles.modalImage} blurRadius={25} />
                  ) : (
                    <Ionicons name="image-outline" size={30} color="#9ca3af" />
                  )}
                </View>
                <Text style={styles.modalItemName}>{selectedItem.item_name}</Text>
                <Text style={styles.modalItemLocation}>Last seen: {selectedItem.location_lost}</Text>
                <Text style={styles.modalItemDate}>{formatDate(selectedItem.date_lost)}</Text>

                <View style={styles.modalNote}>
                  <Ionicons name="information-circle-outline" size={16} color="#1e40af" style={{ marginBottom: 4 }} />
                  <Text style={styles.modalNoteText}>
                    Recognize this item? Report it as found — our AI will automatically check for a match.
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
            </Modal>

      {!chatbotOpen && (
        <TouchableOpacity
          style={[styles.chatbotFab, { bottom: 75 + insets.bottom }]}
          activeOpacity={0.85}
          onPress={() => setChatbotOpen(true)}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={chatbotOpen} animationType="slide" transparent onRequestClose={() => setChatbotOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.chatModalOverlay}
        >
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.chatHeaderIcon}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>FindNest Assistant</Text>
                  <Text style={styles.chatHeaderSubtitle}>Ask me how FindNest works</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setChatbotOpen(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatBody} contentContainerStyle={{ padding: 14 }}>
              {chatHistory.length === 0 ? (
                <View>
                  <Text style={styles.faqSectionLabel}>Common Questions</Text>
                  {FAQ_ITEMS.map((item, idx) => (
                    <View key={idx} style={styles.faqItem}>
                      <TouchableOpacity style={styles.faqQuestionRow} onPress={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}>
                        <Text style={styles.faqQuestion}>{item.q}</Text>
                        <Ionicons name={openFaqIndex === idx ? "chevron-up" : "chevron-down"} size={16} color="#9ca3af" />
                      </TouchableOpacity>
                      {openFaqIndex === idx && <Text style={styles.faqAnswer}>{item.a}</Text>}
                    </View>
                  ))}
                  <Text style={styles.faqOrAsk}>Or ask me your own question below!</Text>
                </View>
              ) : (
                chatHistory.map((msg, idx) => (
                  <View key={idx} style={[styles.chatBubbleWrap, msg.role === "user" ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
                    <View style={[styles.chatBubble, msg.role === "user" ? styles.chatBubbleUser : styles.chatBubbleBot]}>
                      <Text style={msg.role === "user" ? styles.chatBubbleUserText : styles.chatBubbleBotText}>{msg.text}</Text>
                    </View>
                  </View>
                ))
              )}
              {chatThinking && (
                <View style={[styles.chatBubbleWrap, { alignItems: "flex-start" }]}>
                  <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                    <Text style={styles.chatBubbleBotText}>Typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your question..."
                placeholderTextColor="#9ca3af"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleAskChatbot}
              />
              <TouchableOpacity style={styles.chatSendButton} onPress={handleAskChatbot} disabled={chatThinking || !chatInput.trim()}>
                <Text style={styles.chatSendButtonText}>Ask</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { setChatbotOpen(false); navigation.navigate("Support"); }}>
              <Text style={styles.chatFallbackLink}>Still need help? Send a message to the office</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Home</Text>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontSize: 16, fontWeight: "900", color: NAVY },
  brandAccent: { color: "#c99700" },
  topBarIcons: { flexDirection: "row", gap: 10 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "white",
  },
  scrollContent: { padding: 20, paddingBottom: 30 },
  notifBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  notifIconBox: { marginRight: 12 },
  notifTextBox: { flex: 1 },
  notifTitle: { fontWeight: "800", color: "#15803d", fontSize: 13 },
  notifMessage: { color: "#16a34a", fontSize: 11.5, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 26 },
  lostButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  foundButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { color: "white", fontWeight: "800", fontSize: 13 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#1f2937" },
  sectionCount: { fontSize: 11, color: "#9ca3af", fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, color: "#9ca3af", marginBottom: 14 },
  loadingText: { color: "#9ca3af", fontSize: 13, marginTop: 8 },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 6,
    marginBottom: 10,
  },
  reportsList: { gap: 10, marginBottom: 28 },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%" },
  reportTextBox: { flex: 1 },
  reportName: { fontSize: 13.5, fontWeight: "800", color: "#374151" },
  reportStatus: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  publicScroll: { marginBottom: 6 },
  publicCard: {
    width: 110,
    marginRight: 12,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  publicImageBox: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 6,
  },
  publicImage: { width: "100%", height: "100%" },
  publicItemName: { fontSize: 11.5, fontWeight: "800", color: "#374151" },
  publicCategory: { fontSize: 9.5, color: "#9ca3af", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    alignItems: "center",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", marginBottom: 20 },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  modalImage: { width: "100%", height: "100%" },
  modalItemName: { fontSize: 17, fontWeight: "900", color: NAVY, marginBottom: 4 },
  modalItemLocation: { fontSize: 13, color: "#9ca3af" },
  modalItemDate: { fontSize: 11.5, color: "#c1c7d6", marginBottom: 18, marginTop: 2 },
  modalNote: { backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, marginBottom: 20, width: "100%", alignItems: "center" },
  modalNoteText: { fontSize: 12, color: "#1e40af", lineHeight: 17, textAlign: "center" },
  modalCloseButton: { paddingVertical: 6 },
  modalCloseText: { color: "#9ca3af", fontWeight: "700", fontSize: 13 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 10,
    paddingBottom: 16,
  },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
  chatbotFab: { position: "absolute", right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: NAVY, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  chatModalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(13,19,63,0.5)" },
  chatPanel: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "75%", overflow: "hidden" },
  chatHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: NAVY, paddingHorizontal: 18, paddingVertical: 16 },
  chatHeaderIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  chatHeaderTitle: { color: "white", fontSize: 13.5, fontWeight: "800" },
  chatHeaderSubtitle: { color: "#c7d2fe", fontSize: 10.5 },
  chatBody: { flex: 1, backgroundColor: "#f8f9fc" },
  faqSectionLabel: { fontSize: 10, fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", marginBottom: 8 },
  faqItem: { backgroundColor: "white", borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  faqQuestionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 },
  faqQuestion: { fontSize: 12, fontWeight: "700", color: "#374151", flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 11.5, color: "#6b7280", lineHeight: 16, paddingHorizontal: 12, paddingBottom: 12 },
  faqOrAsk: { fontSize: 11.5, color: "#9ca3af", textAlign: "center", marginTop: 8 },
  chatBubbleWrap: { marginBottom: 8 },
  chatBubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, maxWidth: "85%" },
  chatBubbleUser: { backgroundColor: NAVY },
  chatBubbleBot: { backgroundColor: "white", borderWidth: 1, borderColor: "#f0f0f0" },
  chatBubbleUserText: { color: "white", fontSize: 12.5, lineHeight: 17 },
  chatBubbleBotText: { color: "#374151", fontSize: 12.5, lineHeight: 17 },
  chatInputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  chatInput: { flex: 1, backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, fontSize: 12.5, color: "#374151" },
  chatSendButton: { backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  chatSendButtonText: { color: "white", fontWeight: "800", fontSize: 12 },
  chatFallbackLink: { color: NAVY, fontSize: 10.5, fontWeight: "700", textAlign: "center", paddingBottom: 14 },
});