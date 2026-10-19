import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";
import { useAutoRefresh } from "../lib/useAutoRefresh";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import { useUnreadCount } from "../lib/useUnreadCount";
import StudentBottomNav from "../components/StudentBottomNav";

const GREEN = "#0E4D34";
const FOUND_GREEN = "#2E7D32";
const LOST_RED = "#E53935";
const MINT = "#EAF5EF";
const CARD_BG = "#F3FAF6";
const CARD_BORDER = "#BFE3CF";
const PAGE = 6;

const FAQ_ITEMS = [
  { q: "How do I report a lost item?", a: "Tap 'Lost something' on Home, upload a clear photo, and our AI will auto-fill the details. Confirm the category, date, and location, then submit." },
  { q: "How do I know if my item was found?", a: "You'll get a notification when the AI finds a possible match above the confidence threshold. Tap it to view the matched item and submit a claim." },
  { q: "How does the claim process work?", a: "After submitting a claim with a description and evidence photos, you may be asked a few verification questions. Admin reviews everything and makes the final decision." },
  { q: "What if my claim gets rejected?", a: "You can appeal with additional evidence. Your appeal will be reviewed by an administrator for a final decision." },
  { q: "Where do I pick up my item once approved?", a: "Visit the Guidance Office to collect it from Ms. Shelly S. Durban within the given pickup window shown on your Claim Status page." },
];

interface PublicLostReport {
  id: number;
  item_name: string;
  category: string;
  location_lost: string;
  date_lost: string;
  photo_url: string | null;
}

