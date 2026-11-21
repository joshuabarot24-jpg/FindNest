import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../lib/api";
import { useAutoRefresh } from "../lib/useAutoRefresh";
import { useForcePasswordChange } from "../lib/useForcePasswordChange";
import StudentHeader from "../components/StudentHeader";
import StudentBottomNav from "../components/StudentBottomNav";

const GREEN = "#0E4D34";
const BLUE = "#1D2A6B";
const MINT = "#EAF5EF";
const CARD = "#E3EEE7";
const SAGE = "#B9CBBF";
const GRAYGREEN = "#CBD8CF";

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
  verification_skipped?: boolean;
  timeline?: { action: string; at: string }[];
  match: {
    matched_at?: string | null;
    lost_report: { item_name: string; location_lost: string; description?: string | null; created_at?: string } | null;
    found_record: { item_name: string; location_found: string } | null;
  } | null;
}

interface PendingMatch {
  id: number;
  confidence_score: number;
  match_status: string;
  matched_at: string;
  lost_item: { item_name: string; category: string; location_lost: string };
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
      return 6;
    case "pending":
    default:
      return 5;
  }
}

function questionsAnswered(claim: Claim): boolean {
  return !!(claim.ownership_questions && claim.ownership_questions.length > 0 && claim.ownership_questions.every((q) => q.student_answer !== null));
}

// mm/dd/yy
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
}

// hh:mm am/pm
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toLowerCase();
}

