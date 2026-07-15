"use client";
import { useState } from "react";

const topLocations = [
  {
    rank: 1,
    name: "University Library",
    lost: 45,
    found: 32,
    mapImage: "/images/maps/library-map.png",
    description: "2nd Floor, Main Building — High foot traffic area near reading tables and bookshelves",
  },
  {
    rank: 2,
    name: "Student Room",
    lost: 32,
    found: 28,
    mapImage: "/images/maps/student-room-map.png",
    description: "Ground Floor, Building B — Common area near lockers and study corners",
  },
  {
    rank: 3,
    name: "Canteen",
    lost: 28,
    found: 21,
    mapImage: "/images/maps/canteen-map.png",
    description: "Ground Floor, Main Building — High activity during lunch and break times",
  },
  {
    rank: 4,
    name: "Parking Lot",
    lost: 21,
    found: 15,
    mapImage: "/images/maps/parking-map.png",
    description: "East Wing — Near entrance gate and motorcycle parking area",
  },
  {
    rank: 5,
    name: "Gymnasium",
    lost: 18,
    found: 12,
    mapImage: "/images/maps/gym-map.png",
    description: "Building C — Near bleachers, locker rooms, and court entrance",
  },
];

const heatmapPoints = [
  { name: "Library", x: 18, y: 22, type: "lost", count: 45 },
  { name: "Library", x: 20, y: 25, type: "found", count: 32 },
  { name: "Canteen", x: 58, y: 32, type: "lost", count: 28 },
  { name: "Canteen", x: 61, y: 30, type: "found", count: 21 },
  { name: "Parking", x: 78, y: 62, type: "lost", count: 21 },
  { name: "Parking", x: 80, y: 65, type: "found", count: 15 },
  { name: "Gym", x: 32, y: 68, type: "lost", count: 18 },
  { name: "Gym", x: 35, y: 70, type: "found", count: 12 },
  { name: "Classroom", x: 50, y: 48, type: "lost", count: 38 },
  { name: "Classroom", x: 53, y: 50, type: "found", count: 25 },
  { name: "Hallway", x: 40, y: 35, type: "lost", count: 12 },
  { name: "Hallway", x: 42, y: 38, type: "found", count: 8 },
];

export default function LocationAnalytics() {
  const [filter, setFilter] = useState<"both" | "lost" | "found">("both");
  const [selectedLocation, setSelectedLocation] = useState(topLocations[0]);

  const visiblePoints = heatmapPoints.filter((p) => {
    if (filter === "both") return true;
    return p.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/dashboard" className="text-white font-black text-lg block hover:opacity-80 transition">
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
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Audit Trail</span>
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

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Location Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">
              Visual heatmap showing where items are most frequently reported
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <button
              onClick={() => setFilter("lost")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                filter === "lost" ? "bg-red-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setFilter("both")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                filter === "both" ? "bg-[#1a237e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setFilter("found")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
                filter === "found" ? "bg-green-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
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
                <p className="text-gray-400 text-sm font-medium">Lost Reports</p>
                <p className="text-4xl font-black text-red-500 mt-1">89</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Found Reports</p>
                <p className="text-4xl font-black text-green-600 mt-1">55</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Left - Campus Overview Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-black text-gray-700">Campus Overview Map</h2>
                  <p className="text-gray-400 text-xs">SJDM Cornerstone College Inc. Grounds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-500">Lost</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500">Found</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200" style={{ aspectRatio: "4/3" }}>
                <img
                  src="/images/campus-map.png"
                  alt="SJDM CCI Campus Map"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-gray-500 text-sm">Campus Overview Map</p>
                    <p className="text-gray-400 text-xs mt-1">Place campus-map.png</p>
                    <p className="text-gray-400 text-xs">in /public/images/</p>
                  </div>
                </div>

                {visiblePoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${
                      point.type === "lost" ? "bg-red-500" : "bg-green-500"
                    }`} style={{ width: "40px", height: "40px", margin: "-8px" }} />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg ${
                      point.type === "lost" ? "bg-red-500" : "bg-green-500"
                    }`}>
                      {point.count}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
                      {point.name} — {point.type === "lost" ? "🔴 Lost" : "🟢 Found"}: {point.count}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-xs text-center mt-3">
                Click a location from the list to see its detailed map →
              </p>
            </div>
          </div>

          {/* Right - Selected Location Detail Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-black text-gray-700">{selectedLocation.name}</h2>
                  <p className="text-gray-400 text-xs">{selectedLocation.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50" style={{ aspectRatio: "4/3" }}>
                <img
                  src={selectedLocation.mapImage}
                  alt={`${selectedLocation.name} Map`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-gray-500 text-sm">{selectedLocation.name} Map</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Place {selectedLocation.mapImage.split("/").pop()}
                    </p>
                    <p className="text-gray-400 text-xs">in /public/images/maps/</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-3 text-center ${filter === "found" ? "opacity-30" : ""} bg-red-50`}>
                  <p className="text-2xl font-black text-red-500">{selectedLocation.lost}</p>
                  <p className="text-red-400 text-xs font-bold mt-1">🔴 Lost Reports</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${filter === "lost" ? "opacity-30" : ""} bg-green-50`}>
                  <p className="text-2xl font-black text-green-600">{selectedLocation.found}</p>
                  <p className="text-green-500 text-xs font-bold mt-1">🟢 Found Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Locations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700">Top Locations</h2>
            <p className="text-gray-400 text-xs mt-1">Click a location to view its detailed map</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topLocations.map((location) => (
              <button
                key={location.rank}
                onClick={() => setSelectedLocation(location)}
                className={`w-full text-left px-6 py-4 transition flex items-center gap-4 ${
                  selectedLocation.name === location.name ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black ${
                  location.rank === 1 ? "bg-red-500" :
                  location.rank === 2 ? "bg-orange-500" :
                  location.rank === 3 ? "bg-yellow-500" :
                  "bg-gray-400"
                }`}>
                  {location.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-700 text-sm">{location.name}</p>
                    {selectedLocation.name === location.name && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Viewing</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {(filter === "lost" || filter === "both") && (
                      <span className="text-red-500 text-xs font-bold">🔴 Lost: {location.lost}</span>
                    )}
                    {(filter === "found" || filter === "both") && (
                      <span className="text-green-600 text-xs font-bold">🟢 Found: {location.found}</span>
                    )}
                  </div>
                </div>
                <div className="w-32">
                  {(filter === "lost" || filter === "both") && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                      <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${(location.lost / 45) * 100}%` }} />
                    </div>
                  )}
                  {(filter === "found" || filter === "both") && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${(location.found / 45) * 100}%` }} />
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}