"use client";
import Image from "next/image";
import { useState } from "react";

const topLocations = [
  { rank: 1, name: "University Library 📍", lost: 45, found: 32, icon: "📚" },
  { rank: 2, name: "Student Room 📍", lost: 32, found: 28, icon: "🏫" },
  { rank: 3, name: "Canteen 📍", lost: 28, found: 21, icon: "🍽️" },
  { rank: 4, name: "Parking Lot 📍", lost: 21, found: 15, icon: "🅿️" },
  { rank: 5, name: "Gymnasium 📍", lost: 18, found: 12, icon: "🏋️" },
];

const heatmapAreas = [
  { name: "Library 📍", x: 20, y: 20, intensity: "high", count: 45 },
  { name: "Canteen 📍", x: 60, y: 30, intensity: "medium", count: 28 },
  { name: "Parking 📍", x: 80, y: 60, intensity: "medium", count: 21 },
  { name: "Gym 📍", x: 30, y: 65, intensity: "low", count: 18 },
  { name: "Classroom 📍", x: 50, y: 50, intensity: "high", count: 38 },
  { name: "Hallway 📍", x: 40, y: 35, intensity: "low", count: 12 },
];

export default function LocationAnalytics() {
  const [filter, setFilter] = useState("both");

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
          <a href="/location-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Location Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">
              Visual heatmap showing where items are most frequently reported
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <button
              onClick={() => setFilter("lost")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === "lost"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setFilter("both")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === "both"
                  ? "bg-[#1a237e] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setFilter("found")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === "found"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Reports</p>
                <p className="text-4xl font-black text-[#1a237e] mt-1">144</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">High Risk Areas</p>
                <p className="text-4xl font-black text-red-500 mt-1">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Most Active Area</p>
                <p className="text-2xl font-black text-[#ffd700] mt-1">Library</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">

          {/* Heatmap */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                  🗺️
                </div>
                <div>
                  <h2 className="font-black text-gray-700">Campus Hotspot Map 📍</h2>
                  <p className="text-gray-400 text-xs">SJDM Cornerstone College Inc. Grounds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-500">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-gray-500">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500">Low</span>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="relative h-80 bg-gradient-to-br from-blue-50 to-indigo-50 m-6 rounded-2xl overflow-hidden border-2 border-dashed border-blue-200">

              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                {[25, 50, 75].map((pos) => (
                  <div key={pos}>
                    <div className="absolute border-t border-blue-300 w-full" style={{ top: `${pos}%` }} />
                    <div className="absolute border-l border-blue-300 h-full" style={{ left: `${pos}%` }} />
                  </div>
                ))}
              </div>

              {/* Heatmap Points */}
              {heatmapAreas.map((area, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                >
                  {/* Pulse ring */}
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                    area.intensity === "high" ? "bg-red-500" :
                    area.intensity === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`} style={{ width: "48px", height: "48px", margin: "-8px" }} />

                  {/* Main dot */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg ${
                    area.intensity === "high" ? "bg-red-500" :
                    area.intensity === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}>
                    {area.count}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {area.name}: {area.count} reports
                  </div>
                </div>
              ))}

              {/* Campus label */}
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-gray-500">SJDM Cornerstone College</p>
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-black text-gray-700">Top Locations</h2>
              <p className="text-gray-400 text-xs mt-1">Most reported areas on campus</p>
            </div>

            <div className="p-4 space-y-3">
              {topLocations.map((location) => (
                <div key={location.rank} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black ${
                    location.rank === 1 ? "bg-red-500" :
                    location.rank === 2 ? "bg-orange-500" :
                    location.rank === 3 ? "bg-yellow-500" :
                    "bg-gray-400"
                  }`}>
                    {location.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-700 text-sm">{location.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-red-500 text-xs font-bold">Lost: {location.lost}</span>
                      <span className="text-green-500 text-xs font-bold">Found: {location.found}</span>
                    </div>
                  </div>
                  <span className="text-xl">{location.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}