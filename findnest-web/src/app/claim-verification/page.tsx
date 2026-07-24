"use client";
import { useState, useMemo, useEffect } from "react";

type ClaimStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

interface Claim {
  id: number;
  student: string;
  studentId: string;
  item: string;
  proof: string;
  similarity: number;
  trustScore: number;
  status: ClaimStatus;
  initial: string;
}

const initialClaims: Claim[] = [
  {
    id: 1,
    student: "Dela Cruz, Juan",
    studentId: "STU-2024-001",
    item: "Black Wallet",
    proof: "Detailed Description",
    similarity: 89,
    trustScore: 95,
    status: "Pending",
    initial: "D",
  },
  {
    id: 2,
    student: "Santos, Maria",
    studentId: "STU-2024-002",
    item: "iPhone 15 Pro Max",
    proof: "Photo Evidence",
    similarity: 76,
    trustScore: 88,
    status: "Pending",
    initial: "S",
  },
  {
    id: 3,
    student: "Reyes, Carlo",
    studentId: "STU-2024-003",
    item: "Calculus Textbook",
    proof: "Detailed Description",
    similarity: 92,
    trustScore: 72,
    status: "Under Review",
    initial: "R",
  },
];

const PAGE_SIZE = 5;

function barColor(value: number) {
  if (value >= 85) return "bg-green-500";
  if (value >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

function statusStyles(status: ClaimStatus) {
  switch (status) {
    case "Pending":
      return { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700" };
    case "Under Review":
      return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" };
    case "Approved":
      return { dot: "bg-green-500", badge: "bg-green-50 text-green-700" };
    case "Rejected":
    default:
      return { dot: "bg-red-500", badge: "bg-red-50 text-red-600" };
  }
}

export default function ClaimVerification() {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [approvingClaim, setApprovingClaim] = useState<Claim | null>(null);
  const [rejectingClaim, setRejectingClaim] = useState<Claim | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return claims.filter(
      (c) =>
        c.student.toLowerCase().includes(q) ||
        c.item.toLowerCase().includes(q) ||
        c.studentId.toLowerCase().includes(q)
    );
  }, [claims, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = claims.filter((c) => c.status === "Pending").length;
  const reviewCount = claims.filter((c) => c.status === "Under Review").length;

  function handleApproveConfirm() {
    if (!approvingClaim) return;
    setClaims((prev) =>
      prev.map((c) => (c.id === approvingClaim.id ? { ...c, status: "Approved" } : c))
    );
    setToast(`${approvingClaim.item} was verified and released to ${approvingClaim.student}.` );
    setApprovingClaim(null);
  }

  function openRejectModal(claim: Claim) {
    setRejectReason("");
    setRejectingClaim(claim);
  }

  function handleRejectConfirm() {
    if (!rejectingClaim) return;
    setClaims((prev) =>
      prev.map((c) => (c.id === rejectingClaim.id ? { ...c, status: "Rejected" } : c))
    );
    setToast(`${rejectingClaim.student}'s claim for ${rejectingClaim.item} was rejected.`);
    setRejectingClaim(null);
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-[#1a237e] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/dashboard" className="text-white font-black text-lg block">
              FIND<span className="text-[#ffd700]">NEST</span>
            </a>
            <span className="text-blue-300 text-xs">Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Main Menu</p>

          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Dashboard</span>
          </a>
          <a href="/item-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Item Management</span>
          </a>
          <a href="/claim-verification" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Claim Verification</span>
          </a>
          <a href="/location-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Location Analytics</span>
          </a>
          <a href="/digital-records" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Digital Records</span>
          </a>
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Assistive AI Matching</span>
          </a>
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Audit Trail</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Guidance Counselor</p>
            <p className="text-blue-300 text-xs mt-1">Administrator</p>
          </div>
          
          <button
            onClick={() => { localStorage.removeItem("findnest_token"); localStorage.removeItem("findnest_user"); window.location.href = "/"; }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium w-full text-left"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Claim Verification</h1>
            <p className="text-gray-400 text-sm mt-1">
              Review claimant ownership proof before releasing items
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Total Claims</p>
            <p className="text-4xl font-black text-[#1a237e] mt-1">{claims.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Pending Claims</p>
            <p className="text-4xl font-black text-yellow-500 mt-1">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Under Review</p>
            <p className="text-4xl font-black text-blue-500 mt-1">{reviewCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Claims</h2>
            <input
              type="text"
              placeholder="Search by student, item, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Claiming Item</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Proof Provided</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">AI Similarity</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((claim) => {
                const styles = statusStyles(claim.status);
                const isResolved = claim.status === "Approved" || claim.status === "Rejected";
                return (
                  <tr key={claim.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                          {claim.initial}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{claim.student}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{claim.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">
                        {claim.item}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                        {claim.proof}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${barColor(claim.similarity)}`}
                            style={{ width: '${claim.similarity}%' }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{claim.similarity}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${barColor(claim.trustScore)}`}
                            style={{ width: '${claim.trustScore}%' }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{claim.trustScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${styles.badge}`}>
                          {claim.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isResolved ? (
                        <span className="text-gray-400 text-xs font-medium">No action needed</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setApprovingClaim(claim)}
                            className="bg-green-50 hover:bg-green-500 hover:text-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Verify & Release
                          </button>
                          <button
                            onClick={() => openRejectModal(claim)}
                            className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">📋</p>
              <p className="font-bold text-lg">No claims found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
              &ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} claims
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={
                    p === page
                      ? "px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold"
                      : "px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition"
                  }
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {approvingClaim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl bg-green-50">
              ✅
            </div>

            <h2 className="text-xl font-black text-[#1a237e] mb-2">Verify & Release Item?</h2>
            <p className="text-gray-400 text-sm mb-8">
              {approvingClaim.item} will be released to {approvingClaim.student}. This will be recorded in the audit trail.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setApprovingClaim(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingClaim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl bg-red-50">
              ⚠️
            </div>

            <h2 className="text-xl font-black text-[#1a237e] mb-2">Reject This Claim?</h2>
            <p className="text-gray-400 text-sm mb-6">
              {rejectingClaim.student}&apos;s claim for {rejectingClaim.item} will be marked as rejected. The student may appeal with additional evidence.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Optional: reason for rejection..."
              rows={3}
              className="w-full mb-6 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 text-gray-700 text-sm resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRejectingClaim(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}