interface FoundRecord {
  id: number;
  admin_id?: number;
  item_name: string;
  category: string;
  status: string;
  photo_url: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Small, pre-blurred copy from Cloudinary (no blur work on the phone)
function blurred(url: string, width: number) {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/w_${width},e_blur:1500,q_auto/`) : url;
}

export default function HomeScreen({ navigation }: any) {
  useForcePasswordChange(navigation);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { count: unreadCount } = useUnreadCount(navigation);

  const scrollRef = useRef<ScrollView>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("?");
  const [userId, setUserId] = useState<number | null>(null);

  const [matchNotification, setMatchNotification] = useState<NotificationItem | null>(null);

  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [publicReports, setPublicReports] = useState<PublicLostReport[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PublicLostReport | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [foundRecords, setFoundRecords] = useState<FoundRecord[]>([]);
  const [foundLoading, setFoundLoading] = useState(true);

  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [isOverrideRequest, setIsOverrideRequest] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatSent, setChatSent] = useState(false);
  const [chatError, setChatError] = useState("");

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

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) {
      setChatError("Please type a message first.");
      return;
    }
    setChatError("");
    setChatSending(true);
    try {
      await api.post("/support", { message: chatMessage.trim(), is_override_request: isOverrideRequest });
      setChatMessage("");
      setIsOverrideRequest(false);
      setChatSent(true);
      setTimeout(() => setChatSent(false), 3000);
    } catch (err: any) {
      setChatError(err.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setChatSending(false);
    }
  };

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

  const fetchFoundReports = async () => {
    try {
      const response = await api.get("/found-items");
      setFoundRecords(response.data.records || []);
    } catch (err) {
      console.error("Error fetching found reports:", err);
    } finally {
      setFoundLoading(false);
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

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUserId(res.data.user?.id ?? null);
      setProfilePhoto(res.data.user?.profile_photo_url || null);
      setUserInitial((res.data.user?.name || "?").charAt(0).toUpperCase());
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchPublicReports();
    fetchFoundReports();
    fetchNotifications();
    fetchProfile();
  }, []);

  useAutoRefresh(() => {
    fetchPublicReports();
    fetchFoundReports();
    fetchNotifications();
    fetchProfile();
  });

  const filtered = publicReports;
  const visible = filtered.slice(0, shown);
  const myFound = foundRecords.filter((r) => r.admin_id === undefined || r.admin_id === userId);
  const cardWidth = (width - 40 - 20) / 3;

  const goTo = (screen: string) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topSideLeft}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={10}>
            <Ionicons name="menu" size={28} color={GREEN} />
          </TouchableOpacity>
        </View>
        <View style={styles.topCenter}>
          <Image source={require("../assets/findnest-logo.png")} style={styles.logoSmall} />
          <Text style={styles.brandText}>FindNest</Text>
        </View>
        <View style={styles.topSideRight}>
          <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate("Notifications")} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={GREEN} />
            {unreadCount > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : String(unreadCount)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate("Profile")} activeOpacity={0.85}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{userInitial}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero (no overlay wave, the photo shows clean) */}
        <ImageBackground
          source={require("../assets/landing-bg.jpg")}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroWash} />
          <View style={styles.heroContent}>
            <View>
              {[
                { top: -2, left: 0 },
                { top: 2, left: 0 },
                { top: 0, left: -2 },
                { top: 0, left: 2 },
                { top: -1.5, left: -1.5 },
                { top: -1.5, left: 1.5 },
                { top: 1.5, left: -1.5 },
                { top: 1.5, left: 1.5 },
              ].map((o, i) => (
                <Text key={i} style={[styles.heroTitle, styles.heroOutline, { top: o.top, left: o.left }]}>
                  NEVER LOST{"\n"}WHAT MATTERS{"\n"}MOST.
                </Text>
              ))}
              <Text style={styles.heroTitle}>NEVER LOST{"\n"}WHAT MATTERS{"\n"}MOST.</Text>
            </View>
            <Text style={styles.heroText}>
              FindNest uses advanced AI image recognition to match lost and found items on campus. Submit a report, get notified instantly.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          {matchNotification ? (
            <TouchableOpacity style={styles.notifBanner} activeOpacity={0.85} onPress={() => navigation.navigate("ClaimStatus")}>
              <View style={styles.notifIconBox}>
                <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
              </View>
              <View style={styles.notifTextBox}>
                <Text style={styles.notifTitle}>{matchNotification.title}</Text>
                <Text style={styles.notifMessage}>{matchNotification.message}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#16a34a" />
            </TouchableOpacity>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.lostButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportLost")}>
              <Ionicons name="warning" size={30} color="#FFD300" />
              <Text style={styles.actionText}>Lost something</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.foundButton} activeOpacity={0.85} onPress={() => navigation.navigate("ReportFound")}>
              <Ionicons name="search" size={30} color="white" />
              <Text style={styles.actionText}>Found Something</Text>
            </TouchableOpacity>
          </View>

          {/* Reported items */}
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Reported Items</Text>
              <Text style={styles.sectionCount}>
                {tab === "lost" ? `${publicReports.length} active` : `${myFound.length} yours`}
              </Text>
            </View>

            <View style={styles.tabsRow}>
              <TouchableOpacity style={[styles.tabBtn, tab === "lost" && styles.tabBtnOn]} onPress={() => setTab("lost")} activeOpacity={0.85}>
                <Text style={[styles.tabText, tab === "lost" && styles.tabTextOn]}>Reported Lost Items</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, tab === "found" && styles.tabBtnOn]} onPress={() => setTab("found")} activeOpacity={0.85}>
                <Text style={[styles.tabText, tab === "found" && styles.tabTextOn]}>Your Reported Found Items</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>
              {tab === "lost"
                ? "Items reported lost by students. Photos are blurred for privacy."
                : "Found items you reported. Only you and the admins can see these."}
            </Text>

            {tab === "lost" ? (
              publicLoading ? (
                <Text style={styles.loadingText}>Loading reports...</Text>
              ) : filtered.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="cube-outline" size={28} color="#9FC5B0" />
                  <Text style={styles.loadingText}>No active lost reports</Text>
                </View>
              ) : (
                <>
                  <View style={styles.grid}>
                    {visible.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.card, { width: cardWidth }]}
                        activeOpacity={0.85}
                        onPress={() => setSelectedItem(item)}
                      >
                        <View style={styles.cardImageBox}>
                          {item.photo_url ? (
                            <Image source={{ uri: blurred(item.photo_url, 200) }} style={styles.cardImage} resizeMode="contain" />
                          ) : (
                            <Ionicons name="image-outline" size={24} color="#9FC5B0" />
                          )}
                        </View>
                        <Text style={styles.cardName} numberOfLines={1}>{item.item_name}</Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>{item.category}</Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>{formatDate(item.date_lost)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {filtered.length > shown ? (
                    <TouchableOpacity style={styles.moreButton} onPress={() => setShown(shown + PAGE)} activeOpacity={0.85}>
                      <Text style={styles.moreText}>Show more</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )
            ) : foundLoading ? (
              <Text style={styles.loadingText}>Loading reports...</Text>
            ) : myFound.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="cube-outline" size={28} color="#9FC5B0" />
                <Text style={styles.loadingText}>You have no reported found items</Text>
              </View>
            ) : (
              <>
                <View style={styles.grid}>
                  {myFound.slice(0, shown).map((rec) => (
                    <View key={rec.id} style={[styles.card, { width: cardWidth }]}>
                      <View style={styles.cardImageBox}>
                        {rec.photo_url ? (
                          <Image source={{ uri: rec.photo_url }} style={styles.cardImage} resizeMode="contain" />
                        ) : (
                          <Ionicons name="image-outline" size={24} color="#9FC5B0" />
                        )}
                      </View>
                      <Text style={styles.cardName} numberOfLines={1}>{rec.item_name}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>{rec.category}</Text>
                      <Text style={styles.cardStatus} numberOfLines={1}>{(rec.status || "").replace(/_/g, " ")}</Text>
                    </View>
                  ))}
                </View>
                {myFound.length > shown ? (
                  <TouchableOpacity style={styles.moreButton} onPress={() => setShown(shown + PAGE)} activeOpacity={0.85}>
                    <Text style={styles.moreText}>Show more</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Item preview */}
      <Modal visible={!!selectedItem} animationType="slide" transparent onRequestClose={() => setSelectedItem(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedItem(null)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {selectedItem ? (
              <>
                <View style={styles.modalIconBox}>
                  {selectedItem.photo_url ? (
                    <Image source={{ uri: blurred(selectedItem.photo_url, 400) }} style={styles.modalImage} resizeMode="contain" />
                  ) : (
                    <Ionicons name="image-outline" size={30} color="#9FC5B0" />
                  )}
                </View>
                <Text style={styles.modalItemName}>{selectedItem.item_name}</Text>
                <Text style={styles.modalItemLocation}>Last seen: {selectedItem.location_lost}</Text>
                <Text style={styles.modalItemDate}>{formatDate(selectedItem.date_lost)}</Text>

                <View style={styles.modalNote}>
                  <Ionicons name="information-circle-outline" size={16} color={GREEN} style={{ marginBottom: 4 }} />
                  <Text style={styles.modalNoteText}>
                    Recognize this item? Report it as found. Our AI will automatically check for a match.
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Hamburger drawer */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawer, { paddingTop: insets.top + 20 }]}>
            <View style={styles.drawerBrand}>
              <Image source={require("../assets/findnest-logo.png")} style={styles.drawerLogo} />
              <Text style={styles.drawerBrandText}>FindNest</Text>
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

      {/* Chatbot */}
      {!chatbotOpen ? (
        <TouchableOpacity
          style={[styles.chatbotFab, { bottom: 85 + insets.bottom }]}
          activeOpacity={0.85}
          onPress={() => setChatbotOpen(true)}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="white" />
        </TouchableOpacity>
      ) : null}

      <Modal visible={chatbotOpen} animationType="slide" transparent onRequestClose={() => setChatbotOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.chatModalOverlay}>
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
                      {openFaqIndex === idx ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
                    </View>
                  ))}
                  <Text style={styles.faqOrAsk}>Or ask me your own question below!</Text>
                  <TouchableOpacity
                    style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: GREEN, backgroundColor: "white", borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16 }}
                    activeOpacity={0.85}
                    onPress={() => { setShowMessageBox(true); setIsOverrideRequest(true); }}
                  >
                    <Ionicons name="construct-outline" size={18} color={GREEN} />
                    <Text style={{ color: GREEN, fontWeight: "800", fontSize: 12.5 }}>Request Manual AI Override</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 10.5, color: "#6b8f7c", textAlign: "center", marginTop: 6 }}>
                    Photo unclear and the AI can&apos;t read it? Tap here to ask the office.
                  </Text>
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
              {chatThinking ? (
                <View style={[styles.chatBubbleWrap, { alignItems: "flex-start" }]}>
                  <View style={[styles.chatBubble, styles.chatBubbleBot]}>
                    <Text style={styles.chatBubbleBotText}>Typing...</Text>
                  </View>
                </View>
              ) : null}
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
            <TouchableOpacity onPress={() => setShowMessageBox(!showMessageBox)}>
              <Text style={styles.chatFallbackLink}>{showMessageBox ? "Hide" : "Still need help? Send a message to the office"}</Text>
            </TouchableOpacity>
            {showMessageBox ? (
              <View style={{ paddingHorizontal: 12, paddingBottom: 14 }}>
                <TouchableOpacity style={{ flexDirection: "row", gap: 8, marginBottom: 8 }} onPress={() => setIsOverrideRequest(!isOverrideRequest)} activeOpacity={0.8}>
                  <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: GREEN, backgroundColor: isOverrideRequest ? GREEN : "white", alignItems: "center", justifyContent: "center" }}>
                    {isOverrideRequest ? <Ionicons name="checkmark" size={12} color="white" /> : null}
                  </View>
                  <Text style={{ flex: 1, fontSize: 10.5, color: "#6b7280", lineHeight: 15 }}>
                    This is a request for a manual AI override. My photo is unclear and the AI cannot analyze it, so I need to fill in details manually.
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={{ backgroundColor: MINT, borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 12, padding: 12, fontSize: 12.5, color: "#374151", minHeight: 70, marginBottom: 8 }}
                  placeholder={isOverrideRequest ? "Explain why your photo isn't clear..." : "Type your message here..."}
                  placeholderTextColor="#9ca3af"
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  multiline
                  textAlignVertical="top"
                />
                {chatError ? <Text style={{ color: "#ef4444", fontSize: 10.5, fontWeight: "700", marginBottom: 6 }}>{chatError}</Text> : null}
                {chatSent ? <Text style={{ color: "#16a34a", fontSize: 10.5, fontWeight: "700", marginBottom: 6 }}>Message sent!</Text> : null}
                <TouchableOpacity style={{ backgroundColor: GREEN, borderRadius: 999, paddingVertical: 12, alignItems: "center", opacity: chatSending ? 0.5 : 1 }} onPress={handleSendMessage} disabled={chatSending}>
                  <Text style={{ color: "white", fontWeight: "800", fontSize: 12.5 }}>
                    {chatSending ? "Sending..." : isOverrideRequest ? "Send Override Request" : "Send Message to Office"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <StudentBottomNav navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E3EEE7",
  },
  topSideLeft: { width: 90, alignItems: "flex-start" },
  topCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  logoSmall: { width: 30, height: 30, resizeMode: "contain" },
  brandText: { fontFamily: "Montserrat_800ExtraBold", fontSize: 18, color: "#0B4F2C" },
  topSideRight: { width: 90, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  bellButton: { padding: 2 },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadgeText: { color: "white", fontSize: 9, fontWeight: "800" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "white", fontWeight: "800", fontSize: 14 },

  scrollContent: { paddingBottom: 30, backgroundColor: MINT },

  hero: { width: "100%", minHeight: 340, justifyContent: "center", overflow: "hidden", backgroundColor: "#cfe8f5" },
  heroImage: { top: -300, height: "200%" },
  heroWash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.32)" },
  heroContent: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 30 },
  heroTitle: { fontFamily: "Montserrat_800ExtraBold", fontSize: 30, color: "#0B4F2C", lineHeight: 36, letterSpacing: 0.8, textTransform: "uppercase" },
  heroOutline: { position: "absolute", color: "#FFFFFF" },
  heroText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#0A3021", lineHeight: 20, marginTop: 12, maxWidth: "88%" },

  body: { paddingHorizontal: 20, paddingTop: 16 },

  notifBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  notifIconBox: { marginRight: 12 },
  notifTextBox: { flex: 1 },
  notifTitle: { fontWeight: "800", color: "#15803d", fontSize: 13 },
  notifMessage: { color: "#16a34a", fontSize: 11.5, marginTop: 2 },

  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  lostButton: {
    flex: 1,
    backgroundColor: LOST_RED,
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  foundButton: {
    flex: 1,
    backgroundColor: FOUND_GREEN,
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  actionText: { color: "white", fontWeight: "800", fontSize: 14 },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionBar: { width: 5, height: 22, borderRadius: 3, backgroundColor: "#2FD18B" },
  sectionTitle: { flex: 1, fontSize: 17, fontWeight: "900", color: "#1f2937" },
  sectionCount: { fontSize: 11, color: "#6b8f7c", fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, color: "#6b8f7c", marginBottom: 12 },
  loadingText: { color: "#6b8f7c", fontSize: 13, marginTop: 8 },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    gap: 6,
  },

  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#E3EEE7" },
  tabBtnOn: { backgroundColor: GREEN },
  tabText: { fontSize: 11, fontWeight: "700", color: "#4B6358" },
  tabTextOn: { color: "#FFFFFF" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    padding: 6,
  },
  cardImageBox: {
    width: "100%",
    height: 78,
    borderRadius: 12,
    backgroundColor: "#E3EEE7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 6,
  },
  cardImage: { width: "100%", height: "100%" },
  cardName: { fontSize: 11.5, fontWeight: "900", color: GREEN },
  cardMeta: { fontSize: 9.5, color: "#6b8f7c", marginTop: 1 },
  cardStatus: { fontSize: 9.5, color: GREEN, fontWeight: "800", marginTop: 1, textTransform: "capitalize" },

  moreButton: {
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 26,
  },
  moreText: { color: "white", fontWeight: "800", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", justifyContent: "flex-end" },
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
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: "#E3EEE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  modalImage: { width: "100%", height: "100%" },
  modalItemName: { fontSize: 17, fontWeight: "900", color: GREEN, marginBottom: 4 },
  modalItemLocation: { fontSize: 13, color: "#6b7280" },
  modalItemDate: { fontSize: 11.5, color: "#9ca3af", marginBottom: 18, marginTop: 2 },
  modalNote: { backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 20, width: "100%", alignItems: "center" },
  modalNoteText: { fontSize: 12, color: GREEN, lineHeight: 17, textAlign: "center" },
  modalCloseButton: { paddingVertical: 6 },
  modalCloseText: { color: "#6b7280", fontWeight: "700", fontSize: 13 },

  drawerOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(17,20,36,0.6)" },
  drawer: { width: 270, backgroundColor: GREEN, paddingHorizontal: 18 },
  drawerBrand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
  drawerLogo: { width: 40, height: 40, resizeMode: "contain" },
  drawerBrandText: { fontFamily: "Montserrat_800ExtraBold", color: "white", fontSize: 22 },
  drawerItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14 },
  drawerItemText: { color: "white", fontSize: 15, fontWeight: "700" },

  chatbotFab: { position: "absolute", right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  chatModalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17,20,36,0.6)" },
  chatPanel: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "85%", overflow: "hidden" },
  chatHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: GREEN, paddingHorizontal: 18, paddingVertical: 16 },
  chatHeaderIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  chatHeaderTitle: { color: "white", fontSize: 13.5, fontWeight: "800" },
  chatHeaderSubtitle: { color: "#DCEFEA", fontSize: 10.5 },
  chatBody: { flex: 1, backgroundColor: MINT },
  faqSectionLabel: { fontSize: 10, fontWeight: "800", color: "#6b8f7c", textTransform: "uppercase", marginBottom: 8 },
  faqItem: { backgroundColor: "white", borderWidth: 1, borderColor: "#E3EEE7", borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  faqQuestionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 },
  faqQuestion: { fontSize: 12, fontWeight: "700", color: "#374151", flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 11.5, color: "#6b7280", lineHeight: 16, paddingHorizontal: 12, paddingBottom: 12 },
  faqOrAsk: { fontSize: 11.5, color: "#6b8f7c", textAlign: "center", marginTop: 8 },
  chatBubbleWrap: { marginBottom: 8 },
  chatBubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, maxWidth: "85%" },
  chatBubbleUser: { backgroundColor: GREEN },
  chatBubbleBot: { backgroundColor: "white", borderWidth: 1, borderColor: "#E3EEE7" },
  chatBubbleUserText: { color: "white", fontSize: 12.5, lineHeight: 17 },
  chatBubbleBotText: { color: "#374151", fontSize: 12.5, lineHeight: 17 },
  chatInputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#E3EEE7" },
  chatInput: { flex: 1, backgroundColor: MINT, borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 12, paddingHorizontal: 14, fontSize: 12.5, color: "#374151" },
  chatSendButton: { backgroundColor: GREEN, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  chatSendButtonText: { color: "white", fontWeight: "800", fontSize: 12 },
  chatFallbackLink: { color: GREEN, fontSize: 10.5, fontWeight: "700", textAlign: "center", paddingBottom: 14 },
});