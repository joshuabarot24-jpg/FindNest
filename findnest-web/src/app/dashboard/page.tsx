"use client";
import { useState, useRef, ChangeEvent } from "react";

interface ActivityItem {
  item: string;
  status: string;
  time: string;
  type: "found" | "lost";
}

const recentActivity: ActivityItem[] = [
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

function placeholderUrlFor(itemName: string, size: number) {
  return `https  ://picsum.photos/seed/${itemName.replace(/\s/g, "")}/${size}/${size}`;
}

export default function Dashboard() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<Record<number, string>>({});

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function getPhotoFor(index: number, item: string, size: number) {
    return uploadedPhotos[index] ?? placeholderUrlFor(item, size);
  }

  function triggerUpload(index: number) {
    fileInputRefs.current[index]?.click();
  }

  function handleFileSelected(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPhotos((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return { ...prev, [index]: URL.createObjectURL(file) };
    });

    e.target.value = "";
  }

  const previewItem = previewIndex !== null ? recentActivity[previewIndex] : null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">

      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-black text-gray-700">Recent Activity</h2>
                <p className="text-gray-400 text-xs">Latest lost and found reports</p>
              </div>
            </div>
            <button className="text-sm font-bold text-[#1a237e] hover:underline">
              View All
            </button>
          </div>

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
                      <input
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelected(index, e)}
                      />

                      <div className="relative group/thumb flex-shrink-0">
                        <button
                          onClick={() => setPreviewIndex(index)}
                          className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 block hover:ring-2 hover:ring-[#1a237e] transition cursor-zoom-in"
                          title="Click to enlarge"
                        >
                          <img
                            src={getPhotoFor(index, activity.item, 36)}
                            alt={activity.item}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          onClick={() => triggerUpload(index)}
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1a237e] rounded-full flex items-center justify-center text-white text-[9px] opacity-0 group-hover/thumb:opacity-100 transition shadow"
                          title="Attach photo"
                        >
                          📷
                        </button>
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

      {/* IMAGE PREVIEW LIGHTBOX */}
      {previewItem && previewIndex !== null && (
        <div
          onClick={() => setPreviewIndex(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/80 backdrop-blur-sm cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 cursor-default"
          >
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={getPhotoFor(previewIndex, previewItem.item, 480)}
                alt={previewItem.item}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-black text-[#1a237e] text-lg">{previewItem.item}</h3>
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${
              previewItem.type === "found"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}>
              {previewItem.status}
            </span>
            <p className="text-gray-400 text-sm mt-2">{previewItem.time}</p>

            <button
              onClick={() => triggerUpload(previewIndex)}
              className="mt-4 w-full bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition"
            >
              {uploadedPhotos[previewIndex] ? "Replace Photo" : "Attach Photo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}