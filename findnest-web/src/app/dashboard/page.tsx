"use client";
import Image from "next/image";

const recentActivity = [
  { item: "Blue water bottle", status: "Found at Gym", time: "10 mins ago", type: "found" },
  { item: "iPhone 13 Case", status: "Reported Lost", time: "1 hr ago", type: "lost" },
  { item: "Wallet with Cash", status: "Found in Bathroom", time: "35 mins ago", type: "found" },
  { item: "Vape black", status: "Reported Lost", time: "6 hr ago", type: "lost" },
  { item: "Tumbler", status: "Reported Lost", time: "6 hr ago", type: "lost" },
  { item: "Towel red color", status: "Found at Parking Lot", time: "12 hr ago", type: "found" },
  { item: "Ballpen", status: "Reported Lost", time: "21 mins ago", type: "lost" },
  { item: "Paper", status: "Reported Lost", time: "3 hr ago", type: "lost" },
  { item: "Paper", status: "Found at Canteen", time: "32 hr ago", type: "found" },
  { item: "Wallet", status: "Reported Lost", time: "2 mins ago", type: "lost" },
  { item: "iPhone 15 pro max white color", status: "Found inside the classroom", time: "204 days ago", type: "found" },
];

export default function Dashboard() {
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

        {/* Divider */}
        <div className="mx-6 h-px bg-white/10 mb-4" />

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Main Menu</p>

          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
        </nav>

        {/* Bottom */}
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
            <h1 className="text-3xl font-black text-[#1a237e]">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back! Here is what is happening on campus today.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-600 text-sm font-medium">System Online</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-4xl font-black text-[#1a237e]">6</p>
            <p className="text-gray-400 text-sm mt-1">Items Found Today</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-4xl font-black text-[#ffd700]">6</p>
            <p className="text-gray-400 text-sm mt-1">Pending Claims</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">AI Matching</span>
            </div>
            <p className="text-4xl font-black text-green-600">92%</p>
            <p className="text-gray-400 text-sm mt-1">AI Match Success</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                🕐
              </div>
              <div>
                <h2 className="font-black text-gray-700">Recent Activity</h2>
                <p className="text-gray-400 text-xs">Latest lost and found reports</p>
              </div>
            </div>
            <button className="text-sm font-bold text-[#1a237e] hover:underline">
              View All
            </button>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                        activity.type === "found" ? "bg-green-50" : "bg-red-50"
                      }`}>
                        {activity.type === "found" ? "🚫" : "🔍"}
                      </div>
                      <p className="font-semibold text-gray-700 text-sm">{activity.item}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      activity.type === "found"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}