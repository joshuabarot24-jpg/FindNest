"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface CaseSummary {
  case_id: string;
  report_id: number;
  item_name: string;
  category: string;
  photo_url: string | null;
  status: string;
  reported_by: string | null;
  created_at: string;
}

interface LogEntry {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  performed_by: string;
  created_at: string;
}

function statusBadge(status: string) {
  switch (status) {
    case "Returned":
      return "bg-green-50 text-green-700";
    case "Claim Rejected":
      return "bg-red-50 text-red-700";
    case "Pending Verification":
      return "bg-yellow-50 text-yellow-700";
    case "Match Found":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function actionDot(action: string) {
  const a = action.toLowerCase();
  if (a.includes("approved") || a.includes("returned")) return "bg-green-500";
  if (a.includes("rejected")) return "bg-red-500";
  if (a.includes("match")) return "bg-purple-500";
  if (a.includes("claim")) return "bg-yellow-500";
  if (a.includes("found")) return "bg-teal-500";
  if (a.includes("lost")) return "bg-blue-500";
  return "bg-gray-400";
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function AdminAuditTrail() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchCases = async (searchTerm: string) => {
    setCasesLoading(true);
    try {
      const response = await api.get("/case-trail", {
        params: { search: searchTerm || undefined },
      });
      const result: CaseSummary[] = response.data.cases || [];
      setCases(result);
      if (result.length > 0) {
        setSelectedCase(result[0]);
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const fetchCaseDetail = async (reportId: number) => {
    setLogsLoading(true);
    try {
      const response = await api.get(`/case-trail/${reportId}`);
      setLogs(response.data.logs || []);
    } catch (err) {
      console.error("Error fetching case detail:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(search);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCases(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (selectedCase) {
      fetchCaseDetail(selectedCase.report_id);
    } else {
      setLogs([]);
    }
  }, [selectedCase]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/dashboard" className="text-white font-black text-lg block hover:opacity-80 transition">
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
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Assistive AI Matching</span>
          </a>
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Audit Trail</h1>
            <p className="text-gray-400 text-sm mt-1">
              Chronological record of every lost and found transaction
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <span className="text-yellow-700 text-sm font-bold">Read-Only</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-700 text-sm mb-3">Case List</h2>
                <input
                  type="text"
                  placeholder="Search cases by item name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              {casesLoading ? (
                <div className="px-5 py-16 text-center text-gray-400 text-sm">Loading cases...</div>
              ) : cases.length === 0 ? (
                <div className="px-5 py-16 text-center text-gray-400 text-sm">
                  No lost item reports yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                  {cases.map((c) => (
                    <button
                      key={c.report_id}
                      onClick={() => setSelectedCase(c)}
                      className={`w-full text-left px-5 py-4 transition ${
                        selectedCase?.report_id === c.report_id ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt={c.item_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">
                              No Photo
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-700 text-sm truncate">{c.item_name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{c.case_id}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {selectedCase ? (
                <>
                  <div className="bg-gradient-to-r from-[#1a237e] to-[#1565c0] px-6 py-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/15 rounded-2xl overflow-hidden flex-shrink-0">
                      {selectedCase.photo_url ? (
                        <img
                          src={selectedCase.photo_url}
                          alt={selectedCase.item_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60 text-[10px] font-bold text-center px-1">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-black text-xl">{selectedCase.item_name}</p>
                      <p className="text-blue-200 text-sm">
                        {selectedCase.category} &middot; {selectedCase.case_id}
                      </p>
                      {selectedCase.reported_by && (
                        <p className="text-blue-200 text-xs mt-0.5">Reported by {selectedCase.reported_by}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-4 py-2 rounded-full ${statusBadge(selectedCase.status)}`}>
                      {selectedCase.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="font-black text-gray-700 text-sm mb-6">
                      Chronological Audit Trail &mdash; {logs.length} recorded actions
                    </p>

                    {logsLoading ? (
                      <div className="text-center py-16 text-gray-400 text-sm">Loading trail...</div>
                    ) : logs.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 text-sm">
                        No recorded actions yet for this case.
                      </div>
                    ) : (
                      <div className="relative">
                        {logs.map((entry, index) => {
                          const isLast = index === logs.length - 1;
                          return (
                            <div key={entry.id} className="flex gap-4 relative">
                              {!isLast && (
                                <div className="absolute left-[7px] top-6 w-0.5 h-full bg-gray-200" />
                              )}

                              <div className={`w-4 h-4 rounded-full flex-shrink-0 z-10 mt-1.5 ${actionDot(entry.action)}`} />

                              <div className={`flex-1 ${isLast ? "pb-2" : "pb-8"}`}>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-white text-gray-700 border border-gray-200">
                                      {entry.action}
                                    </span>
                                    <span className="text-xs font-mono text-gray-400">
                                      {formatTime(entry.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{entry.details}</p>
                                  <p className="text-gray-400 text-xs mt-2">By: {entry.performed_by}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-24 text-gray-400 text-sm">
                  Select a case from the list to view its full trail.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}