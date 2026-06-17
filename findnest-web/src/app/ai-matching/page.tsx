"use client";
import Image from "next/image";
import { useState } from "react";

const matches = [
  {
    id: 1,
    lostReport: "#L0882",
    foundItem: "#F1042",
    itemName: "Black Wallet",
    similarity: 89,
    lostPhoto: "👛",
    foundPhoto: "❓",
    status: "pending",
    attributes: [
      { label: "Color", lost: "Black", found: "Black", match: true },
      { label: "Material", lost: "Leather", found: "Leather", match: true },
      { label: "Brand Logo", lost: "Visible, faded", found: "Visible, faded", match: true },
      { label: "Scratches", lost: "Small scratch on corner", found: "Small scratch on corner", match: true },
      { label: "Zipper Condition", lost: "Slightly worn", found: "Good condition", match: false },
    ],
  },
  {
    id: 2,
    lostReport: "#L0891",
    foundItem: "#F1055",
    itemName: "iPhone 15 Pro Max",
    similarity: 94,
    lostPhoto: "📱",
    foundPhoto: "❓",
    status: "pending",
    attributes: [
      { label: "Color", lost: "White", found: "White", match: true },
      { label: "Case Type", lost: "Clear case", found: "Clear case", match: true },
      { label: "Screen Condition", lost: "Small crack top-left", found: "Small crack top-left", match: true },
      { label: "Stickers", lost: "None", found: "None", match: true },
      { label: "Back Camera Bump", lost: "No visible damage", found: "No visible damage", match: true },
    ],
  },
  {
    id: 3,
    lostReport: "#L0903",
    foundItem: "#F1061",
    itemName: "Calculus Textbook",
    similarity: 76,
    lostPhoto: "📚",
    foundPhoto: "❓",
    status: "pending",
    attributes: [
      { label: "Cover Color", lost: "Blue", found: "Blue", match: true },
      { label: "Edition", lost: "7th Edition", found: "7th Edition", match: true },
      { label: "Cover Condition", lost: "Slightly bent corners", found: "Torn spine", match: false },
      { label: "Markings", lost: "Name written inside", found: "Not visible", match: false },
      { label: "Stickers/Tags", lost: "Library tag visible", found: "Library tag visible", match: true },
    ],
  },
];

export default function AiMatching() {
  const [activeMatch, setActiveMatch] = useState(matches[0]);

  const matchingCount = activeMatch.attributes.filter((a) => a.match).length;

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
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Assistive AI Matching</h1>
            <p className="text-gray-400 text-sm mt-1">
              System automatically comparing lost reports with found items
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-sm font-bold">AI Engine Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Match Queue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-black text-gray-700">Pending Matches</h2>
              <p className="text-gray-400 text-xs mt-1">{matches.length} matches awaiting confirmation</p>
            </div>

            <div className="divide-y divide-gray-50">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => setActiveMatch(match)}
                  className={`w-full text-left px-6 py-4 transition ${
                    activeMatch.id === match.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                      {match.lostPhoto}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-700 text-sm">{match.itemName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{match.lostReport} ↔ {match.foundItem}</p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                      match.similarity >= 85 ? "bg-green-100 text-green-700" :
                      match.similarity >= 70 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {match.similarity}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Match Detail */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-gray-400 text-sm">
                System automatically comparing Lost Report {activeMatch.lostReport} with Found Item {activeMatch.foundItem}...
              </p>
            </div>

            <div className="p-10">

              {/* Match Percentage */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke={activeMatch.similarity >= 85 ? "#22c55e" : activeMatch.similarity >= 70 ? "#eab308" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(activeMatch.similarity / 100) * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-[#1a237e]">{activeMatch.similarity}%</span>
                </div>
                <p className="font-black text-gray-700 text-lg">Match Confidence</p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeMatch.similarity >= 85 ? "High confidence match" : activeMatch.similarity >= 70 ? "Moderate confidence match" : "Low confidence match"}
                </p>
              </div>

              {/* Photo Comparison */}
              <div className="flex items-center justify-center gap-8 mb-10">
                <div className="text-center">
                  <div className="w-32 h-32 bg-red-50 rounded-2xl flex items-center justify-center text-5xl mb-3 border-2 border-red-100">
                    {activeMatch.lostPhoto}
                  </div>
                  <p className="font-bold text-gray-700 text-sm">Lost Report Photo</p>
                  <p className="text-gray-400 text-xs mt-0.5">{activeMatch.lostReport}</p>
                </div>

                <div className="w-16 h-16 bg-[#1a237e] rounded-full flex items-center justify-center text-white text-2xl">
                  ↔
                </div>

                <div className="text-center">
                  <div className="w-32 h-32 bg-green-50 rounded-2xl flex items-center justify-center text-5xl mb-3 border-2 border-green-100">
                    {activeMatch.foundPhoto}
                  </div>
                  <p className="font-bold text-gray-700 text-sm">Found Item Photo</p>
                  <p className="text-gray-400 text-xs mt-0.5">{activeMatch.foundItem}</p>
                </div>
              </div>

              {/* Fine Detail Comparison */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-black text-gray-700 text-sm">AI Fine Detail Analysis</p>
                    <p className="text-gray-400 text-xs mt-0.5">Attribute-by-attribute comparison</p>
                  </div>
                  <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">
                    {matchingCount}/{activeMatch.attributes.length} attributes matched
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Attribute</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Lost Report</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Found Item</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeMatch.attributes.map((attr, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-700 text-sm">{attr.label}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-500 text-sm">{attr.lost}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-500 text-sm">{attr.found}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {attr.match ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-500 rounded-full text-xs font-bold">
                                ✕
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button className="bg-green-500 hover:bg-green-600 text-white font-black px-10 py-4 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform">
                  ✓ Confirm Match
                </button>
                <button className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-black px-10 py-4 rounded-2xl transition">
                  ✕ Not a Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}