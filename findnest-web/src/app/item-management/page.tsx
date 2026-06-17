"use client";
import Image from "next/image";
import { useState } from "react";

const items = [
  {
    id: 1,
    name: "Calculus Textbook",
    category: "Books",
    location: "Cabinet A-12",
    status: "Unclaimed",
    photo: "❓",
  },
  {
    id: 2,
    name: "Black Wallet",
    category: "Personal Belongings",
    location: "Cabinet A-01",
    status: "Claimed",
    photo: "❓",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    category: "Electronics",
    location: "Cabinet A-03",
    status: "Unclaimed",
    photo: "❓",
  },
  {
    id: 4,
    name: "Blue Water Bottle",
    category: "Personal Belongings",
    location: "Cabinet A-05",
    status: "For Disposal",
    photo: "❓",
  },
  {
    id: 5,
    name: "Student ID",
    category: "ID/Cards",
    location: "Cabinet A-02",
    status: "Unclaimed",
    photo: "❓",
  },
];

export default function ItemManagement() {
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const unclaimedCount = items.filter((i) => i.status === "Unclaimed").length;
  const claimedCount = items.filter((i) => i.status === "Claimed").length;
  const disposalCount = items.filter((i) => i.status === "For Disposal").length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <span className="text-white font-black text-lg block">
              FIND<span className="text-[#ffd700]">NEST</span>
            </span>
            <span className="text-blue-300 text-xs">Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Main Menu</p>

          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Dashboard</span>
          </a>
          <a href="/item-management" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Item Management</h1>
            <p className="text-gray-400 text-sm mt-1">
              Review, approve and manage all lost and found item reports
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform">
            <span>+</span> Log New Found Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Unclaimed Items</p>
                <p className="text-4xl font-black text-[#1a237e] mt-1">{unclaimedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Claimed Items</p>
                <p className="text-4xl font-black text-green-600 mt-1">{claimedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">For Disposal</p>
                <p className="text-4xl font-black text-red-500 mt-1">{disposalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Items</h2>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-64"
            />
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Photo</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Storage Location</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {item.photo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-700">{item.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">ID: ITM-00{item.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-500 text-sm">{item.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === "Claimed" ? "bg-green-500" :
                        item.status === "Unclaimed" ? "bg-blue-500" :
                        "bg-red-500"
                      }`} />
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        item.status === "Claimed"
                          ? "bg-green-50 text-green-700"
                          : item.status === "Unclaimed"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="bg-blue-50 hover:bg-[#1a237e] hover:text-white text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        View
                      </button>
                      <button className="bg-yellow-50 hover:bg-yellow-500 hover:text-white text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        Edit
                      </button>
                      <button className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        Dispose
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="font-bold text-lg">No items found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Showing {filtered.length} of {items.length} items</p>
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