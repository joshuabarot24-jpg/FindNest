"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface LostReport {
  id: number;
  item_name: string;
  category: string;
  location_lost: string;
  date_lost: string;
  photo_url: string | null;
  status: string;
  user?: { name: string };
}

const categories = ["All", "Electronics", "Personal Belongings", "Accessories", "ID/Cards", "Keys", "School Supplies"];

export default function ReportItemsPage() {
  const [userInitial, setUserInitial] = useState("");
  const [reports, setReports] = useState<LostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewingReport, setViewingReport] = useState<LostReport | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("findnest_user");
    if (stored) {
      const currentUser = JSON.parse(stored);
      setUserInitial(currentUser?.name?.charAt(0).toUpperCase() || "");
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/lost-items", { params: { status: "searching" } });
        setReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching lost item reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/student-home" className="flex items-center gap-3">
          <span className="text-lg font-black text-[#1a237e]">FIND<span className="text-[#ffd700]">NEST</span></span>
        </a>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
          <a href="/report-items" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Report Items</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userInitial}
          </a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1a237e]">Report Items</h1>
            <p className="text-gray-400 text-sm mt-1">Lost item reports from all students — see something you recognize?</p>
          </div>
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
            <span className="text-2xl font-black text-[#1a237e]">{reports.length}</span>
            <span className="text-gray-400 text-sm ml-2">active reports</span>
          </div>
        </div>

        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search lost item reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#1a237e] text-gray-700 bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeCategory === cat
                  ? "bg-[#1a237e] text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading reports...</div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewingReport(item)}
                  className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1"
                >
                  <div className="bg-gray-50 h-28 flex items-center justify-center relative overflow-hidden">
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">
                        No Photo
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-white text-[#1a237e] text-[10px] font-bold px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-gray-700 text-sm leading-tight mb-2">{item.item_name}</p>
                    <p className="text-gray-400 text-xs mb-1">Last seen: {item.location_lost}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(item.date_lost).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="font-bold text-lg">No active lost reports</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            )}
          </>
        )}
      </main>

      {viewingReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <button
              onClick={() => setViewingReport(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-5 flex items-center justify-center">
              {viewingReport.photo_url ? (
                <img src={viewingReport.photo_url} alt={viewingReport.item_name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-sm">No Photo Available</div>
              )}
            </div>

            <h2 className="text-xl font-black text-[#1a237e]">{viewingReport.item_name}</h2>
            <p className="text-gray-400 text-xs mb-4">Reported by {viewingReport.user?.name || "a student"}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Category</span>
                <span className="font-bold text-gray-700">{viewingReport.category}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Last Seen</span>
                <span className="font-bold text-gray-700">{viewingReport.location_lost}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Date Lost</span>
                <span className="font-bold text-gray-700">{new Date(viewingReport.date_lost).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingReport(null)}
              className="w-full mt-6 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}