"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface AuditRecord {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  performed_by: string;
  created_at: string;
}

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

interface CaseLogEntry {
  id: number;
  action: string;
  details: string;
  performed_by: string;
  created_at: string;
}

function actionBadgeClass(action: string) {
  const a = action.toLowerCase();
  if (a.includes("approved") || a.includes("claimed") || a.includes("restored") || a.includes("created")) {
    return "bg-green-50 text-green-700";
  }
  if (a.includes("found")) return "bg-teal-50 text-teal-700";
  if (a.includes("assigned")) return "bg-purple-50 text-purple-700";
  if (a.includes("disposed")) return "bg-orange-50 text-orange-700";
  if (a.includes("revoked") || a.includes("rejected") || a.includes("deleted")) return "bg-red-50 text-red-600";
  if (a.includes("login")) return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

function statusBadge(status: string) {
  switch (status) {
    case "Returned": return "bg-green-50 text-green-700";
    case "Claim Rejected": return "bg-red-50 text-red-700";
    case "Pending Verification": return "bg-yellow-50 text-yellow-700";
    case "Match Found": return "bg-purple-50 text-purple-700";
    default: return "bg-blue-50 text-blue-700";
  }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function SuperAdminRecords() {
  const [view, setView] = useState<"activity" | "cases">("activity");

  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [caseSearch, setCaseSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [caseLogs, setCaseLogs] = useState<CaseLogEntry[]>([]);
  const [caseLogsLoading, setCaseLogsLoading] = useState(false);

  const fetchRecords = async (pageNum: number, searchTerm: string) => {
    setRecordsLoading(true);
    try {
      const response = await api.get("/audit-logs", {
        params: { page: pageNum, action: searchTerm || undefined },
      });
      const data = response.data.logs;
      setRecords(data.data || []);
      setLastPage(data.last_page || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const fetchCases = async (searchTerm: string) => {
    setCasesLoading(true);
    try {
      const response = await api.get("/case-trail", { params: { search: searchTerm || undefined } });
      const result: CaseSummary[] = response.data.cases || [];
      setCases(result);
      if (result.length > 0) setSelectedCase(result[0]);
      else setSelectedCase(null);
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const fetchCaseLogs = async (reportId: number) => {
    setCaseLogsLoading(true);
    try {
      const response = await api.get(`/case-trail/${reportId}`);
      setCaseLogs(response.data.logs || []);
    } catch (err) {
      console.error("Error fetching case detail:", err);
    } finally {
      setCaseLogsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "activity") fetchRecords(page, search);
  }, [view, page]);

  useEffect(() => {
    if (view !== "activity") return;
    const t = setTimeout(() => { setPage(1); fetchRecords(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (view === "cases") fetchCases(caseSearch);
  }, [view]);

  useEffect(() => {
    if (view !== "cases") return;
    const t = setTimeout(() => fetchCases(caseSearch), 400);
    return () => clearTimeout(t);
  }, [caseSearch]);

  useEffect(() => {
    if (selectedCase) fetchCaseLogs(selectedCase.report_id);
    else setCaseLogs([]);
  }, [selectedCase]);

  const claimedCount = records.filter((r) => r.action.toLowerCase().includes("claim")).length;
  const systemCount = records.filter((r) => r.performed_by.toLowerCase() === "system").length;
  const revokedCount = records.filter((r) => r.action.toLowerCase().includes("revoked")).length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/user-management" className="text-white font-black text-lg block hover:opacity-80 transition">
              FIND<span className="text-[#ffd700]">NEST</span>
            </a>
            <span className="text-blue-300 text-xs">Super Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Management</p>
          <a href="/user-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>User Management</span>
          </a>
          <a href="/admin-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Admin Management</span>
          </a>
          <a href="/system-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>System Management</span>
          </a>
          <a href="/super-admin-records" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Digital Records</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Super Admin</p>
            <p className="text-blue-300 text-xs mt-1">System Administrator</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a237e]">Digital Records</h1>
          <p className="text-gray-400 text-sm mt-1">Complete system-wide, tamper-evident audit log</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setView("activity")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              view === "activity" ? "bg-[#1a237e] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]"
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setView("cases")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              view === "cases" ? "bg-[#1a237e] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]"
            }`}
          >
            By Case
          </button>
        </div>

        {view === "activity" ? (
          <>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-medium">Total Logs</p>
                <p className="text-3xl font-black text-[#1a237e] mt-1">{total}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-medium">Claim Actions (this page)</p>
                <p className="text-3xl font-black text-green-600 mt-1">{claimedCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-medium">System Events (this page)</p>
                <p className="text-3xl font-black text-gray-600 mt-1">{systemCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-medium">Revoked (this page)</p>
                <p className="text-3xl font-black text-red-500 mt-1">{revokedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="font-black text-gray-700">System-Wide Audit Log</h2>
                  <p className="text-gray-400 text-xs">All entries are permanent and cannot be modified</p>
                </div>
                <input
                  type="text"
                  placeholder="Search logs by action keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
                />
              </div>

              {recordsLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading records...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log ID</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performed By</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-black text-[#1a237e] text-sm">#REC-{String(record.id).padStart(3, "0")}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${actionBadgeClass(record.action)}`}>
                            {record.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-700 text-sm">{record.details}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg">{record.performed_by}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-400 text-sm">{formatTime(record.created_at)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!recordsLoading && records.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="font-bold text-lg">No records found</p>
                  <p className="text-sm mt-1">Try searching with a different keyword</p>
                </div>
              )}

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-gray-400 text-sm">Showing page {page} of {lastPage} &middot; {total} total records</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold">{page}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-black text-gray-700 text-sm mb-3">Case List</h2>
                  <input
                    type="text"
                    placeholder="Search cases by item name..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                  />
                </div>

                {casesLoading ? (
                  <div className="px-5 py-16 text-center text-gray-400 text-sm">Loading cases...</div>
                ) : cases.length === 0 ? (
                  <div className="px-5 py-16 text-center text-gray-400 text-sm">No lost item reports yet.</div>
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
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">No Photo</div>
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
                          <img src={selectedCase.photo_url} alt={selectedCase.item_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/60 text-[10px] font-bold text-center px-1">No Photo</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-black text-xl">{selectedCase.item_name}</p>
                        <p className="text-blue-200 text-sm">{selectedCase.category} &middot; {selectedCase.case_id}</p>
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
                        Chronological Case Trail &mdash; {caseLogs.length} recorded actions
                      </p>

                      {caseLogsLoading ? (
                        <div className="text-center py-16 text-gray-400 text-sm">Loading trail...</div>
                      ) : caseLogs.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 text-sm">No recorded actions yet for this case.</div>
                      ) : (
                        <div className="relative">
                          {caseLogs.map((entry, index) => {
                            const isLast = index === caseLogs.length - 1;
                            return (
                              <div key={entry.id} className="flex gap-4 relative">
                                {!isLast && <div className="absolute left-[7px] top-6 w-0.5 h-full bg-gray-200" />}
                                <div className="w-4 h-4 rounded-full flex-shrink-0 z-10 mt-1.5 bg-[#1a237e]" />
                                <div className={`flex-1 ${isLast ? "pb-2" : "pb-8"}`}>
                                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-white text-gray-700 border border-gray-200">
                                        {entry.action}
                                      </span>
                                      <span className="text-xs font-mono text-gray-400">{formatTime(entry.created_at)}</span>
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
                  <div className="text-center py-24 text-gray-400 text-sm">Select a case from the list to view its full trail.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}