function daysRemaining(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function StepTracker({
  labels,
  step,
  open,
  onSelect,
  getAt,
}: {
  labels: string[];
  step: number;
  open: number | null | undefined;
  onSelect: (stepNum: number) => void;
  getAt: (stepNum: number) => string | null;
}) {
  const last = labels.length - 1;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginBottom: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {labels.map((label, idx) => {
          const stepNum = idx + 1;
          const done = stepNum <= step;
          const at = done ? getAt(stepNum) : null;
          return (
            <View key={label} style={{ width: 64, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
                <View style={{ flex: 1, height: 2, backgroundColor: idx === 0 ? "transparent" : done ? BLUE : GRAYGREEN }} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  onPress={() => onSelect(stepNum)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: done ? BLUE : GRAYGREEN,
                    borderWidth: open === stepNum ? 3 : 0,
                    borderColor: "#8F9BDD",
                  }}
                >
                  <Text style={{ color: done ? "#fff" : "#6b8f7c", fontSize: 10, fontWeight: "800" }}>{stepNum}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, height: 2, backgroundColor: idx === last ? "transparent" : stepNum < step ? BLUE : GRAYGREEN }} />
              </View>
              <Text style={{ marginTop: 4, fontSize: 9, fontWeight: "800", textAlign: "center", color: done ? BLUE : "#6b8f7c" }}>{label}</Text>
              {at ? <Text style={{ marginTop: 2, fontSize: 8, textAlign: "center", color: "#6b8f7c" }}>{timeAgo(at)}</Text> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}

function getStepDetail(claim: Claim, stepNum: number): { at: string | null; text: string } {
  const lost = claim.match?.lost_report;
  const found = claim.match?.found_record;
  const logAt = (action: string) => claim.timeline?.find((t) => t.action === action)?.at ?? null;

  switch (stepNum) {
    case 1:
      return {
        at: lost?.created_at ?? claim.created_at,
        text: lost
          ? `You reported "${lost.item_name}" lost at ${lost.location_lost}.${lost.description ? ` Description: ${lost.description}` : ""}`
          : "Your lost item report was submitted.",
      };
    case 2:
      return {
        at: lost?.created_at ?? claim.created_at,
        text: "The AI checked your photo and description, then searched the found items for possible matches.",
      };
    case 3:
      return {
        at: claim.match?.matched_at ?? null,
        text: found
          ? `The AI found a possible match: "${found.item_name}"${found.location_found ? `, found at ${found.location_found}` : ""}.`
          : "The AI found a possible match.",
      };
    case 4:
      return {
        at: claim.claimed_at ?? claim.created_at,
        text: `You submitted your claim.${claim.proof_description ? ` Your note: ${claim.proof_description}` : ""}`,
      };
    case 5:
      return {
        at: logAt("Ownership Questions Answered"),
        text: claim.verification_skipped
          ? "The verification questions were skipped for this claim. The Guidance Office is reviewing your evidence."
          : logAt("Ownership Questions Answered")
            ? "You answered the verification questions. The Guidance Office is reviewing all of your evidence."
            : "Waiting for you to answer the verification questions.",
      };
    case 6:
      return {
        at: logAt("Claim Approved"),
        text:
          claim.claim_status === "approved" || claim.collected_at
            ? `Your claim was approved.${claim.pickup_deadline ? ` Collect your item at the Guidance Office by ${formatDate(claim.pickup_deadline)}.` : ""}`
            : "Waiting for the Guidance Office's decision.",
      };
    case 7:
      return {
        at: claim.collected_at,
        text: claim.collected_at ? "Your item was collected at the Guidance Office." : "Not collected yet.",
      };
    default:
      return { at: null, text: "" };
  }
}

interface FoundRecord {
  id: number;
  item_name: string;
  location_found: string | null;
  status: string;
  created_at: string;
  surrender_deadline: string | null;
  receipt_confirmed: boolean;
  receipt_confirmed_at: string | null;
  progress?: {
    matched_at: string | null;
    claim_status: string | null;
    claimed_at: string | null;
    collected_at: string | null;
  };
}

const FOUND_STEPS = ["Submitted", "Waiting for Surrender", "Surrendered", "Matched", "Claimed", "Returned"];

function foundStepIndex(r: FoundRecord): number {
  const p = r.progress;
  if (p?.collected_at) return 6;
  if (p?.claimed_at) return 5;
  if (p?.matched_at) return 4;
  if (r.receipt_confirmed) return 3;
  return 2;
}

function getFoundStepDetail(r: FoundRecord, stepNum: number): { at: string | null; text: string } {
  const p = r.progress;
  switch (stepNum) {
    case 1:
      return {
        at: r.created_at,
        text: `You reported finding "${r.item_name}"${r.location_found ? ` at ${r.location_found}` : ""}.`,
      };
    case 2:
      return {
        at: r.created_at,
        text:
          !r.receipt_confirmed && r.surrender_deadline
            ? `Hand the item to the Guidance Office by ${formatDate(r.surrender_deadline)} (within 2 school days).`
            : "You were asked to hand the item to the Guidance Office within 2 school days.",
      };
    case 3:
      return {
        at: r.receipt_confirmed_at,
        text: r.receipt_confirmed
          ? "The Guidance Office confirmed receipt of your item. AI matching has started."
          : "Waiting for the Guidance Office to confirm they received the item.",
      };
    case 4:
      return {
        at: p?.matched_at ?? null,
        text: "The AI found a possible owner for your item. The Guidance Office will verify who it belongs to.",
      };
    case 5:
      return {
        at: p?.claimed_at ?? null,
        text:
          p?.claim_status === "approved"
            ? "A claim for your item was approved. The owner will collect it at the Guidance Office."
            : p?.claim_status === "rejected"
              ? "A claim for your item was rejected. The item is waiting for its real owner."
              : "Someone claimed your item. The Guidance Office is verifying the claim.",
      };
    case 6:
      return {
        at: p?.collected_at ?? null,
        text: p?.collected_at ? "The item was returned to its owner. Thank you for helping!" : "Not returned yet.",
      };
    default:
      return { at: null, text: "" };
  }
}

function FoundReportsPanel() {
  const [records, setRecords] = useState<FoundRecord[]>([]);
  const [foundLoading, setFoundLoading] = useState(true);
  const [openFoundStep, setOpenFoundStep] = useState<Record<number, number | null>>({});

  const fetchRecords = async () => {
    try {
      const response = await api.get("/found-items/mine");
      setRecords(response.data.records || []);
    } catch (err) {
      console.log("Error fetching found reports:", err);
    } finally {
      setFoundLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useAutoRefresh(() => {
    fetchRecords();
  });

  if (foundLoading) {
    return <Text style={styles.loadingText}>Loading found reports...</Text>;
  }

  if (records.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="cube-outline" size={32} color="#9FC5B0" />
        <Text style={styles.emptyText}>No found item reports yet</Text>
      </View>
    );
  }

  return (
    <View>
      {records.map((record) => {
        const expired = record.status === "unsurrendered_expired";
        const step = expired ? 2 : foundStepIndex(record);
        const open = openFoundStep[record.id];
        const current = getFoundStepDetail(record, step);

        return (
          <View key={record.id} style={styles.claimCard}>
            <Text style={styles.claimItemName}>{record.item_name}</Text>
            <Text style={styles.claimSubmittedDate}>Submitted {formatDate(record.created_at)}</Text>

            <StepTracker
              labels={FOUND_STEPS}
              step={step}
              open={open}
              onSelect={(n) => setOpenFoundStep((prev) => ({ ...prev, [record.id]: prev[record.id] === n ? null : n }))}
              getAt={(n) => getFoundStepDetail(record, n).at}
            />

            <View style={[styles.timelineWrap, { display: "none" }]}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineNodes}>
                {FOUND_STEPS.map((label, idx) => {
                  const done = idx + 1 <= step;
                  return (
                    <TouchableOpacity
                      key={label}
                      activeOpacity={0.7}
                      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                      onPress={() => setOpenFoundStep((prev) => ({ ...prev, [record.id]: prev[record.id] === idx + 1 ? null : idx + 1 }))}
                      style={[styles.node, done && styles.nodeDone, open === idx + 1 && { transform: [{ scale: 1.6 }] }]}
                    />
                  );
                })}
              </View>
              <Text style={styles.timelineCaption}>
                Step {step} of {FOUND_STEPS.length}: {FOUND_STEPS[step - 1]}
                {current.at ? ` · ${timeAgo(current.at)}` : ""}
              </Text>
            </View>

            {open ? (
              <View style={styles.stepDetailBox}>
                <Text style={styles.stepDetailTitle}>{open}. {FOUND_STEPS[open - 1]}</Text>
                <Text style={styles.stepDetailText}>
                  {open <= step ? getFoundStepDetail(record, open).text : "This step has not happened yet."}
                </Text>
                {open <= step && getFoundStepDetail(record, open).at ? (
                  <Text style={styles.stepDetailTime}>
                    {formatDateTime(getFoundStepDetail(record, open).at as string)} · {timeAgo(getFoundStepDetail(record, open).at as string)}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {expired ? (
              <View style={styles.bannerRed}>
                <Text style={styles.bannerRedTitle}>Report Expired</Text>
                <Text style={styles.bannerRedSub}>
                  The item was not handed to the Guidance Office within 2 school days, so the report expired and your trust score dropped by 5 points.
                </Text>
              </View>
            ) : record.progress?.collected_at ? (
              <View style={styles.bannerSage}>
                <Text style={styles.bannerTitle}>Item Returned to Owner</Text>
                <Text style={styles.bannerSub}>Thank you for helping. Returned on {formatDate(record.progress.collected_at)}.</Text>
              </View>
            ) : !record.receipt_confirmed ? (
              <View style={styles.bannerLight}>
                <Text style={styles.bannerTitle}>Waiting for Surrender</Text>
                <Text style={styles.bannerSub}>
                  {record.surrender_deadline
                    ? `Hand the item to the Guidance Office by ${formatDate(record.surrender_deadline)}.`
                    : "Hand the item to the Guidance Office."}
                </Text>
              </View>
            ) : (
              <View style={styles.bannerSage}>
                <Text style={styles.bannerTitle}>Item Received</Text>
                <Text style={styles.bannerSub}>The Guidance Office has your item. We will notify you when the AI finds its owner.</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function ClaimStatusScreen({ navigation }: any) {
  useForcePasswordChange(navigation);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [openStep, setOpenStep] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(true);

  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  const [claimingMatch, setClaimingMatch] = useState<PendingMatch | null>(null);
  const [proofDescription, setProofDescription] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimPhotos, setClaimPhotos] = useState<{ preview: string; url: string | null; uploading: boolean }[]>([]);
  const CLAIM_MAX_PHOTOS = 3;

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

  useAutoRefresh(() => {
    fetchClaims();
    fetchPendingMatches();
  });

  const claimUploadedUrls = claimPhotos.filter((p) => p.url).map((p) => p.url as string);
  const claimAnyUploading = claimPhotos.some((p) => p.uploading);

  const pickClaimPhoto = async () => {
    if (claimPhotos.length >= CLAIM_MAX_PHOTOS) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const idx = claimPhotos.length;
    setClaimPhotos((prev) => [...prev, { preview: uri, url: null, uploading: true }]);

    try {
      const formData = new FormData();
      formData.append("image", { uri, name: "claim.jpg", type: "image/jpeg" } as any);
      formData.append("folder", "appeal-evidence");
      formData.append("analyze", "false");
      const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setClaimPhotos((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], url: res.data.url, uploading: false };
        return next;
      });
    } catch (err: any) {
      console.error("Claim photo upload failed:", err);
      setClaimPhotos((prev) => prev.filter((_, i2) => i2 !== idx));
      setClaimError(err.response?.data?.message || "Photo upload failed. Please try again.");
    }
  };

  const removeClaimPhoto = (index: number) => setClaimPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitClaim = async () => {
    if (!claimingMatch) return;
    if (claimUploadedUrls.length === 0) {
      setClaimError("Please add at least one evidence photo.");
      return;
    }
    setClaimError("");
    setClaimSubmitting(true);
    try {
      await api.post("/claims", {
        match_id: claimingMatch.id,
        proof_description: proofDescription.trim() || null,
        proof_photo_url: claimUploadedUrls[0] || null,
        proof_photo_urls: claimUploadedUrls,
      });
      setClaimingMatch(null);
      setProofDescription("");
      setClaimPhotos([]);
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
      formData.append("analyze", "false");
      const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StudentHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={styles.titleBar} />
          <Text style={styles.pageTitle}>Claim Status</Text>
        </View>

        <View style={styles.tabRow}>
          {(["lost", "found"] as const).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabButton, tab === key && styles.tabButtonActive]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
                {key === "lost" ? "Lost Reports" : "Found Reports"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={tab === "found" ? undefined : { display: "none" }}>
          <FoundReportsPanel />
        </View>

        {tab === "lost" && !matchesLoading && pendingMatches.length > 0 ? (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeading}>Possible Matches for Your Lost Items</Text>
            {pendingMatches.map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchItemName}>{match.lost_item.item_name}</Text>
                  <Text style={styles.matchSubtext}>{match.confidence_score}% confidence &middot; {match.lost_item.category}</Text>
                </View>
                <TouchableOpacity
                  style={styles.submitClaimButton}
                  onPress={() => { setClaimingMatch(match); setProofDescription(""); setClaimError(""); setClaimPhotos([]); }}
                >
                  <Text style={styles.submitClaimButtonText}>Submit Claim</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {tab === "found" ? null : loading ? (
          <Text style={styles.loadingText}>Loading lost reports...</Text>
        ) : claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={32} color="#9FC5B0" />
            <Text style={styles.emptyText}>No claims submitted yet</Text>
          </View>
        ) : (
          claims.map((claim) => {
            const item = claim.match?.found_record || claim.match?.lost_report;
            const itemName = item?.item_name || "Unknown Item";
            const step = currentStepIndex(claim.claim_status, claim.collected_at);
            const isTerminal = ["rejected", "abandoned"].includes(claim.claim_status);
            const canAppeal = claim.claim_status === "rejected" && !claim.appeal_status;
            const answered = questionsAnswered(claim);

            return (
              <View key={claim.id} style={styles.claimCard}>
                <Text style={styles.claimItemName}>{itemName}</Text>
                <Text style={styles.claimSubmittedDate}>Submitted {formatDate(claim.created_at)}</Text>

                {!isTerminal ? (
                  <StepTracker
                    labels={TIMELINE_STEPS}
                    step={step}
                    open={openStep[claim.id]}
                    onSelect={(n) => setOpenStep((prev) => ({ ...prev, [claim.id]: prev[claim.id] === n ? null : n }))}
                    getAt={(n) => getStepDetail(claim, n).at}
                  />
                ) : null}

                {!isTerminal ? (
                  <View style={[styles.timelineWrap, { display: "none" }]}>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineNodes}>
                      {TIMELINE_STEPS.map((label, idx) => {
                        const done = idx + 1 <= step;
                        return (
                          <TouchableOpacity
                            key={label}
                            activeOpacity={0.7}
                            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                            onPress={() => setOpenStep((prev) => ({ ...prev, [claim.id]: prev[claim.id] === idx + 1 ? null : idx + 1 }))}
                            style={[styles.node, done && styles.nodeDone, openStep[claim.id] === idx + 1 && { transform: [{ scale: 1.6 }] }]}
                          />
                        );
                      })}
                    </View>
                    <Text style={styles.timelineCaption}>
                      Step {Math.min(step, 7)} of 7: {TIMELINE_STEPS[Math.min(step, 7) - 1]}
                      {getStepDetail(claim, Math.min(step, 7)).at ? ` · ${timeAgo(getStepDetail(claim, Math.min(step, 7)).at as string)}` : ""}
                    </Text>
                  </View>
                ) : null}

                {!isTerminal && openStep[claim.id] ? (
                  (() => {
                    const n = openStep[claim.id] as number;
                    const detail = getStepDetail(claim, n);
                    const reached = n <= step;
                    return (
                      <View style={styles.stepDetailBox}>
                        <Text style={styles.stepDetailTitle}>{n}. {TIMELINE_STEPS[n - 1]}</Text>
                        <Text style={styles.stepDetailText}>{reached ? detail.text : "This step has not happened yet."}</Text>
                        {reached && detail.at ? (
                          <Text style={styles.stepDetailTime}>{formatDateTime(detail.at)} · {timeAgo(detail.at)}</Text>
                        ) : null}
                      </View>
                    );
                  })()
                ) : null}

                {/* Status banner */}
                {claim.collected_at ? (
                  <View style={styles.bannerSage}>
                    <Text style={styles.bannerTitle}>Item is Returned</Text>
                    <Text style={styles.bannerSub}>
                      ( {formatDate(claim.collected_at)} at {formatTime(claim.collected_at)} )
                    </Text>
                  </View>
                ) : claim.claim_status === "approved" ? (
                  <View style={styles.bannerSage}>
                    <Text style={styles.bannerTitle}>Item Ready for Pickup</Text>
                    <Text style={styles.bannerSub}>
                      {claim.pickup_deadline
                        ? `Collect by ${formatDate(claim.pickup_deadline)}${
                            daysRemaining(claim.pickup_deadline) >= 0
                              ? ` (${daysRemaining(claim.pickup_deadline)} day${daysRemaining(claim.pickup_deadline) === 1 ? "" : "s"} left)`
                              : " (deadline passed)"
                          }`
                        : "Visit the Guidance Office"}
                    </Text>
                  </View>
                ) : claim.claim_status === "rejected" ? (
                  <View style={styles.bannerRed}>
                    <Text style={styles.bannerRedTitle}>Claim Rejected</Text>
                    {claim.admin_notes ? <Text style={styles.bannerRedSub}>Reason: {claim.admin_notes}</Text> : null}
                    {claim.appeal_status === "pending" ? (
                      <Text style={styles.appealPendingText}>The Guidance Office is reviewing your appeal.</Text>
                    ) : null}
                  </View>
                ) : claim.claim_status === "abandoned" ? (
                  <View style={styles.bannerGray}>
                    <Text style={styles.bannerGrayTitle}>Claim Abandoned</Text>
                    <Text style={styles.bannerGraySub}>Pickup window expired without collection. Item returned to unclaimed status.</Text>
                  </View>
                ) : (
                  <View style={styles.bannerLight}>
                    <Text style={styles.bannerTitle}>Under Review</Text>
                    <Text style={styles.bannerSub}>An admin is verifying your claim.</Text>
                  </View>
                )}

                {claim.claim_status === "pending" && !answered ? (
                  <TouchableOpacity style={styles.answerQuestionsButton} onPress={() => openAnswerModal(claim)}>
                    <Text style={styles.answerQuestionsButtonText}>Answer Verification Questions</Text>
                  </TouchableOpacity>
                ) : null}

                {canAppeal ? (
                  <TouchableOpacity style={styles.appealButton} onPress={() => openAppealModal(claim)}>
                    <Text style={styles.appealButtonText}>Appeal This Decision</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionLabel}>Item Description</Text>
                  <Text style={styles.descriptionText}>{claim.proof_description}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Submit claim */}
      <Modal visible={!!claimingMatch} animationType="slide" transparent onRequestClose={() => setClaimingMatch(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.modalScrollContent} enableOnAndroid={true} extraScrollHeight={30}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseX} onPress={() => setClaimingMatch(null)}>
                <Text style={styles.modalCloseXText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Submit Ownership Proof</Text>
              <Text style={styles.modalSubtitle}>For your reported &quot;{claimingMatch?.lost_item.item_name}&quot;</Text>

              <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                  To verify your claim, please upload photos or digital evidence demonstrating your ownership of this item (e.g., photos showing you with the item, receipts, serial numbers, or unique identifying features). You will also be asked verification questions after submitting.
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Evidence Note (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Picture of me with the item taken last month"
                placeholderTextColor="#9ca3af"
                value={proofDescription}
                onChangeText={(t) => setProofDescription(t.slice(0, 100))}
                maxLength={100}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={{ textAlign: "right", fontSize: 11, color: "#9ca3af", marginBottom: 10 }}>{proofDescription.length}/100</Text>

              <Text style={styles.fieldLabel}>Ownership Evidence Photos * (up to {CLAIM_MAX_PHOTOS})</Text>
              {claimPhotos.length > 0 ? (
                <View style={styles.claimPhotoGrid}>
                  {claimPhotos.map((p, idx) => (
                    <View key={idx} style={styles.claimPhotoThumbWrap}>
                      <Image source={{ uri: p.preview }} style={styles.claimPhotoThumb} />
                      {p.uploading ? (
                        <View style={styles.claimPhotoThumbLoading}>
                          <Text style={{ color: "white", fontWeight: "800" }}>...</Text>
                        </View>
                      ) : null}
                      {!p.uploading ? (
                        <TouchableOpacity style={styles.claimPhotoRemoveBtn} onPress={() => removeClaimPhoto(idx)}>
                          <Text style={styles.claimPhotoRemoveBtnText}>×</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
              {claimPhotos.length < CLAIM_MAX_PHOTOS ? (
                <TouchableOpacity style={styles.appealPhotoBox} onPress={pickClaimPhoto} disabled={claimAnyUploading}>
                  <Text style={styles.appealPhotoText}>
                    {claimAnyUploading ? "Uploading..." : claimPhotos.length === 0 ? "Tap to add ownership evidence photos" : `Add more (${CLAIM_MAX_PHOTOS - claimPhotos.length} left)`}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {claimError ? <Text style={styles.errorText}>{claimError}</Text> : null}

              <TouchableOpacity style={[styles.primaryButton, (claimSubmitting || claimAnyUploading || claimUploadedUrls.length === 0) && { opacity: 0.5 }]} onPress={handleSubmitClaim} disabled={claimSubmitting || claimAnyUploading || claimUploadedUrls.length === 0}>
                <Text style={styles.primaryButtonText}>{claimSubmitting ? "Submitting..." : claimAnyUploading ? "Uploading photos..." : "Submit Claim Verification"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* Appeal */}
      <Modal visible={!!appealingClaim} animationType="slide" transparent onRequestClose={() => setAppealingClaim(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.modalScrollContent} enableOnAndroid={true} extraScrollHeight={30}>
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
                    {appealPhotoUrl ? <Text style={styles.appealPhotoUploadedText}>Uploaded successfully</Text> : null}
                  </>
                ) : (
                  <Text style={styles.appealPhotoText}>Tap to attach a photo the admin can review</Text>
                )}
              </TouchableOpacity>

              {appealError ? <Text style={styles.errorText}>{appealError}</Text> : null}

              <TouchableOpacity style={styles.appealSubmitButton} onPress={handleSubmitAppeal} disabled={appealSubmitting || appealPhotoUploading}>
                <Text style={styles.primaryButtonText}>{appealSubmitting ? "Submitting..." : "Submit Appeal"}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* Verification questions */}
      <Modal visible={!!answeringClaim} animationType="slide" transparent onRequestClose={() => setAnsweringClaim(null)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseX} onPress={() => setAnsweringClaim(null)}>
                <Text style={styles.modalCloseXText}>&times;</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Ownership Verification</Text>
              <Text style={styles.modalSubtitle}>Answer these questions to help confirm you&apos;re the true owner</Text>

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
                    <TouchableOpacity style={styles.resultCloseButton} onPress={() => setAnsweringClaim(null)}>
                      <Text style={styles.resultCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                    {answeringClaim && answeringClaim.claim_status === "rejected" && !answeringClaim.appeal_status ? (
                      <TouchableOpacity style={styles.resultAppealButton} onPress={() => openAppealModal(answeringClaim)}>
                        <Text style={styles.primaryButtonText}>Appeal This Decision</Text>
                      </TouchableOpacity>
                    ) : null}
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

      <StudentBottomNav navigation={navigation} active="ClaimStatus" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FBF8" },
  scrollContent: { padding: 20, paddingBottom: 30, backgroundColor: MINT, flexGrow: 1 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  titleBar: { width: 5, height: 24, borderRadius: 3, backgroundColor: "#2FD18B" },
  pageTitle: { fontSize: 20, fontWeight: "900", color: "#1f2937" },

  sectionHeading: { fontSize: 12, fontWeight: "900", color: GREEN, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 },
  matchCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderWidth: 1.5, borderColor: SAGE, borderRadius: 20, padding: 14, marginBottom: 10, gap: 10 },
  matchItemName: { fontSize: 14, fontWeight: "900", color: GREEN },
  matchSubtext: { fontSize: 11, color: "#6b8f7c", marginTop: 3 },
  submitClaimButton: { backgroundColor: GREEN, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  submitClaimButtonText: { color: "white", fontWeight: "800", fontSize: 12 },
  loadingText: { color: "#6b8f7c", fontSize: 13, textAlign: "center", marginTop: 20 },
  stepDetailBox: { backgroundColor: "#F4F7FB", borderWidth: 1, borderColor: "#D6DCEF", borderRadius: 12, padding: 12, marginTop: 10 },
  stepDetailTitle: { color: BLUE, fontSize: 13, fontWeight: "800" },
  stepDetailText: { color: "#4b5563", fontSize: 13, marginTop: 4 },
  stepDetailTime: { color: "#9ca3af", fontSize: 11, marginTop: 6 },
  tabRow: { flexDirection: "row", marginBottom: 16 },
  tabButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: SAGE, marginRight: 8 },
  tabButtonActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { color: GREEN, fontSize: 13, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { color: "#6b8f7c", fontWeight: "700" },

  claimCard: { backgroundColor: CARD, borderRadius: 22, padding: 16, marginBottom: 16 },
  claimItemName: { fontSize: 17, fontWeight: "900", color: GREEN, textTransform: "capitalize" },
  claimSubmittedDate: { fontSize: 10.5, color: "#7a8b83", marginTop: 2 },

  timelineWrap: { marginTop: 18, marginBottom: 14 },
  timelineLine: { position: "absolute", left: 11, right: 11, top: 11, height: 2, backgroundColor: GREEN, opacity: 0.45 },
  timelineNodes: { flexDirection: "row", justifyContent: "space-between" },
  node: { width: 22, height: 22, borderRadius: 11, backgroundColor: "white", borderWidth: 2, borderColor: GREEN },
  nodeDone: { backgroundColor: BLUE, borderColor: BLUE },
  timelineCaption: { fontSize: 10.5, fontWeight: "700", color: BLUE, textAlign: "center", marginTop: 8 },

  bannerSage: { backgroundColor: SAGE, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center", marginTop: 6, marginBottom: 10 },
  bannerLight: { backgroundColor: "#D6E4DB", borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center", marginTop: 6, marginBottom: 10 },
  bannerTitle: { color: "#0A2618", fontWeight: "900", fontSize: 13.5 },
  bannerSub: { color: "#1E3F2E", fontSize: 10.5, marginTop: 2, textAlign: "center" },
  bannerRed: { backgroundColor: "#fef2f2", borderRadius: 18, padding: 14, marginTop: 6, marginBottom: 10 },
  bannerRedTitle: { color: "#dc2626", fontWeight: "900", fontSize: 13 },
  bannerRedSub: { color: "#b91c1c", fontSize: 11.5, marginTop: 4 },
  appealPendingText: { color: "#c2410c", fontSize: 10.5, marginTop: 6, fontWeight: "700" },
  bannerGray: { backgroundColor: "#f3f4f6", borderRadius: 18, padding: 14, marginTop: 6, marginBottom: 10 },
  bannerGrayTitle: { color: "#4b5563", fontWeight: "900", fontSize: 13 },
  bannerGraySub: { color: "#6b7280", fontSize: 11, marginTop: 4 },

  answerQuestionsButton: { backgroundColor: "white", borderWidth: 1.5, borderColor: GREEN, borderRadius: 999, paddingVertical: 11, alignItems: "center", marginBottom: 10 },
  answerQuestionsButtonText: { color: GREEN, fontWeight: "800", fontSize: 12.5 },
  appealButton: { backgroundColor: "#fff7ed", borderRadius: 999, paddingVertical: 11, alignItems: "center", marginBottom: 10 },
  appealButtonText: { color: "#c2410c", fontWeight: "800", fontSize: 12.5 },

  descriptionBox: { backgroundColor: GRAYGREEN, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16 },
  descriptionLabel: { fontSize: 9.5, fontWeight: "800", color: "#5d7267", marginBottom: 3 },
  descriptionText: { fontSize: 12.5, color: "#1E3F2E", lineHeight: 17 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(17,20,36,0.75)", justifyContent: "flex-end", paddingTop: 60 },
  modalScrollContent: { justifyContent: "flex-end", flexGrow: 1 },
  modalCard: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 34, paddingBottom: 36 },
  modalCloseX: { position: "absolute", top: 14, right: 18, zIndex: 10, padding: 6 },
  modalCloseXText: { fontSize: 24, color: "#9ca3af", fontWeight: "700" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: GREEN, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: "#6b7280", marginBottom: 16 },
  infoNote: { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 14 },
  infoNoteText: { fontSize: 11.5, color: "#1E3F2E", lineHeight: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "800", color: "#374151", marginBottom: 8 },
  textArea: { backgroundColor: "#F3FAF6", borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 14, padding: 14, fontSize: 13, color: "#374151", minHeight: 90, marginBottom: 12 },
  appealPhotoBox: { backgroundColor: "#F3FAF6", borderWidth: 1.5, borderColor: "#CFE6D8", borderStyle: "dashed", borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12 },
  claimPhotoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  claimPhotoThumbWrap: { width: 64, height: 64, position: "relative" },
  claimPhotoThumb: { width: "100%", height: "100%", borderRadius: 12, resizeMode: "cover" },
  claimPhotoThumbLoading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  claimPhotoRemoveBtn: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" },
  claimPhotoRemoveBtnText: { color: "white", fontWeight: "900", fontSize: 13, lineHeight: 16 },
  appealPhotoText: { fontSize: 11.5, color: "#6b8f7c", textAlign: "center" },
  appealPhotoPreview: { width: 100, height: 100, borderRadius: 12, resizeMode: "cover" },
  appealPhotoUploadedText: { fontSize: 10.5, fontWeight: "700", color: "#22c55e", marginTop: 6 },
  errorText: { color: "#ef4444", fontSize: 11.5, fontWeight: "700", marginBottom: 10 },
  primaryButton: { backgroundColor: GREEN, borderRadius: 999, paddingVertical: 15, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "900", fontSize: 14 },
  appealSubmitButton: { backgroundColor: "#f97316", borderRadius: 999, paddingVertical: 15, alignItems: "center" },
  questionBox: { backgroundColor: "#F3FAF6", borderRadius: 16, padding: 14, marginBottom: 14 },
  questionText: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 10 },
  optionButton: { borderWidth: 1.5, borderColor: "#CFE6D8", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8, backgroundColor: "white" },
  optionButtonSelected: { borderColor: GREEN, backgroundColor: CARD },
  optionText: { fontSize: 12.5, color: "#6b7280" },
  optionTextSelected: { color: GREEN, fontWeight: "800" },
  resultBox: { borderRadius: 16, padding: 20, alignItems: "center" },
  resultBoxGood: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  resultBoxWarn: { backgroundColor: "#fefce8", borderWidth: 1, borderColor: "#fef08a" },
  resultScore: { fontSize: 22, fontWeight: "900", marginBottom: 8 },
  resultScoreGood: { color: "#15803d" },
  resultScoreWarn: { color: "#a16207" },
  resultText: { fontSize: 12.5, color: "#6b7280", textAlign: "center", marginBottom: 16, lineHeight: 18 },
  resultButtonRow: { flexDirection: "row", gap: 10, width: "100%" },
  resultCloseButton: { flex: 1, borderWidth: 2, borderColor: "#e5e7eb", borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  resultCloseButtonText: { color: "#6b7280", fontWeight: "800", fontSize: 13 },
  resultAppealButton: { flex: 1, backgroundColor: "#f97316", borderRadius: 999, paddingVertical: 13, alignItems: "center" },
});