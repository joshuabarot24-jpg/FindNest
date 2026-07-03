"use client";

import { useState } from "react";

const records = [
  { id: "#REC-001", action: "User Created", item: "New Admin Account", staff: "Super Admin", timestamp: "2026-07-01", type: "created" },
  { id: "#REC-002", action: "Admin Role Assigned", item: "Security Office Main", staff: "Super Admin", timestamp: "2026-07-01", type: "assigned" },
  { id: "#REC-003", action: "Item Claimed", item: "Towel red color", staff: "Admin_01", timestamp: "2026-06-30", type: "claimed" },
  { id: "#REC-004", action: "New Found Report", item: "Glasses", staff: "Admin_03", timestamp: "2026-06-29", type: "found" },
  { id: "#REC-005", action: "Admin Role Revoked", item: "IT Laboratory Staff", staff: "Super Admin", timestamp: "2026-06-28", type: "revoked" },
  { id: "#REC-006", action: "Item Claimed", item: "Keyset", staff: "Admin_01", timestamp: "2026-06-27", type: "claimed" },
  { id: "#REC-007", action: "System Backup", item: "Full Database Backup", staff: "System", timestamp: "2026-06-27", type: "system" },
  { id: "#REC-008", action: "Item Disposed", item: "Blue Water Bottle", staff: "Admin_02", timestamp: "2026-06-26", type: "disposed" },
  { id: "#REC-009", action: "Claim Rejected", item: "Black Wallet", staff: "Admin_01", timestamp: "2026-06-25", type: "rejected" },
  { id: "#REC-010", action: "New User Created", item: "Student Account", staff: "Super Admin", timestamp: "2026-06-24", type: "created" },
  { id: "#REC-011", action: "AI Match Confirmed", item: "iPhone 15 Pro Max", staff: "Admin_01", timestamp: "2026-06-23", type: "found" },
  { id: "#REC-012", action: "System Update", item: "v1.0.0 Deployed", staff: "System", timestamp: "2026-06-22", type: "system" },
];

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  created: { bg: "bg-blue-50", text: "text-blue-700", label: "Created" },
  assigned: { bg: "bg-purple-50", text: "text-purple-700", label: "Assigned" },
  claimed: { bg: "bg-green-50", text: "text-green-700", label: "Claimed" },
  found: { bg: "bg-teal-50", text: "text-teal-700", label: "Found" },
  revoked: { bg: "bg-red-50", text: "text-red-600", label: "Revoked" },
  system: { bg: "bg-gray-100", text: "text-gray-600", label: "System" },
  disposed: { bg: "bg-orange-50", text: "text-orange-700", label: "Disposed" },
  rejected: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Rejected" },
};

export default function SuperAdminRecords() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.action.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

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
          <a 
            href="/user-management" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
            <span>User Management</span>
          </a>
          <a 
            href="/admin-management" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
            <span>Admin Management</span>
          </a>
          <a 
            href="/system-management" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
            <span>System Management</span>
          </a>
          <a 
            href="/super-admin-records" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20"
          >
            <span>Digital Records</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Super Admin</p>
            <p className="text-blue-300 text-xs mt-1">System Administrator</p>
          </div>
          
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Digital Records</h1>
            <p className="text-gray-400 text-sm mt-1">Complete system-wide audit trail — all actions logged and tamper-evident</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <span className="text-yellow-700 text-sm font-bold">Read-Only Audit Trail!</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Logs</p>
                <p className="text-3xl font-black text-[#1a237e] mt-1">{records.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Claimed</p>
                <p className="text-3xl font-black text-green-600 mt-1">{records.filter((r) => r.type === "claimed").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">System Events</p>
                <p className="text-3xl font-black text-gray-600 mt-1">{records.filter((r) => r.type === "system").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Revoked</p>
                <p className="text-3xl font-black text-red-500 mt-1">{records.filter((r) => r.type === "revoked").length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-black text-gray-700">System-Wide Audit Log</h2>
                <p className="text-gray-400 text-xs">All entries are permanent and cannot be modified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
              >
                <option value="all">All Types</option>
                <option value="created">Created</option>
                <option value="assigned">Assigned</option>
                <option value="claimed">Claimed</option>
                <option value="found">Found</option>
                <option value="revoked">Revoked</option>
                <option value="system">System</option>
                <option value="disposed">Disposed</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-64"
              />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log ID</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item / Target</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Staff</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((record, index) => {
                const style = typeStyles[record.type];
                return (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-black text-[#1a237e] text-sm">{record.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${style.bg} ${style.text}`}>
                        {record.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-700 text-sm">{record.item}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg">{record.staff}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{record.timestamp}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🗂️</p>
              <p className="font-bold text-lg">No records found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Showing {filtered.length} of {records.length} records</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">Previous</button>
              <button className="px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold">1</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}