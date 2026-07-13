"use client";
import { useState } from "react";

const cases = [
  {
    caseId: "#CASE-001",
    itemName: "Blue Umbrella",
    category: "Personal Belongings",
    icon: "☂️",
    status: "Returned",
    statusColor: "bg-green-50 text-green-700",
    trail: [
      {
        step: 1,
        action: "Lost Item Reported",
        who: "Student — Raymart D. Chabas (2022-10043)",
        what: "Student submitted a lost item report for a Blue Umbrella with photo uploaded",
        when: "2026-07-01 08:12:34",
        where: "Main Entrance",
        why: "Student lost the item and used FindNest to report it",
        outcome: "Report saved — Status set to Searching",
        type: "lost",
      },
      {
        step: 2,
        action: "AI Matching Triggered",
        who: "System — AI Engine (MobileNetV2)",
        what: "AI automatically compared lost report photo against all recorded found items",
        when: "2026-07-01 08:12:40",
        where: "FindNest AI Server",
        why: "New lost report triggers automatic AI scan",
        outcome: "89% match found with Found Item #F-042",
        type: "ai",
      },
      {
        step: 3,
        action: "Match Notification Sent",
        who: "System — Firebase Cloud Messaging",
        what: "Push notification sent to student's registered device informing of potential match",
        when: "2026-07-01 08:12:45",
        where: "Student Mobile App",
        why: "AI confidence score exceeded threshold (85%)",
        outcome: "Notification delivered — Student acknowledged match",
        type: "notification",
      },
      {
        step: 4,
        action: "Claim Submitted by Student",
        who: "Student — Raymart D. Chabas (2022-10043)",
        what: "Student submitted ownership claim with detailed description and secondary photo as proof",
        when: "2026-07-01 09:10:15",
        where: "FindNest Web Portal",
        why: "Student confirmed the found item matches their lost item",
        outcome: "Claim logged — Status set to Pending Verification",
        type: "claim",
      },
      {
        step: 5,
        action: "Claim Verified by Admin",
        who: "Admin — Admin_01 (Guidance Counselor)",
        what: "Admin reviewed student ownership proof and AI similarity score",
        when: "2026-07-01 10:00:00",
        where: "FindNest Admin Panel — Claim Verification",
        why: "All claims require manual admin verification before release",
        outcome: "Ownership verified — Claim approved",
        type: "approved",
      },
      {
        step: 6,
        action: "Item Physically Released",
        who: "Admin — Admin_01 (Guidance Counselor)",
        what: "Student visited Guidance Office and physically collected the Blue Umbrella",
        when: "2026-07-01 10:30:00",
        where: "Guidance Office — SJDM CCI",
        why: "Claim approved — Student entitled to collect item",
        outcome: "Item returned — Status set to Returned",
        type: "returned",
      },
      {
        step: 7,
        action: "Case Archived",
        who: "System — Auto-Archive",
        what: "Complete case record saved permanently to digital records",
        when: "2026-07-01 10:30:05",
        where: "FindNest Digital Records",
        why: "All completed cases are automatically archived",
        outcome: "Case closed — Archived successfully",
        type: "system",
      },
    ],
  },
  {
    caseId: "#CASE-002",
    itemName: "Black Wallet",
    category: "Personal Belongings",
    icon: "👛",
    status: "Claim Rejected",
    statusColor: "bg-red-50 text-red-700",
    trail: [
      {
        step: 1,
        action: "Found Item Recorded",
        who: "Admin — Admin_01 (Guidance Counselor)",
        what: "Admin recorded a found Black Wallet turned in by a student at the Canteen",
        when: "2026-07-02 14:00:00",
        where: "Canteen — SJDM CCI",
        why: "Student turned in item to admin as per FindNest protocol",
        outcome: "Found item logged — Available for claiming",
        type: "found",
      },
      {
        step: 2,
        action: "AI Matching Triggered",
        who: "System — AI Engine (MobileNetV2)",
        what: "AI scanned existing lost reports to find potential owner of the Black Wallet",
        when: "2026-07-02 14:00:10",
        where: "FindNest AI Server",
        why: "New found item triggers automatic AI scan",
        outcome: "76% match found with Lost Report #L-033",
        type: "ai",
      },
      {
        step: 3,
        action: "Match Notification Sent",
        who: "System — Firebase Cloud Messaging",
        what: "Push notification sent to Maria Santos informing of potential match",
        when: "2026-07-02 14:00:15",
        where: "Student Mobile App",
        why: "AI match score reached notification threshold",
        outcome: "Notification delivered",
        type: "notification",
      },
      {
        step: 4,
        action: "Claim Submitted by Student",
        who: "Student — Maria Santos (2023-20021)",
        what: "Student submitted ownership claim with only a verbal description and no supporting photo",
        when: "2026-07-02 15:05:00",
        where: "FindNest Web Portal",
        why: "Student believed the found wallet is hers based on AI match notification",
        outcome: "Claim logged — Status set to Pending Verification",
        type: "claim",
      },
      {
        step: 5,
        action: "Claim Rejected by Admin",
        who: "Admin — Admin_01 (Guidance Counselor)",
        what: "Admin reviewed claim and determined insufficient proof — no photo, description too vague",
        when: "2026-07-02 15:45:00",
        where: "FindNest Admin Panel — Claim Verification",
        why: "Ownership could not be verified with provided evidence",
        outcome: "Claim rejected — Student notified to provide stronger proof",
        type: "rejected",
      },
    ],
  },
  {
    caseId: "#CASE-003",
    itemName: "iPhone 15 Pro Max",
    category: "Electronics",
    icon: "📱",
    status: "Searching",
    statusColor: "bg-yellow-50 text-yellow-700",
    trail: [
      {
        step: 1,
        action: "Lost Item Reported",
        who: "Student — Juan Dela Cruz (2024-30015)",
        what: "Student submitted lost item report for iPhone 15 Pro Max White with cracked screen top-left",
        when: "2026-07-09 13:22:10",
        where: "Classroom 201 — SJDM CCI",
        why: "Student lost phone during class and reported immediately",
        outcome: "Report saved — Status set to Searching",
        type: "lost",
      },
      {
        step: 2,
        action: "AI Matching Triggered",
        who: "System — AI Engine (MobileNetV2)",
        what: "AI scanned all recorded found items — no match found above threshold",
        when: "2026-07-09 13:22:20",
        where: "FindNest AI Server",
        why: "New lost report triggers automatic AI scan",
        outcome: "No match found — System continues monitoring",
        type: "ai",
      },
    ],
  },
  {
    caseId: "#CASE-004",
    itemName: "Scientific Calculator",
    category: "Electronics",
    icon: "🧮",
    status: "For Pickup",
    statusColor: "bg-blue-50 text-blue-700",
    trail: [
      {
        step: 1,
        action: "Found Item Recorded",
        who: "Admin — Admin_02 (Guidance Counselor)",
        what: "Admin recorded found Scientific Calculator turned in by student from Room 402",
        when: "2026-07-08 09:00:00",
        where: "Room 402 — SJDM CCI",
        why: "Student turned in item following FindNest protocol",
        outcome: "Found item logged — Available for claiming",
        type: "found",
      },
      {
        step: 2,
        action: "AI Matching Triggered",
        who: "System — AI Engine (MobileNetV2)",
        what: "AI scanned lost reports for potential owner of Scientific Calculator",
        when: "2026-07-08 09:00:08",
        where: "FindNest AI Server",
        why: "New found item triggers automatic AI scan",
        outcome: "92% match found with Lost Report #L-088 (Carlo Reyes)",
        type: "ai",
      },
      {
        step: 3,
        action: "Match Notification Sent",
        who: "System — Firebase Cloud Messaging",
        what: "Push notification sent to Carlo Reyes informing of high-confidence match",
        when: "2026-07-08 09:00:12",
        where: "Student Mobile App",
        why: "AI confidence score 92% — above threshold",
        outcome: "Notification delivered",
        type: "notification",
      },
      {
        step: 4,
        action: "Claim Submitted by Student",
        who: "Student — Carlo Reyes (2022-10089)",
        what: "Student submitted claim with photo of receipt showing calculator purchase and serial number",
        when: "2026-07-08 10:15:00",
        where: "FindNest Web Portal",
        why: "Student confirmed match and provided strong ownership proof",
        outcome: "Claim logged — Status set to Pending Verification",
        type: "claim",
      },
      {
        step: 5,
        action: "Claim Approved by Admin",
        who: "Admin — Admin_02 (Guidance Counselor)",
        what: "Admin verified serial number on receipt matches calculator — strong proof accepted",
        when: "2026-07-08 11:00:00",
        where: "FindNest Admin Panel — Claim Verification",
        why: "Receipt with serial number provides definitive proof of ownership",
        outcome: "Claim approved — Student notified to collect item at office",
        type: "approved",
      },
    ],
  },
];

