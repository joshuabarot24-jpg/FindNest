"use client";
import { useState } from "react";

const steps = [
  { key: "submitted", label: "Submitted", icon: "📝", desc: "Report received by the system" },
  { key: "review", label: "Under AI Review", icon: "🤖", desc: "AI is analyzing your report" },
  { key: "matched", label: "Matched", icon: "🔍", desc: "Potential match identified" },
  { key: "claim", label: "Claim Submitted", icon: "📨", desc: "Ownership claim filed" },
  { key: "pending", label: "Pending Verification", icon: "🔐", desc: "Admin is verifying evidence" },
  { key: "approved", label: "Approved", icon: "✅", desc: "Ready for pickup at office" },
  { key: "returned", label: "Returned", icon: "🎉", desc: "Item successfully recovered" },
];

const statusLabel = (step: number) => {
  if (step >= 7) return { text: "Returned", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" };
  if (step >= 6) return { text: "Approved", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" };
  if (step >= 4) return { text: "In Verification", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50" };
  if (step >= 3) return { text: "Match Found", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" };
  return { text: "Searching", color: "bg-gray-400", textColor: "text-gray-600", bgLight: "bg-gray-50" };
};

const claims = [
  { id: 1, item: "Blue Umbrella", icon: "☂️", category: "Personal Belongings", location: "Library", date: "2026-06-12", currentStep: 1 },
  { id: 2, item: "Black Wallet", icon: "👛", category: "Personal Belongings", location: "Canteen", date: "2026-05-20", currentStep: 3 },
  { id: 3, item: "Calculator", icon: "🧮", category: "Electronics", location: "Room 402", date: "2026-04-15", currentStep: 7 },
];

export default function ClaimStatusPage() {
  const [selected, setSelected] = useState(claims[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const progressPercent = (selected.currentStep / steps.length) * 100;

  const filtered = claims.filter((c) => {
    const matchesSearch = c.item.toLowerCase().includes(search.toLowerCase());
    const status = statusLabel(c.currentStep).text;
    const matchesFilter = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    returned: claims.filter((c) => c.currentStep >= 7).length,
    approved: claims.filter((c) => c.currentStep === 6).length,
    verification: claims.filter((c) => c.currentStep >= 4 && c.currentStep <= 5).length,
    searching: claims.filter((c) => c.currentStep <= 2).length,
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/student-home" className="text-lg font-black text-[#1a237e] hover:opacity-80 transition">
            FIND<span className="text-[#ffd700]">NEST</span>
          </a>
        </div>
        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">R</a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#1a237e]">Claim Status</h1>
          <p className="text-gray-400 text-sm mt-1">Track the live progress of your submitted reports</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter(statusFilter === "Searching" ? "all" : "Searching")}
            className={`text-left bg-white rounded-2xl p-4 shadow-sm border transition ${statusFilter === "Searching" ? "border-gray-400 ring-2 ring-gray-100" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-gray-600">{counts.searching}</p>
            <p className="text-gray-400 text-xs font-bold mt-1">Searching</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "In Verification" ? "all" : "In Verification")}
            className={`text-left bg-white rounded-2xl p-4 shadow-sm border transition ${statusFilter === "In Verification" ? "border-yellow-400 ring-2 ring-yellow-100" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-yellow-600">{counts.verification}</p>
            <p className="text-gray-400 text-xs font-bold mt-1">In Verification</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "Approved" ? "all" : "Approved")}
            className={`text-left bg-white rounded-2xl p-4 shadow-sm border transition ${statusFilter === "Approved" ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-blue-600">{counts.approved}</p>
            <p className="text-gray-400 text-xs font-bold mt-1">Approved</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "Returned" ? "all" : "Returned")}
            className={`text-left bg-white rounded-2xl p-4 shadow-sm border transition ${statusFilter === "Returned" ? "border-green-400 ring-2 ring-green-100" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-green-600">{counts.returned}</p>
            <p className="text-gray-400 text-xs font-bold mt-1">Returned</p>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-6">

          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search your reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
              />
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")} className="text-xs font-bold text-[#1a237e] mt-2 hover:underline">
                  ✕ Clear filter: {statusFilter}
                </button>
              )}
            </div>

            <div className="flex-1 divide-y divide-gray-50">
              {filtered.map((claim) => {
                const status = statusLabel(claim.currentStep);
                const pct = (claim.currentStep / steps.length) * 100;
                return (
                  <button
                    key={claim.id}
                    onClick={() => setSelected(claim)}
                    className={`w-full text-left px-5 py-4 transition flex items-center gap-3 ${selected.id === claim.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {claim.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-700 text-sm truncate">{claim.item}</p>
                        <span className={`${status.bgLight} ${status.textColor} text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0`}>
                          {status.text}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{claim.location} · {claim.date}</p>
                      <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${status.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-bold text-sm">No reports match your search</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-xs">Showing {filtered.length} of {claims.length} reports</p>
            </div>
          </div>

          <div className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-[#1a237e] to-[#1565c0] px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center text-3xl">
                  {selected.icon}
                </div>
                <div>
                  <p className="text-white font-black text-xl">{selected.item}</p>
                  <p className="text-blue-200 text-sm">{selected.category} · Lost at {selected.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#ffd700] font-black text-2xl">{Math.round(progressPercent)}%</p>
                <p className="text-blue-200 text-xs font-bold">Process Complete</p>
              </div>
            </div>

            <div className="px-8 py-10">
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 rounded-full" style={{ marginLeft: "20px", marginRight: "20px" }} />
                <div
                  className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ marginLeft: "20px", width: `calc(${((selected.currentStep - 1) / (steps.length - 1)) * 100}% - 20px)` }}
                />
                {steps.map((step, index) => {
                  const stepNumber = index + 1;
                  const isComplete = stepNumber < selected.currentStep;
                  const isCurrent = stepNumber === selected.currentStep;
                  const isDone = stepNumber <= selected.currentStep;
                  return (
                    <div key={step.key} className="relative flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black z-10 transition ${
                        isComplete ? "bg-green-500 text-white" : isCurrent ? "bg-[#1a237e] text-white ring-4 ring-blue-100 scale-110" : "bg-gray-100 text-gray-400"
                      }`}>
                        {isComplete ? "✓" : step.icon}
                      </div>
                      <p className={`text-[11px] font-bold mt-3 text-center leading-tight max-w-[80px] ${isDone ? "text-gray-700" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                  {steps[selected.currentStep - 1]?.icon}
                </div>
                <div>
                  <p className="text-[#1a237e] font-black text-sm">Current Step: {steps[selected.currentStep - 1]?.label}</p>
                  <p className="text-gray-500 text-sm mt-1">{steps[selected.currentStep - 1]?.desc}</p>
                </div>
              </div>

              {selected.currentStep === 6 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-yellow-700 text-sm">⚠️ Action Required</p>
                    <p className="text-yellow-600 text-xs mt-0.5">Collect your item within 5 school days or it returns to unclaimed status.</p>
                  </div>
                  <button className="bg-[#1a237e] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#283593] transition flex-shrink-0 ml-4">
                    View Pickup Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}