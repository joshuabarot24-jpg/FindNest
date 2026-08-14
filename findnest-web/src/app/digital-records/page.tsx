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

function actionBadgeClass(action: string) {
  const a = action.toLowerCase();
  if (a.includes("approved") || a.includes("claimed") || a.includes("restored") || a.includes("created") || a.includes("logged")) {
    return "bg-green-50 text-green-700";
  }
  if (a.includes("found") || a.includes("assigned") || a.includes("updated")) {
    return "bg-blue-50 text-blue-700";
  }
  if (a.includes("disposed") || a.includes("rejected") || a.includes("deleted")) {
    return "bg-red-50 text-red-600";
  }
  if (a.includes("pending")) {
    return "bg-yellow-50 text-yellow-700";
  }
  return "bg-gray-50 text-gray-600";
}

function isAdminRelevant(action: string, targetType: string): boolean {
  const a = action.toLowerCase();
  const t = (targetType || "").toLowerCase();
  if (t.includes("found_item") || t.includes("claim")) return true;
  if (
    a.includes("item") ||
    a.includes("found") ||
    a.includes("claim") ||
    a.includes("approved") ||
    a.includes("rejected") ||
    a.includes("disposed") ||
    a.includes("unclaimed") ||
    a.includes("surrendered") ||
    a.includes("storage") ||
    a.includes("logged")
  ) return true;
  return false;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function DigitalRecords() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRecords = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await api.get("/audit-logs", {
        params: { page: pageNum },
      });
      const data = response.data.logs;
      const allRecords: AuditRecord[] = data.data || [];
      const filtered = allRecords.filter((r) =>
        isAdminRelevant(r.action, r.target_type)
      );
      setRecords(filtered);
      setLastPage(data.last_page || 1);
      setTotal(filtered.length);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(page);
  }, [page]);

  const displayed = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.action.toLowerCase().includes(q) ||
      (r.details || "").toLowerCase().includes(q) ||
      (r.performed_by || "").toLowerCase().includes(q)
    );
  });

  const approvedCount = records.filter((r) => r.action.toLowerCase().includes("approved") || r.action.toLowerCase().includes("claimed")).length;
  const itemCount = records.filter((r) => r.action.toLowerCase().includes("item") || r.action.toLowerCase().includes("found") || r.action.toLowerCase().includes("logged")).length;
  const rejectedCount = records.filter((r) => r.action.toLowerCase().includes("rejected") || r.action.toLowerCase().includes("disposed")).length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">

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
          <a href="/digital-records" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Digital Records</span>
          </a>
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Digital Records</h1>
            <p className="text-gray-400 text-sm mt-1">Audit trail for found items and claim actions handled by this admin</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <span className="text-yellow-700 text-sm font-bold">Read-Only Records</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Item Actions (this page)</p>
            <p className="text-3xl font-black text-[#1a237e] mt-1">{itemCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Claims Approved (this page)</p>
            <p className="text-3xl font-black text-green-600 mt-1">{approvedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Rejected / Disposed (this page)</p>
            <p className="text-3xl font-black text-red-500 mt-1">{rejectedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="font-black text-gray-700">Item & Claim Activity Log</h2>
              <p className="text-gray-400 text-xs">Showing found item and claim-related actions only</p>
            </div>
            <input
              type="text"
              placeholder="Search by action, details, or performed by..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-80"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading records...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performed By</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map((record) => (
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
                      <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">
                        {record.performed_by}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{formatTime(record.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && displayed.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold text-lg">No records found</p>
              <p className="text-sm mt-1">Item and claim actions will appear here as they happen</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {displayed.length} relevant records &mdash; page {page} of {lastPage}
            </p>
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
      </main>
    </div>
  );
}