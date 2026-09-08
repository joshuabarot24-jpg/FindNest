"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

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

const TIMELINE_STEPS = [
  "Submitted",
  "Under AI Review",
  "Matched",
  "Claim Submitted",
  "Pending Verification",
  "Approved",
  "Returned",
];

function currentStepIndex(status: string): number {
  switch (status) {
    case "approved":
      return 5;
    case "returned":
      return 6;
    case "pending":
    default:
      return 4;
  }
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

function statusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-50 border-green-100";
    case "rejected":
      return "text-red-600 bg-red-50 border-red-100";
    case "abandoned":
      return "text-gray-600 bg-gray-100 border-gray-200";
    default:
      return "text-yellow-600 bg-yellow-50 border-yellow-100";
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ClaimStatusPage() {
  const [userInitial, setUserInitial] = useState("");
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
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealError, setAppealError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("findnest_user");
    if (stored) {
      const currentUser = JSON.parse(stored);
      setUserInitial(currentUser?.name?.charAt(0).toUpperCase() || "");
    }
  }, []);

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
      });
      setAppealingClaim(null);
      setAppealMessage("");
      fetchClaims();
    } catch (err: any) {
      setAppealError(err.response?.data?.message || "Failed to submit appeal. Please try again.");
    } finally {
      setAppealSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/student-home" className="flex items-center gap-3">
          <span className="text-lg font-black text-[#1a237e]">FIND<span className="text-[#ffd700]">NEST</span></span>
        </a>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/claim-status" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userInitial}
          </a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#1a237e]">Claim Status</h1>
          <p className="text-gray-400 text-sm mt-1">Track the progress of your ownership claims</p>
        </div>

        {!matchesLoading && pendingMatches.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide mb-4">
              Possible Matches for Your Lost Items
            </h2>
            <div className="space-y-3">
              {pendingMatches.map((match) => (
                <div key={match.id} className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-black text-green-800">{match.lost_item.item_name}</p>
                      <p className="text-green-600 text-xs mt-1">
                        {match.confidence_score}% confidence match &middot; {match.lost_item.category}
                      </p>
                    </div>
                    <button
                      onClick={() => { setClaimingMatch(match); setProofDescription(""); setClaimError(""); }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition whitespace-nowrap"
                    >
                      Submit Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-bold text-lg">No claims submitted yet</p>
            <p className="text-sm mt-1">Once you claim a matched item, its status will appear here</p>
          </div>
        ) : (
          <div className="space-y-5">
            {claims.map((claim) => {
              const item = claim.match?.found_record || claim.match?.lost_report;
              const itemName = item?.item_name || "Unknown Item";
              const step = currentStepIndex(claim.claim_status);
              const isTerminal = ["rejected", "abandoned"].includes(claim.claim_status);
              const canAppeal = claim.claim_status === "rejected" && !claim.appeal_status;

              return (
                <div key={claim.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="flex-1">
                        <p className="font-black text-gray-700 text-lg">{itemName}</p>
                        <p className="text-gray-400 text-xs mt-1">Claim submitted {formatDate(claim.created_at)}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor(claim.claim_status)}`}>
                        {statusLabel(claim.claim_status)}
                      </span>
                    </div>

                    {!isTerminal ? (
                      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-2">
                        {TIMELINE_STEPS.map((label, idx) => {
                          const stepNum = idx + 1;
                          const isActive = stepNum <= step;
                          return (
                            <div key={label} className="flex-1 flex items-center min-w-[70px]">
                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isActive ? "bg-[#1a237e] text-white" : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {stepNum}
                                </div>
                                <span className={`text-[9px] font-bold text-center leading-tight ${isActive ? "text-[#1a237e]" : "text-gray-400"}`}>
                                  {label}
                                </span>
                              </div>
                              {idx < TIMELINE_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${stepNum < step ? "bg-[#1a237e]" : "bg-gray-100"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : claim.claim_status === "rejected" ? (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
                        <p className="text-red-600 text-sm font-bold">Claim Rejected</p>
                        {claim.admin_notes && (
                          <p className="text-red-500 text-sm mt-1">Reason: {claim.admin_notes}</p>
                        )}
                        {claim.appeal_status === "pending" && (
                          <p className="text-orange-600 text-xs mt-2 font-semibold">Your appeal is under super-admin review.</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 mb-5">
                        <p className="text-gray-600 text-sm font-bold">Claim Abandoned</p>
                        <p className="text-gray-500 text-xs mt-1">Pickup window expired without collection. The item returned to unclaimed status.</p>
                      </div>
                    )}

                    {claim.claim_status === "approved" && !claim.collected_at && claim.pickup_deadline && (
                      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">
                        <p className="text-green-700 text-sm font-bold">Item Ready for Pickup</p>
                        <p className="text-green-600 text-xs mt-1">
                          Visit the Guidance Office to collect your item by <strong>{formatDate(claim.pickup_deadline)}</strong>
                          {daysRemaining(claim.pickup_deadline) >= 0
                            ? ` (${daysRemaining(claim.pickup_deadline)} day${daysRemaining(claim.pickup_deadline) === 1 ? "" : "s"} left)`
                            : " — deadline passed"}
                        </p>
                      </div>
                    )}

                    {claim.collected_at && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                        <p className="text-blue-700 text-sm font-bold">Item Returned</p>
                        <p className="text-blue-600 text-xs mt-1">Collected on {formatDate(claim.collected_at)}</p>
                      </div>
                    )}

                    {canAppeal && (
                      <button
                        onClick={() => { setAppealingClaim(claim); setAppealMessage(""); setAppealError(""); }}
                        className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2.5 rounded-xl transition text-sm mb-5"
                      >
                        Appeal This Decision
                      </button>
                    )}

                    <div className="pt-5 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Your Description</p>
                      <p className="text-gray-600 text-sm">{claim.proof_description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {claimingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <button
              onClick={() => setClaimingMatch(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-xl font-black text-[#1a237e] mb-1">Submit Claim</h2>
            <p className="text-gray-400 text-sm mb-6">
              For your reported "{claimingMatch.lost_item.item_name}"
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
              <p className="text-blue-700 text-xs leading-relaxed">
                Describe specific details only the true owner would know (color, brand, scratches, stickers, contents). You will also be asked a few verification questions after submitting.
              </p>
            </div>

            <label className="block text-sm font-bold text-gray-600 mb-2">Your Description</label>
            <textarea
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Describe why you believe this item belongs to you..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700 resize-none mb-4"
            />

            {claimError && (
              <p className="text-red-500 text-xs font-semibold mb-4">{claimError}</p>
            )}

            <button
              onClick={handleSubmitClaim}
              disabled={claimSubmitting}
              className="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-black py-3.5 rounded-xl transition disabled:opacity-50"
            >
              {claimSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </div>
      )}

      {appealingClaim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <button
              onClick={() => setAppealingClaim(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-xl font-black text-[#1a237e] mb-1">Appeal Rejected Claim</h2>
            <p className="text-gray-400 text-sm mb-6">
              This will be escalated to the Super Admin for final review
            </p>

            <label className="block text-sm font-bold text-gray-600 mb-2">Additional Evidence or Explanation</label>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Provide new evidence or explain why you believe this decision should be reconsidered..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700 resize-none mb-4"
            />

            {appealError && (
              <p className="text-red-500 text-xs font-semibold mb-4">{appealError}</p>
            )}

            <button
              onClick={handleSubmitAppeal}
              disabled={appealSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl transition disabled:opacity-50"
            >
              {appealSubmitting ? "Submitting..." : "Submit Appeal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}