const typeConfig: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
  lost: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", icon: "📋" },
  found: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", icon: "📦" },
  ai: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", icon: "🤖" },
  notification: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", icon: "🔔" },
  claim: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", icon: "📨" },
  approved: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500", icon: "✅" },
  returned: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: "🎉" },
  rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-600", icon: "❌" },
  system: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", icon: "⚙️" },
};

export default function AdminAuditTrail() {
  const [selectedCase, setSelectedCase] = useState(cases[0]);
  const [search, setSearch] = useState("");

  const filteredCases = cases.filter((c) =>
    c.itemName.toLowerCase().includes(search.toLowerCase()) ||
    c.caseId.toLowerCase().includes(search.toLowerCase())
  );

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
          <a href="/location-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Location Analytics</span>
          </a>
          <a href="/digital-records" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Digital Records</span>
          </a>
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Assistive AI Matching</span>
          </a>
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
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
            <h1 className="text-3xl font-black text-[#1a237e]">Audit Trail</h1>
            <p className="text-gray-400 text-sm mt-1">
              Chronological record of every lost and found transaction — who, what, when, where, and why
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
            <span className="text-yellow-700 text-sm font-bold">Read-Only</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-700 text-sm mb-3">Case List</h2>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>
              <div className="divide-y divide-gray-50">
                {filteredCases.map((c) => (
                  <button
                    key={c.caseId}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left px-5 py-4 transition ${selectedCase.caseId === c.caseId ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-700 text-sm truncate">{c.itemName}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{c.caseId}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${c.statusColor}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1a237e] to-[#1565c0] px-6 py-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-3xl">
                  {selectedCase.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-xl">{selectedCase.itemName}</p>
                  <p className="text-blue-200 text-sm">{selectedCase.category} · {selectedCase.caseId}</p>
                </div>
                <span className={`text-xs font-bold px-4 py-2 rounded-full ${selectedCase.statusColor}`}>
                  {selectedCase.status}
                </span>
              </div>

              <div className="p-6">
                <p className="font-black text-gray-700 text-sm mb-6">
                  Chronological Audit Trail — {selectedCase.trail.length} recorded actions
                </p>

                <div className="relative">
                  {selectedCase.trail.map((entry, index) => {
                    const config = typeConfig[entry.type];
                    const isLast = index === selectedCase.trail.length - 1;

                    return (
                      <div key={index} className="flex gap-4 relative">
                        {!isLast && (
                          <div className="absolute left-[18px] top-10 w-0.5 h-full bg-gray-200" />
                        )}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 ${config.bg}`}>
                          <span>{config.icon}</span>
                        </div>
                        <div className={`flex-1 ${isLast ? "pb-2" : "pb-8"}`}>
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-400">STEP {entry.step}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${config.bg} ${config.text}`}>
                                  {entry.action}
                                </span>
                              </div>
                              <span className="text-xs font-mono text-gray-400">{entry.when}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">Who</p>
                                <p className="text-gray-700 font-semibold">{entry.who}</p>
                              </div>
                              <div>
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">Where</p>
                                <p className="text-gray-700 font-semibold">{entry.where}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">What</p>
                                <p className="text-gray-700">{entry.what}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">Why</p>
                                <p className="text-gray-700">{entry.why}</p>
                              </div>
                              <div className="col-span-2 bg-white rounded-xl p-3 border border-gray-200">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">Outcome</p>
                                <p className="text-gray-700 font-semibold">{entry.outcome}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}