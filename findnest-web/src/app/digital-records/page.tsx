"use client";
import Image from "next/image";
import { useState } from "react";

const records = [
  {
    id: "#REC-992",
    action: "Item Claimed",
    item: "Towel red color",
    staff: "Admin_01",
    timestamp: "2025-03-03",
    type: "claimed",
  },
  {
    id: "#REC-991",
    action: "New Found Report",
    item: "Glasses",
    staff: "Admin_03",
    timestamp: "2026-04-11",
    type: "found",
  },
  {
    id: "#REC-992",
    action: "Item Claimed",
    item: "Keyset",
    staff: "Admin_01",
    timestamp: "2026-04-20",
    type: "claimed",
  },
  {
    id: "#REC-992",
    action: "Item Claimed",
    item: "Paper",
    staff: "Admin_01",
    timestamp: "2026-11-30",
    type: "claimed",
  },
  {
    id: "#REC-992",
    action: "Item Claimed",
    item: "iPhone 15 pro max white color",
    staff: "Admin_01",
    timestamp: "2026-03-12",
    type: "claimed",
  },
  {
    id: "#REC-993",
    action: "Item Disposed",
    item: "Blue Water Bottle",
    staff: "Admin_02",
    timestamp: "2026-05-01",
    type: "disposed",
  },
  {
    id: "#REC-994",
    action: "Claim Rejected",
    item: "Black Wallet",
    staff: "Admin_01",
    timestamp: "2026-05-10",
    type: "rejected",
  },
  {
    id: "#REC-995",
    action: "New Lost Report",
    item: "Student ID",
    staff: "System",
    timestamp: "2026-06-01",
    type: "lost",
  },
];

export default function DigitalRecords() {
  const [search, setSearch] = useState("");

  const filtered = records.filter(
    (r) =>
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.action.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">

        {/* Logo */}
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
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Guidance Counselor</p>
            <p className="text-blue-300 text-xs mt-1">Administrator</p>
          </div>
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Digital Records</h1>
            <p className="text-gray-400 text-sm mt-1">
              All system activity stored in a tamper-evident audit log
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <span className="text-yellow-700 text-sm font-bold">Read-Only Audit Trail</span>
          </div>
        </div>

        {/* Stats Cards */}
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
                <p className="text-3xl font-black text-green-600 mt-1">
                  {records.filter((r) => r.type === "claimed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Disposed</p>
                <p className="text-3xl font-black text-red-500 mt-1">
                  {records.filter((r) => r.type === "disposed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-black text-yellow-500 mt-1">
                  {records.filter((r) => r.type === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                🗂️
              </div>
              <div>
                <h2 className="font-black text-gray-700">Audit Log</h2>
                <p className="text-gray-400 text-xs">All entries are permanent and cannot be modified</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search logs by keyword, date, or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-80"
            />
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log ID</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Staff</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-black text-[#1a237e] text-sm">{record.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      record.type === "claimed"
                        ? "bg-green-50 text-green-700"
                        : record.type === "found"
                        ? "bg-blue-50 text-blue-700"
                        : record.type === "disposed"
                        ? "bg-red-50 text-red-600"
                        : record.type === "rejected"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-gray-50 text-gray-600"
                    }`}>
                      {record.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700 text-sm">{record.item}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                      {record.staff}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">{record.timestamp}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🗂️</p>
              <p className="font-bold text-lg">No records found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Showing {filtered.length} of {records.length} records</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold">
                1
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}