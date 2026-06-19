"use client";
import { useState } from "react";

const reportHistory = [
  { item: "Blue Umbrella", type: "lost", status: "Matched", date: "Jun 12, 2026", icon: "☂️" },
  { item: "Black Wallet", type: "found", status: "Returned", date: "May 20, 2026", icon: "👛" },
  { item: "Calculator", type: "lost", status: "Returned", date: "Apr 15, 2026", icon: "🧮" },
];

const badges = [
  { name: "Honest Finder", icon: "🤝", desc: "Returned 2+ found items", earned: true },
  { name: "Quick Reporter", icon: "⚡", desc: "Reported within 1 hour", earned: true },
  { name: "Trusted Member", icon: "🛡️", desc: "Trust score above 90", earned: true },
  { name: "Campus Hero", icon: "🏆", desc: "Returned 5+ found items", earned: false },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("history");
  const trustScore = 95;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-[#1a237e]">FIND<span className="text-[#ffd700]">NEST</span></span>
        </div>
        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold border-2 border-[#ffd700]">R</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-10 py-8 max-w-screen-xl mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#1a237e]">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account and view your activity</p>
        </div>

        <div className="flex gap-6 items-start">

          {/* Left Column */}
          <div className="w-72 shrink-0 flex flex-col gap-5">

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-[#1a237e] to-[#1565c0]" />
              <div className="px-6 pb-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-3xl mx-auto -mt-10 mb-3">👤</div>
                <h2 className="text-base font-black text-[#1a237e]">Raymart D. Chabas</h2>
                <p className="text-gray-400 text-xs mt-0.5">BS Information Technology</p>
                <p className="text-gray-400 text-xs">2022-10043</p>

                {/* Trust Score */}
                <div className="mt-5 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#22c55e" strokeWidth="8" fill="none"
                        strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-green-600">{trustScore}</span>
                      <span className="text-[10px] text-gray-400 font-bold">TRUST SCORE</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-xl py-2">
                    <p className="text-lg font-black text-[#1a237e]">3</p>
                    <p className="text-[10px] text-gray-500 font-bold">FILED</p>
                  </div>
                  <div className="bg-green-50 rounded-xl py-2">
                    <p className="text-lg font-black text-green-600">2</p>
                    <p className="text-[10px] text-gray-500 font-bold">RECOVERED</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl py-2">
                    <p className="text-lg font-black text-yellow-600">1</p>
                    <p className="text-[10px] text-gray-500 font-bold">RETURNED</p>
                  </div>
                </div>

                <button className="w-full mt-5 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-2.5 rounded-xl transition text-sm">Edit Profile</button>
                <a href="/" className="block w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl transition text-sm text-center">Logout</a>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <p className="font-black text-gray-700 text-sm mb-4">Achievements</p>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className={`text-center rounded-2xl p-3 ${badge.earned ? "bg-yellow-50" : "bg-gray-50 opacity-40"}`}>
                    <p className="text-2xl mb-1">{badge.icon}</p>
                    <p className="font-bold text-gray-700 text-xs">{badge.name}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">{badge.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === "history" ? "bg-[#1a237e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Report History
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === "about" ? "bg-[#1a237e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Account Details
              </button>
            </div>

            {/* Report History Tab */}
            {activeTab === "history" && (
              <>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <p className="font-black text-gray-700">Your Lost & Found Activity</p>
                    <p className="text-gray-400 text-xs mt-0.5">A record of everything you have reported or found</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {reportHistory.map((report, index) => (
                      <div key={index} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${report.type === "lost" ? "bg-red-50" : "bg-green-50"}`}>
                            {report.icon}
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-sm">{report.item}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{report.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-4 py-1.5 rounded-lg ${report.type === "lost" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                            {report.type === "lost" ? "Lost" : "Found"}
                          </span>
                          <span className={`text-xs font-bold px-4 py-1.5 rounded-lg ${report.status === "Matched" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                            {report.status}
                          </span>
                          <button className="text-xs font-bold px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-black text-[#1a237e]">3</p>
                      <p className="text-xs text-gray-400 font-bold">Total Reports Filed</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-black text-green-600">2</p>
                      <p className="text-xs text-gray-400 font-bold">Items Recovered</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-black text-yellow-600">1</p>
                      <p className="text-xs text-gray-400 font-bold">Items Returned</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Details Tab */}
            {activeTab === "about" && (
              <>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <p className="font-black text-gray-700 mb-5">Account Information</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Full Name</p>
                      <p className="font-bold text-gray-700 text-sm">Raymart D. Chabas</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Student ID</p>
                      <p className="font-bold text-gray-700 text-sm">2022-10043</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Course</p>
                      <p className="font-bold text-gray-700 text-sm">BS Information Technology</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Year Level</p>
                      <p className="font-bold text-gray-700 text-sm">4th Year</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Email</p>
                      <p className="font-bold text-gray-700 text-sm">raymart.chabas@sjdmcci.edu.ph</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Account Status</p>
                      <p className="font-bold text-green-600 text-sm">✓ Active</p>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <p className="font-black text-gray-700 mb-5">Security & Privacy</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between col-span-2">
                      <div>
                        <p className="font-bold text-gray-700 text-sm">Password</p>
                        <p className="text-gray-400 text-xs mt-0.5">Last changed 30 days ago</p>
                      </div>
                      <button className="text-xs font-bold px-4 py-1.5 rounded-lg bg-[#1a237e] text-white hover:bg-[#283593] transition">Change</button>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-700 text-sm">2FA</p>
                        <p className="text-gray-400 text-xs mt-0.5">Not enabled</p>
                      </div>
                      <button className="text-xs font-bold px-4 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">Enable</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}