"use client";
import { useState } from "react";

const foundItems = [
  { id: 1, name: "Reading Glasses", category: "Accessories", location: "Library", date: "Jun 15, 2026", icon: "👓", color: "blue" },
  { id: 2, name: "Black Wallet", category: "Personal Belongings", location: "Canteen", date: "Jun 14, 2026", icon: "👛", color: "amber" },
  { id: 3, name: "Car Keys", category: "Keys", location: "Gymnasium", date: "Jun 14, 2026", icon: "🔑", color: "gray" },
  { id: 4, name: "Aqua Flask Bottle", category: "Personal Belongings", location: "Canteen", date: "Jun 13, 2026", icon: "🍶", color: "teal" },
  { id: 5, name: "Student ID Card", category: "ID/Cards", location: "Library", date: "Jun 12, 2026", icon: "🪪", color: "indigo" },
  { id: 6, name: "Scientific Calculator", category: "Electronics", location: "Room 402", date: "Jun 11, 2026", icon: "🧮", color: "purple" },
  { id: 7, name: "Blue Umbrella", category: "Personal Belongings", location: "Main Entrance", date: "Jun 10, 2026", icon: "☂️", color: "blue" },
  { id: 8, name: "Wireless Earbuds", category: "Electronics", location: "Gymnasium", date: "Jun 9, 2026", icon: "🎧", color: "purple" },
  { id: 9, name: "Notebook", category: "School Supplies", location: "Room 305", date: "Jun 8, 2026", icon: "📓", color: "green" },
  { id: 10, name: "Wristwatch", category: "Accessories", location: "Parking Lot", date: "Jun 7, 2026", icon: "⌚", color: "amber" },
  { id: 11, name: "iPhone 15 Pro Max", category: "Electronics", location: "Classroom 201", date: "Jun 16, 2026", icon: "📱", color: "purple" },
  { id: 12, name: "MacBook Air", category: "Electronics", location: "Computer Lab", date: "Jun 16, 2026", icon: "💻", color: "indigo" },
  { id: 13, name: "Samsung Galaxy Phone", category: "Electronics", location: "Canteen", date: "Jun 15, 2026", icon: "📱", color: "purple" },
  { id: 14, name: "Dell Laptop", category: "Electronics", location: "Library", date: "Jun 14, 2026", icon: "💻", color: "indigo" },
  { id: 15, name: "iPad Tablet", category: "Electronics", location: "Room 402", date: "Jun 13, 2026", icon: "📱", color: "purple" },
  { id: 16, name: "Power Bank", category: "Electronics", location: "Gymnasium", date: "Jun 12, 2026", icon: "🔋", color: "teal" },
  { id: 17, name: "USB Flash Drive", category: "Electronics", location: "Computer Lab", date: "Jun 11, 2026", icon: "💾", color: "gray" },
  { id: 18, name: "Backpack (Black)", category: "Personal Belongings", location: "Main Entrance", date: "Jun 10, 2026", icon: "🎒", color: "amber" },
  { id: 19, name: "Wired Headphones", category: "Electronics", location: "Room 305", date: "Jun 9, 2026", icon: "🎧", color: "purple" },
  { id: 20, name: "Smart Watch", category: "Electronics", location: "Parking Lot", date: "Jun 8, 2026", icon: "⌚", color: "indigo" },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  gray: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
};

const categories = ["All", "Electronics", "Personal Belongings", "Accessories", "ID/Cards", "Keys", "School Supplies"];

export default function ViewFoundItems() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = foundItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          <a href="/view-found-items" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">View Found Items</a>
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

        <div className="grid grid-cols-5 gap-5">
          {filtered.map((item) => {
            const colors = colorMap[item.color];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1"
                >
                <div className={`${colors.bg} h-28 flex items-center justify-center relative`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  <span className={`absolute top-3 right-3 ${colors.bg} ${colors.text} text-[10px] font-bold px-2 py-1 rounded-full border ${colors.border}`}>
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <p className="font-bold text-gray-700 text-sm leading-tight mb-2">{item.name}</p>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                    <span>📍</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <span>📅</span>
                    <span>{item.date}</span>
                  </div>

                  <a href="/report-lost" className="block w-full mt-3 bg-gray-50 group-hover:bg-[#1a237e] text-gray-500 group-hover:text-white text-xs font-bold py-2.5 rounded-xl transition text-center">
                    Is this yours?
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-lg">No items found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </main>
    </div>
  );
}