"use client";
import { useState, useRef } from "react";

const reportHistory = [
  { item: "Blue Umbrella", type: "lost", status: "Matched", date: "Jun 12, 2026", icon: "☂️" },
  { item: "Black Wallet", type: "found", status: "Returned", date: "May 20, 2026", icon: "👛" },
  { item: "Calculator", type: "lost", status: "Returned", date: "Apr 15, 2026", icon: "🧮" },
  { item: "Student ID", type: "lost", status: "Lost", date: "Mar 10, 2026", icon: "🪪" },
  { item: "Car Keys", type: "found", status: "Found", date: "Feb 28, 2026", icon: "🔑" },
];

const badges = [
  { name: "Honest Finder", icon: "🤝", desc: "Returned 2+ found items", earned: true },
  { name: "Quick Reporter", icon: "⚡", desc: "Reported within 1 hour", earned: true },
  { name: "Trusted Member", icon: "🛡️", desc: "Trust score above 90", earned: true },
  { name: "Campus Hero", icon: "🏆", desc: "Returned 5+ found items", earned: false },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [name, setName] = useState("Raymart D. Chabas");
  const [course, setCourse] = useState("BS Information Technology");
  const [yearLevel, setYearLevel] = useState("4th Year");
  const detailsRef = useRef<HTMLDivElement>(null);
  const trustScore = 95;

  const tabs = ["all", "lost", "matched", "found", "returned"];

  const filtered = reportHistory.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "lost") return r.status === "Lost";
    if (activeTab === "matched") return r.status === "Matched";
    if (activeTab === "found") return r.status === "Found";
    if (activeTab === "returned") return r.status === "Returned";
    return true;
  });

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/student-home" className="flex items-center gap-3">
          <span className="text-lg font-black text-[#1a237e]">FIND<span className="text-[#ffd700]">NEST</span></span>
        </a>
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
          <button onClick={scrollToDetails} className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#283593] transition">
            R
          </button>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6">

          <div className="col-span-1 space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-[#1a237e] to-[#1565c0]" />
              <div className="px-6 pb-6 text-center">
                <button onClick={scrollToDetails} className="w-20 h-20 bg-gray-200 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-3xl mx-auto -mt-10 mb-3 hover:opacity-80 transition">
                  👤
                </button>
                <h1 className="text-lg font-black text-[#1a237e]">{name}</h1>
                <p className="text-gray-400 text-xs">{course}</p>
                <p className="text-gray-400 text-xs">2022-10043</p>

                <div className="mt-5 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#22c55e" strokeWidth="8" fill="none" strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-green-600">{trustScore}</span>
                      <span className="text-[10px] text-gray-400 font-bold">TRUST</span>
                    </div>
                  </div>
                </div>

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

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-5 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </button>
                <a href="/" className="block w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl transition text-sm text-center">
                  Logout
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <p className="font-black text-gray-700 text-sm mb-4">Achievements</p>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className={`text-center rounded-2xl p-3 ${badge.earned ? "bg-yellow-50" : "bg-gray-50 opacity-40"}`}>
                    <p className="text-2xl mb-1">{badge.icon}</p>
                    <p className="font-bold text-gray-700 text-xs">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-5">

            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition capitalize ${activeTab === tab ? "bg-[#1a237e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="font-black text-gray-700">Your Lost & Found Activity</p>
                <p className="text-gray-400 text-xs mt-0.5">A record of everything you have reported or found</p>
              </div>
              <div className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map((report, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${report.type === "lost" ? "bg-red-50" : "bg-green-50"}`}>
                        {report.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-sm">{report.item}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        report.status === "Matched" ? "bg-blue-50 text-blue-700" :
                        report.status === "Returned" ? "bg-green-50 text-green-700" :
                        report.status === "Found" ? "bg-teal-50 text-teal-700" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {report.status}
                      </span>
                      <a href="/claim-status" className="bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                        View
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-bold">No {activeTab} reports found</p>
                  </div>
                )}
              </div>
            </div>

            <div ref={detailsRef} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="font-black text-gray-700 mb-5">Account Information</p>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Course</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Year Level</label>
                    <input
                      type="text"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none text-gray-700 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Full Name</p>
                    <p className="font-bold text-gray-700 text-sm">{name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Student ID</p>
                    <p className="font-bold text-gray-700 text-sm">2022-10043</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Course</p>
                    <p className="font-bold text-gray-700 text-sm">{course}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Year Level</p>
                    <p className="font-bold text-gray-700 text-sm">{yearLevel}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Account Status</p>
                    <p className="font-bold text-green-600 text-sm">Active</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Trust Score</p>
                    <p className="font-bold text-green-600 text-sm">{trustScore} / 100</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="font-black text-gray-700 mb-5">Security & Notifications</p>
              <div className="space-y-4">

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Password</p>
                    <p className="text-gray-400 text-xs mt-0.5">Last changed 30 days ago</p>
                  </div>
                  <button
                    onClick={() => setChangingPassword(!changingPassword)}
                    className="bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Change
                  </button>
                </div>
                {changingPassword && (
                  <div className="px-4 pb-2 space-y-2">
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none text-gray-700 text-sm"
                    />
                    <button
                      onClick={() => { setChangingPassword(false); setNewPassword(""); }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition text-sm"
                    >
                      Save New Password
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Email Address</p>
                    <p className="text-gray-400 text-xs mt-0.5">raymart.chabas@sjdmcci.edu.ph</p>
                  </div>
                  <button
                    onClick={() => setChangingEmail(!changingEmail)}
                    className="bg-[#1a237e] hover:bg-[#283593] text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Change
                  </button>
                </div>
                {changingEmail && (
                  <div className="px-4 pb-2 space-y-2">
                    <input
                      type="email"
                      placeholder="New email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none text-gray-700 text-sm"
                    />
                    <button
                      onClick={() => { setChangingEmail(false); setNewEmail(""); }}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition text-sm"
                    >
                      Save New Email
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Push Notifications</p>
                    <p className="text-gray-400 text-xs mt-0.5">AI match alerts and claim updates</p>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notificationsEnabled ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${notificationsEnabled ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Email Alerts</p>
                    <p className="text-gray-400 text-xs mt-0.5">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${emailAlertsEnabled ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${emailAlertsEnabled ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}