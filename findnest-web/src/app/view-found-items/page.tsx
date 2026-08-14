"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface FoundItem {
  id: number;
  item_name: string;
  category: string;
  location_found: string;
  date_found: string;
  photo_url: string | null;
  status: string;
}

const categories = ["All", "Electronics", "Personal Belongings", "Accessories", "ID/Cards", "Keys", "School Supplies"];

export default function ViewFoundItems() {
  const [userInitial, setUserInitial] = useState("");
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const stored = localStorage.getItem("findnest_user");
    if (stored) {
      const currentUser = JSON.parse(stored);
      setUserInitial(currentUser?.name?.charAt(0).toUpperCase() || "");
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/found-items", { params: { status: "unclaimed" } });
        setFoundItems(response.data.records || []);
      } catch (err) {
        console.error("Error fetching found items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filtered = foundItems.filter((item) => {
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
          <a href="/view-found-items" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
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
            <h1 className="text-2xl font-black text-[#1a237e]">Browse Found Items</h1>
            <p className="text-gray-400 text-sm mt-1">Items currently held by the school office</p>
          </div>
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
            <span className="text-2xl font-black text-[#1a237e]">{foundItems.length}</span>
            <span className="text-gray-400 text-sm ml-2">items found</span>
          </div>
        </div>

        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search found items..."
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
          <div className="text-center py-20 text-gray-400 text-sm">Loading found items...</div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1"
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
                    <p className="text-gray-400 text-xs mb-1">Location: {item.location_found}</p>
                    <p className="text-gray-400 text-xs">
                      Found: {new Date(item.date_found).toLocaleDateString()}
                    </p>

                    <a
                      href="/report-lost"
                      className="block w-full mt-3 bg-gray-50 group-hover:bg-[#1a237e] text-gray-500 group-hover:text-white text-xs font-bold py-2.5 rounded-xl transition text-center"
                    >
                      Is this yours?
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="font-bold text-lg">No items found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}