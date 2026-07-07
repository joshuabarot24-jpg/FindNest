"use client";
import { useState } from "react";

const recentFoundItems = [
  { name: "Car Keys", icon: "🔑", location: "Gymnasium" },
  { name: "Aqua Flask", icon: "🍶", location: "Canteen" },
  { name: "Student ID", icon: "🪪", location: "Library" },
  { name: "Calculator", icon: "🧮", location: "Room 402" },
  { name: "Umbrella", icon: "☂️", location: "Main Entrance" },
];

export default function StudentHome() {
  const [showNotification, setShowNotification] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/student-home" className="text-lg font-black text-[#1a237e] hover:opacity-80 transition">
            FIND<span className="text-[#ffd700]">NEST</span>
          </a>
        </div>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">
            R
          </a>
        </div>
      </nav>

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {showNotification && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                🤖
              </div>
              <div>
                <p className="font-bold text-green-700 text-sm">AI Match Found!</p>
                <p className="text-green-600 text-sm">
                  The system identified a potential match for your "Blue Umbrella" report.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/view-found-items" className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                View Match
              </a>
              <button
                onClick={() => setShowNotification(false)}
                className="text-green-400 hover:text-green-600 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <a
            href="/report-lost"
            className="bg-red-500 hover:bg-red-600 rounded-2xl p-6 text-white transition shadow-lg hover:-translate-y-1 transform flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              ❓
            </div>
            <div>
              <p className="font-black text-lg">Report Lost Items</p>
              <p className="text-red-100 text-xs">Submit a lost item report</p>
            </div>
          </a>

          <a
            href="/report-found"
            className="bg-green-500 hover:bg-green-600 rounded-2xl p-6 text-white transition shadow-lg hover:-translate-y-1 transform flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <p className="font-black text-lg">Report Found Item</p>
              <p className="text-green-100 text-xs">Turn in an item you found</p>
            </div>
          </a>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="font-black text-gray-700 text-sm mb-3">Active Lost Item Reports</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                ☂️
              </div>
              <div>
                <p className="font-bold text-gray-700 text-sm">Blue Umbrella</p>
                <p className="text-green-600 text-xs font-semibold">AI Match Identified</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-700 text-lg">Recently Found Items Currently</h2>
              <p className="text-gray-400 text-sm mt-0.5">Items currently held by the school office</p>
            </div>
            <a href="/view-found-items" className="text-sm font-bold text-[#1a237e] hover:underline">
              View All
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentFoundItems.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 text-center transition cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
                  {item.icon}
                </div>
                <p className="font-bold text-gray-700 text-sm">{item.name}</p>
                <p className="text-gray-400 text-xs mt-1">Found near {item.location}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}