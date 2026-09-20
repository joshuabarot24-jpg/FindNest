import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";

const NAVY = "#1a237e";

interface OwnershipQuestion {
  id: number;
  student_answer: string | null;
}

interface Claim {
  id: number;
  claim_status: string;
  proof_description: string;
  admin_notes: string | null;
  created_at: string;
  claimed_at: string | null;
  pickup_deadline: string | null;
  collected_at: string | null;
  appeal_message: string | null;
  appeal_status: string | null;
  ownership_questions?: OwnershipQuestion[];
  match: {
    lost_report: { item_name: string; location_lost: string } | null;
    found_record: { item_name: string; location_found: string } | null;
  } | null;
}

interface PendingMatch {
  id: number;
  confidence_score: number;
  match_status: string;
  matched_at: string;
  lost_item: {
    item_name: string;
    category: string;
    location_lost: string;
  };
}

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  student_answer: string | null;
}

const TIMELINE_STEPS = ["Submitted", "Under AI Review", "Matched", "Claim Submitted", "Pending Verification", "Approved", "Returned"];

function currentStepIndex(status: string, collectedAt: string | null): number {
  if (collectedAt) return 7;
  switch (status) {
    case "approved":
      return 5;
    case "pending":
    default:
      return 4;
  }
}

function questionsAnswered(claim: Claim): boolean {
  return !!(claim.ownership_questions && claim.ownership_questions.length > 0 && claim.ownership_questions.every((q) => q.student_answer !== null));
}

function statusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "abandoned":
      return "Abandoned";
    default:
      return "Under Review";
  }
}

