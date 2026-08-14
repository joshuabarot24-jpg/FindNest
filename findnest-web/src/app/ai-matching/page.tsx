"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";

interface AiMatch {
  id: number;
  report_id: number;
  found_id: number;
  confidence_score: number | null;
  match_status: "pending" | "confirmed" | "rejected" | string;
  matched_at: string | null;
  created_at: string;
  report: {
    id: number;
    item_name: string;
    category: string;
    location_lost: string;
    date_lost: string;
    photo_url: string | null;
    user?: { name: string; school_id: string | null };
  } | null;
  foundItem: {
    id: number;
    item_name: string;
    category: string;
    location_found: string;
    storage_location: string | null;
    photo_url: string | null;
  } | null;
}

const PAGE_SIZE = 5;

function statusStyles(status: string) {
  switch (status) {
    case "confirmed":
      return { dot: "bg-green-500", badge: "bg-green-50 text-green-700", label: "Confirmed" };
    case "rejected":
      return { dot: "bg-red-500", badge: "bg-red-50 text-red-600", label: "Rejected" };
    default:
      return { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700", label: "Pending" };
  }
}

function scoreColor(score: number | null) {
  if (score == null) return "bg-gray-100 text-gray-500";
  if (score >= 80) return "bg-green-50 text-green-700";
  if (score >= 60) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-600";
}

export default function AiMatching() {
  const [matches, setMatches] = useState<AiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewingMatch, setViewingMatch] = useState<AiMatch | null>(null);
  const [rejectingMatch, setRejectingMatch] = useState<AiMatch | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchMatches = async () => {
    try {
      const res = await api.get("/ai-matches");
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error("Error fetching AI matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        (m.report?.item_name || "").toLowerCase().includes(q) ||
        (m.foundItem?.item_name || "").toLowerCase().includes(q) ||
        m.match_status.toLowerCase().includes(q)
    );
  }, [matches, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = matches.filter((m) => m.match_status === "pending").length;
  const confirmedCount = matches.filter((m) => m.match_status === "confirmed").length;
  const rejectedCount = matches.filter((m) => m.match_status === "rejected").length;

  async function handleConfirm(match: AiMatch) {
    setActionLoading(true);
    try {
      await api.post(`/ai-matches/${match.id}/confirm`);
      setToast(`Match for ${match.report?.item_name || "item"} was confirmed.`);
      setViewingMatch(null);
      fetchMatches();
    } catch (err) {
      console.error("Confirm error:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectingMatch) return;
    setActionLoading(true);
    try {
      await api.post(`/ai-matches/${rejectingMatch.id}/reject`);
      setToast(`Match for ${rejectingMatch.report?.item_name || "item"} was rejected.`);
      setRejectingMatch(null);
      setViewingMatch(null);
      fetchMatches();
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(false);
    }
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
          <a href="/claim-verification" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Claim Verification</span>
          </a>
          <a href="/location-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Location Analytics</span>
          </a>
          <a href="/digital-records" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Digital Records</span>
          </a>
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Assistive AI Matching</span>
          </a>
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Audit Trail</span>
          </a>
          <a href="/admin-support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Support Inbox</span>
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
            <h1 className="text-3xl font-black text-[#1a237e]">Assistive AI Matching</h1>
            <p className="text-gray-400 text-sm mt-1">Review AI-generated matches between lost and found item reports</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-blue-700 text-sm font-bold">AI Engine — Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Pending Review</p>
            <p className="text-4xl font-black text-yellow-500 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Confirmed Matches</p>
            <p className="text-4xl font-black text-green-600 mt-1">{confirmedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Rejected Matches</p>
            <p className="text-4xl font-black text-red-500 mt-1">{rejectedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All AI Matches</h2>
            <input
              type="text"
              placeholder="Search by item name or status..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading matches...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lost Item</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Found Item</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">AI Score</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((match) => {
                  const styles = statusStyles(match.match_status);
                  return (
                    <tr key={match.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {match.report?.photo_url ? (
                              <img src={match.report.photo_url} alt={match.report.item_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-sm">{match.report?.item_name || "—"}</p>
                            <p className="text-gray-400 text-xs">{match.report?.user?.name || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {match.foundItem?.photo_url ? (
                              <img src={match.foundItem.photo_url} alt={match.foundItem.item_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-sm">{match.foundItem?.item_name || "—"}</p>
                            <p className="text-gray-400 text-xs">{match.foundItem?.location_found || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${scoreColor(match.confidence_score)}`}>
                          {match.confidence_score != null ? `${match.confidence_score}%` : "Pending AI"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${styles.badge}`}>{styles.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">{new Date(match.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingMatch(match)}
                          className="bg-blue-50 hover:bg-[#1a237e] hover:text-white text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold text-lg">No matches found</p>
              <p className="text-sm mt-1">AI matches will appear here once the matching engine runs</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} matches
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={p === page ? "px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold" : "px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition"}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </main>

      {viewingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewingMatch(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>

            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Match Review</h2>
            <p className="text-gray-400 text-sm mb-6">Match #{String(viewingMatch.id).padStart(4, "0")} &mdash; {new Date(viewingMatch.created_at).toLocaleString()}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Lost Item Report</p>
                <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden mb-3">
                  {viewingMatch.report?.photo_url ? (
                    <img src={viewingMatch.report.photo_url} alt="Lost" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Photo</div>
                  )}
                </div>
                <p className="font-black text-gray-700">{viewingMatch.report?.item_name || "—"}</p>
                <p className="text-gray-400 text-xs mt-1">Lost at: {viewingMatch.report?.location_lost}</p>
                <p className="text-gray-400 text-xs">Date: {viewingMatch.report?.date_lost}</p>
                <p className="text-gray-400 text-xs">Student: {viewingMatch.report?.user?.name || "—"}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Found Item</p>
                <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden mb-3">
                  {viewingMatch.foundItem?.photo_url ? (
                    <img src={viewingMatch.foundItem.photo_url} alt="Found" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Photo</div>
                  )}
                </div>
                <p className="font-black text-gray-700">{viewingMatch.foundItem?.item_name || "—"}</p>
                <p className="text-gray-400 text-xs mt-1">Found at: {viewingMatch.foundItem?.location_found}</p>
                <p className="text-gray-400 text-xs">Storage: {viewingMatch.foundItem?.storage_location || "—"}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">AI Analysis</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Confidence Score</span>
                <span className={`text-sm font-black px-3 py-1 rounded-lg ${scoreColor(viewingMatch.confidence_score)}`}>
                  {viewingMatch.confidence_score != null ? `${viewingMatch.confidence_score}%` : "Pending AI Integration"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Match Status</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusStyles(viewingMatch.match_status).badge}`}>
                  {statusStyles(viewingMatch.match_status).label}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Visual similarity scoring via MobileNetV2 will be available once the AI Python module is connected.
              </p>
            </div>

            {viewingMatch.match_status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectingMatch(viewingMatch)}
                  disabled={actionLoading}
                  className="flex-1 border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
                >
                  Reject Match
                </button>
                <button
                  onClick={() => handleConfirm(viewingMatch)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm Match"}
                </button>
              </div>
            )}

            {viewingMatch.match_status !== "pending" && (
              <button onClick={() => setViewingMatch(null)} className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition">Close</button>
            )}
          </div>
        </div>
      )}

      {rejectingMatch && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0d1757]/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <h2 className="text-xl font-black text-[#1a237e] mb-2">Reject This Match?</h2>
            <p className="text-gray-400 text-sm mb-8">
              This will mark the match between {rejectingMatch.report?.item_name || "lost item"} and {rejectingMatch.foundItem?.item_name || "found item"} as rejected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRejectingMatch(null)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleRejectConfirm} disabled={actionLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}