function statusColors(status: string) {
  switch (status) {
    case "approved":
      return { text: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
    case "rejected":
      return { text: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
    case "abandoned":
      return { text: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
    default:
      return { text: "#ca8a04", bg: "#fefce8", border: "#fef08a" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function daysRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ClaimStatusScreen({ navigation }: any) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  const [claimingMatch, setClaimingMatch] = useState<PendingMatch | null>(null);
  const [proofDescription, setProofDescription] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [appealingClaim, setAppealingClaim] = useState<Claim | null>(null);
  const [appealMessage, setAppealMessage] = useState("");
  const [appealPhotoPreview, setAppealPhotoPreview] = useState<string | null>(null);
  const [appealPhotoUrl, setAppealPhotoUrl] = useState<string | null>(null);
  const [appealPhotoUploading, setAppealPhotoUploading] = useState(false);
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealError, setAppealError] = useState("");

  const [answeringClaim, setAnsweringClaim] = useState<Claim | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answersSubmitting, setAnswersSubmitting] = useState(false);
  const [answersError, setAnswersError] = useState("");
  const [answersResult, setAnswersResult] = useState<{ correct: number; total: number } | null>(null);

  const fetchClaims = async () => {
    try {
      const response = await api.get("/claims/my-claims");
      setClaims(response.data.claims || []);
    } catch (err) {
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMatches = async () => {
    try {
      const response = await api.get("/ai-matches/my-matches");
      setPendingMatches(response.data.matches || []);
    } catch (err) {
      console.error("Error fetching pending matches:", err);
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPendingMatches();
  }, []);

  const handleSubmitClaim = async () => {
    if (!claimingMatch) return;
    if (!proofDescription.trim()) {
      setClaimError("Please describe why you believe this item is yours.");
      return;
    }
    setClaimError("");
    setClaimSubmitting(true);
    try {
      await api.post("/claims", {
        match_id: claimingMatch.id,
        proof_description: proofDescription.trim(),
      });
      setClaimingMatch(null);
      setProofDescription("");
      fetchClaims();
      fetchPendingMatches();
    } catch (err: any) {
      setClaimError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(", ") ||
          "Failed to submit claim. Please try again."
      );
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleAppealPhotoUpload = async (uri: string) => {
    setAppealPhotoPreview(uri);
    setAppealPhotoUploading(true);
    setAppealPhotoUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", { uri, name: "appeal.jpg", type: "image/jpeg" } as any);
      formData.append("folder", "appeal-evidence");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAppealPhotoUrl(res.data.url);
    } catch (err: any) {
      console.error("Appeal photo upload failed:", err);
      setAppealPhotoPreview(null);
      setAppealError(err.response?.data?.message || "Photo upload failed. Please try again.");
    } finally {
      setAppealPhotoUploading(false);
    }
  };

  const pickAppealPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) handleAppealPhotoUpload(result.assets[0].uri);
  };

  const handleSubmitAppeal = async () => {
    if (!appealingClaim) return;
    if (!appealMessage.trim()) {
      setAppealError("Please provide additional evidence or explanation for your appeal.");
      return;
    }
    setAppealError("");
    setAppealSubmitting(true);
    try {
      await api.post(`/claims/${appealingClaim.id}/appeal`, {
        appeal_message: appealMessage.trim(),
        appeal_photo_url: appealPhotoUrl,
      });
      setAppealingClaim(null);
      setAppealMessage("");
      setAppealPhotoPreview(null);
      setAppealPhotoUrl(null);
      setAnsweringClaim(null);
      fetchClaims();
    } catch (err: any) {
      setAppealError(err.response?.data?.message || "Failed to submit appeal. Please try again.");
    } finally {
      setAppealSubmitting(false);
    }
  };

  const openAppealModal = (claim: Claim) => {
    setAppealingClaim(claim);
    setAppealMessage("");
    setAppealPhotoPreview(null);
    setAppealPhotoUrl(null);
    setAppealError("");
  };

  const openAnswerModal = async (claim: Claim) => {
    setAnsweringClaim(claim);
    setAnswers({});
    setAnswersError("");
    setAnswersResult(null);
    setQuestionsLoading(true);
    try {
      const res = await api.get(`/claims/${claim.id}/questions`);
      const fetchedQuestions: Question[] = res.data.questions || [];
      setQuestions(fetchedQuestions);

      const alreadyAnswered = fetchedQuestions.length > 0 && fetchedQuestions.every((q) => q.student_answer !== null);
      if (alreadyAnswered) {
        const correct = fetchedQuestions.filter((q) => q.student_answer !== null).length;
        setAnswersResult({ correct, total: fetchedQuestions.length });
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitAnswers = async () => {
    if (!answeringClaim) return;
    if (Object.keys(answers).length < questions.length) {
      setAnswersError("Please answer all questions before submitting.");
      return;
    }
    setAnswersError("");
    setAnswersSubmitting(true);
    try {
      const payload = { answers: questions.map((q) => ({ question_id: q.id, answer: answers[q.id] })) };
      const res = await api.post(`/claims/${answeringClaim.id}/answers`, payload);
      setAnswersResult({ correct: res.data.correct_count, total: res.data.total_count });
      fetchClaims();
    } catch (err: any) {
      setAnswersError(err.response?.data?.message || "Failed to submit answers. Please try again.");
    } finally {
      setAnswersSubmitting(false);
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
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
          <Ionicons name="help-circle-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageTitle}>Claim Status</Text>
        <Text style={styles.pageSubtitle}>Track the progress of your ownership claims</Text>

        {!matchesLoading && pendingMatches.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionHeading}>Possible Matches for Your Lost Items</Text>
            {pendingMatches.map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchItemName}>{match.lost_item.item_name}</Text>
                  <Text style={styles.matchSubtext}>{match.confidence_score}% confidence &middot; {match.lost_item.category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.submitClaimButton}
                  onPress={() => { setClaimingMatch(match); setProofDescription(""); setClaimError(""); }}
                >
                  <Text style={styles.submitClaimButtonText}>Submit Claim</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading claims...</Text>
        ) : claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
            <Text style={styles.emptyText}>No claims submitted yet</Text>
          </View>
        ) : (
          claims.map((claim) => {
            const item = claim.match?.found_record || claim.match?.lost_report;
            const itemName = item?.item_name || "Unknown Item";
            const step = currentStepIndex(claim.claim_status, claim.collected_at);
            const isTerminal = ["rejected", "abandoned"].includes(claim.claim_status);
            const canAppeal = claim.claim_status === "rejected" && !claim.appeal_status;
            const colors = statusColors(claim.claim_status);
            const answered = questionsAnswered(claim);

            return (
              <View key={claim.id} style={styles.claimCard}>
                <View style={styles.claimHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.claimItemName}>{itemName}</Text>
                    <Text style={styles.claimSubmittedDate}>Submitted {formatDate(claim.created_at)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.statusPillText, { color: colors.text }]}>{statusLabel(claim.claim_status)}</Text>
                  </View>
                </View>

                {!isTerminal ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
                    {TIMELINE_STEPS.map((label, idx) => {
                      const stepNum = idx + 1;
                      const isActive = stepNum <= step;
                      return (
                        <View key={label} style={styles.timelineStepWrap}>
                          <View style={[styles.timelineCircle, isActive && styles.timelineCircleActive]}>
                            <Text style={[styles.timelineCircleText, isActive && styles.timelineCircleTextActive]}>{stepNum}</Text>
                          </View>
                          <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>{label}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : claim.claim_status === "rejected" ? (
                  <View style={styles.rejectedBox}>
                    <Text style={styles.rejectedTitle}>Claim Rejected</Text>
                    {claim.admin_notes && <Text style={styles.rejectedText}>Reason: {claim.admin_notes}</Text>}
                    {claim.appeal_status === "pending" && (
                      <Text style={styles.appealPendingText}>Your appeal is under super-admin review.</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.abandonedBox}>
                    <Text style={styles.abandonedTitle}>Claim Abandoned</Text>
                    <Text style={styles.abandonedText}>Pickup window expired without collection. Item returned to unclaimed status.</Text>
                  </View>
                )}

                {claim.claim_status === "pending" && !answered && (
                  <TouchableOpacity style={styles.answerQuestionsButton} onPress={() => openAnswerModal(claim)}>
                    <Text style={styles.answerQuestionsButtonText}>Answer Verification Questions</Text>
                  </TouchableOpacity>
                )}

                {claim.claim_status === "approved" && !claim.collected_at && claim.pickup_deadline && (
                  <View style={styles.pickupBox}>
                    <Text style={styles.pickupTitle}>Item Ready for Pickup</Text>
                    <Text style={styles.pickupText}>
                      Collect by {formatDate(claim.pickup_deadline)}
                      {daysRemaining(claim.pickup_deadline) >= 0
                        ? ` (${daysRemaining(claim.pickup_deadline)} day${daysRemaining(claim.pickup_deadline) === 1 ? "" : "s"} left)`
                        : " — deadline passed"}
                    </Text>
                  </View>
                )}

                {claim.collected_at && (
                  <View style={styles.returnedBox}>
                    <Text style={styles.returnedTitle}>Item Returned</Text>
                    <Text style={styles.returnedText}>Collected on {formatDate(claim.collected_at)}</Text>
                  </View>
                )}

                {canAppeal && (
                  <TouchableOpacity
                    style={styles.appealButton}
                    onPress={() => openAppealModal(claim)}
                  >
                    <Text style={styles.appealButtonText}>Appeal This Decision</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionLabel}>Your Description</Text>
                  <Text style={styles.descriptionText}>{claim.proof_description}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!claimingMatch} animationType="slide" transparent onRequestClose={() => setClaimingMatch(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.modalScrollContent}
            enableOnAndroid={true}
            extraScrollHeight={30}
          >
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseX} onPress={() => setClaimingMatch(null)}>
                <Text style={styles.modalCloseXText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Submit Claim</Text>
              <Text style={styles.modalSubtitle}>For your reported "{claimingMatch?.lost_item.item_name}"</Text>

              <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                  Describe specific details only the true owner would know. You will also be asked verification questions after submitting.
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Your Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe why you believe this item belongs to you..."
                placeholderTextColor="#9ca3af"
                value={proofDescription}
                onChangeText={setProofDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {claimError ? <Text style={styles.errorText}>{claimError}</Text> : null}

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitClaim} disabled={claimSubmitting}>
                <Text style={styles.primaryButtonText}>{claimSubmitting ? "Submitting..." : "Submit Claim"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <Modal visible={!!appealingClaim} animationType="slide" transparent onRequestClose={() => setAppealingClaim(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.modalScrollContent}
            enableOnAndroid={true}
            extraScrollHeight={30}
          >
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseX} onPress={() => setAppealingClaim(null)}>
                <Text style={styles.modalCloseXText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Appeal Rejected Claim</Text>
              <Text style={styles.modalSubtitle}>This will be escalated to the Super Admin for final review</Text>

              <Text style={styles.fieldLabel}>Additional Evidence or Explanation</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Provide new evidence or explain why you believe this decision should be reconsidered..."
                placeholderTextColor="#9ca3af"
                value={appealMessage}
                onChangeText={setAppealMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Supporting Photo (Optional)</Text>
              <TouchableOpacity style={styles.appealPhotoBox} onPress={pickAppealPhoto} disabled={appealPhotoUploading}>
                {appealPhotoUploading ? (
                  <Text style={styles.appealPhotoText}>Uploading...</Text>
                ) : appealPhotoPreview ? (
                  <>
                    <Image source={{ uri: appealPhotoPreview }} style={styles.appealPhotoPreview} />
                    {appealPhotoUrl && <Text style={styles.appealPhotoUploadedText}>Uploaded successfully</Text>}
                  </>
                ) : (
                  <Text style={styles.appealPhotoText}>Tap to attach a photo the admin can review</Text>
                )}
              </TouchableOpacity>

              {appealError ? <Text style={styles.errorText}>{appealError}</Text> : null}

              <TouchableOpacity
                style={styles.appealSubmitButton}
                onPress={handleSubmitAppeal}
                disabled={appealSubmitting || appealPhotoUploading}
              >
                <Text style={styles.primaryButtonText}>{appealSubmitting ? "Submitting..." : "Submit Appeal"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <Modal visible={!!answeringClaim} animationType="slide" transparent onRequestClose={() => setAnsweringClaim(null)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseX} onPress={() => setAnsweringClaim(null)}>
                <Text style={styles.modalCloseXText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Ownership Verification</Text>
              <Text style={styles.modalSubtitle}>Answer these questions to help confirm you're the true owner</Text>

              {questionsLoading ? (
                <Text style={styles.loadingText}>Loading questions...</Text>
              ) : questions.length === 0 ? (
                <Text style={styles.loadingText}>No verification questions were generated for this claim.</Text>
              ) : answersResult ? (
                <View style={[styles.resultBox, answersResult.correct >= 2 ? styles.resultBoxGood : styles.resultBoxWarn]}>
                  <Text style={[styles.resultScore, answersResult.correct >= 2 ? styles.resultScoreGood : styles.resultScoreWarn]}>
                    {answersResult.correct}/{answersResult.total} Correct
                  </Text>
                  <Text style={styles.resultText}>
                    {answersResult.correct >= 2
                      ? "Your answers have been recorded. The admin will review your full claim."
                      : "Your answers have been recorded, but not all were correct. The admin will still review your claim."}
                  </Text>
                  <View style={styles.resultButtonRow}>
                    <TouchableOpacity
                      style={styles.resultCloseButton}
                      onPress={() => setAnsweringClaim(null)}
                    >
                      <Text style={styles.resultCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                    {answeringClaim && answeringClaim.claim_status === "rejected" && !answeringClaim.appeal_status && (
                      <TouchableOpacity
                        style={styles.resultAppealButton}
                        onPress={() => openAppealModal(answeringClaim)}
                      >
                        <Text style={styles.primaryButtonText}>Appeal This Decision</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <>
                  {questions.map((q, idx) => (
                    <View key={q.id} style={styles.questionBox}>
                      <Text style={styles.questionText}>Q{idx + 1}. {q.question}</Text>
                      {(["a", "b", "c", "d"] as const).map((opt) => {
                        const optionText = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }[opt];
                        const isSelected = answers[q.id] === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                            onPress={() => handleSelectAnswer(q.id, opt)}
                          >
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{optionText}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}

                  {answersError ? <Text style={styles.errorText}>{answersError}</Text> : null}

                  <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitAnswers} disabled={answersSubmitting}>
                    <Text style={styles.primaryButtonText}>{answersSubmitting ? "Submitting..." : "Submit Answers"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ClaimStatus")}>
          <Ionicons name="document-text" size={22} color={NAVY} />
          <Text style={styles.navLabelActive}>Status</Text>
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
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 30 },
  pageTitle: { fontSize: 20, fontWeight: "900", color: NAVY, marginBottom: 4 },
  pageSubtitle: { fontSize: 12.5, color: "#9ca3af", marginBottom: 20 },
  sectionHeading: { fontSize: 12.5, fontWeight: "900", color: "#374151", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 },
  matchCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 16, padding: 14, marginBottom: 10, gap: 10 },
  matchItemName: { fontSize: 14, fontWeight: "900", color: "#166534" },
  matchSubtext: { fontSize: 11, color: "#16a34a", marginTop: 3 },
  submitClaimButton: { backgroundColor: "#16a34a", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  submitClaimButtonText: { color: "white", fontWeight: "800", fontSize: 12 },
  loadingText: { color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#9ca3af", fontWeight: "700" },
  claimCard: { backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#f0f0f0" },
  claimHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 10 },
  claimItemName: { fontSize: 15, fontWeight: "900", color: "#374151" },
  claimSubmittedDate: { fontSize: 10.5, color: "#9ca3af", marginTop: 2 },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  statusPillText: { fontSize: 10, fontWeight: "800" },
  timelineScroll: { marginBottom: 14 },
  timelineStepWrap: { alignItems: "center", width: 70, marginRight: 4 },
  timelineCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  timelineCircleActive: { backgroundColor: NAVY },
  timelineCircleText: { fontSize: 10, fontWeight: "800", color: "#9ca3af" },
  timelineCircleTextActive: { color: "white" },
  timelineLabel: { fontSize: 8.5, fontWeight: "700", color: "#9ca3af", textAlign: "center" },
  timelineLabelActive: { color: NAVY },
  rejectedBox: { backgroundColor: "#fef2f2", borderRadius: 14, padding: 12, marginBottom: 14 },
  rejectedTitle: { color: "#dc2626", fontWeight: "800", fontSize: 13 },
  rejectedText: { color: "#b91c1c", fontSize: 11.5, marginTop: 4 },
  appealPendingText: { color: "#c2410c", fontSize: 10.5, marginTop: 6, fontWeight: "700" },
  abandonedBox: { backgroundColor: "#f3f4f6", borderRadius: 14, padding: 12, marginBottom: 14 },
  abandonedTitle: { color: "#4b5563", fontWeight: "800", fontSize: 13 },
  abandonedText: { color: "#6b7280", fontSize: 11, marginTop: 4 },
  answerQuestionsButton: { backgroundColor: "#eef2ff", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 12 },
  answerQuestionsButtonText: { color: NAVY, fontWeight: "800", fontSize: 12.5 },
  pickupBox: { backgroundColor: "#f0fdf4", borderRadius: 14, padding: 12, marginBottom: 12 },
  pickupTitle: { color: "#15803d", fontWeight: "800", fontSize: 13 },
  pickupText: { color: "#16a34a", fontSize: 11, marginTop: 3 },
  returnedBox: { backgroundColor: "#eff6ff", borderRadius: 14, padding: 12, marginBottom: 12 },
  returnedTitle: { color: "#1d4ed8", fontWeight: "800", fontSize: 13 },
  returnedText: { color: "#2563eb", fontSize: 11, marginTop: 3 },
  appealButton: { backgroundColor: "#fff7ed", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 12 },
  appealButtonText: { color: "#c2410c", fontWeight: "800", fontSize: 12.5 },
  descriptionBox: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  descriptionLabel: { fontSize: 10, fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 },
  descriptionText: { fontSize: 12.5, color: "#6b7280", lineHeight: 17 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(13,19,63,0.7)", justifyContent: "flex-end" },
  modalScrollContent: { justifyContent: "flex-end", flexGrow: 1 },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalCloseX: { position: "absolute", top: 16, right: 16, zIndex: 10 },
  modalCloseXText: { fontSize: 24, color: "#9ca3af", fontWeight: "700" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: NAVY, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: "#9ca3af", marginBottom: 16 },
  infoNote: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 12, marginBottom: 14 },
  infoNoteText: { fontSize: 11.5, color: "#1e40af", lineHeight: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "800", color: "#374151", marginBottom: 8 },
  textArea: { backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, padding: 14, fontSize: 13, color: "#374151", minHeight: 90, marginBottom: 12 },
  appealPhotoBox: { backgroundColor: "#f8f9fc", borderWidth: 1.5, borderColor: "#e5e7eb", borderStyle: "dashed", borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12 },
  appealPhotoText: { fontSize: 11.5, color: "#9ca3af", textAlign: "center" },
  appealPhotoPreview: { width: 100, height: 100, borderRadius: 12, resizeMode: "cover" },
  appealPhotoUploadedText: { fontSize: 10.5, fontWeight: "700", color: "#22c55e", marginTop: 6 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  primaryButton: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "900", fontSize: 14 },
  appealSubmitButton: { backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  questionBox: { backgroundColor: "#f8f9fc", borderRadius: 14, padding: 14, marginBottom: 14 },
  questionText: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 10 },
  optionButton: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8 },
  optionButtonSelected: { borderColor: NAVY, backgroundColor: "#eef2ff" },
  optionText: { fontSize: 12.5, color: "#6b7280" },
  optionTextSelected: { color: NAVY, fontWeight: "800" },
  resultBox: { borderRadius: 16, padding: 20, alignItems: "center" },
  resultBoxGood: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  resultBoxWarn: { backgroundColor: "#fefce8", borderWidth: 1, borderColor: "#fef08a" },
  resultScore: { fontSize: 22, fontWeight: "900", marginBottom: 8 },
  resultScoreGood: { color: "#15803d" },
  resultScoreWarn: { color: "#a16207" },
  resultText: { fontSize: 12.5, color: "#6b7280", textAlign: "center", marginBottom: 16, lineHeight: 18 },
  resultButtonRow: { flexDirection: "row", gap: 10, width: "100%" },
  resultCloseButton: { flex: 1, borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  resultCloseButtonText: { color: "#9ca3af", fontWeight: "800", fontSize: 13 },
  resultAppealButton: { flex: 1, backgroundColor: "#f97316", borderRadius: 14, paddingVertical: 13, alignItems: "center" },
  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingVertical: 10, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 10, color: "#9ca3af", fontWeight: "600" },
  navLabelActive: { fontSize: 10, color: NAVY, fontWeight: "800" },
});