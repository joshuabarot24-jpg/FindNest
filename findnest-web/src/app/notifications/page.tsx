"use client";
import Image from "next/image";
import { useState } from "react";

const notifications = [
  {
    id: 1,
    type: "match",
    title: "AI Match Found!",
    message: "A found item matches your \"Blue Umbrella\" report.",
    time: "10 minutes ago",
    read: false,
    icon: "🤖",
  },
  {
    id: 2,
    type: "status",
    title: "Claim Status Updated",
    message: "Your claim for \"Black Wallet\" is now under review.",
    time: "2 hours ago",
    read: false,
    icon: "📋",
  },
  {
    id: 3,
    type: "reminder",
    title: "Pickup Reminder",
    message: "Your approved item \"Student ID\" must be collected within 3 school days.",
    time: "5 hours ago",
    read: true,
    icon: "⏰",
  },
  {
    id: 4,
    type: "match",
    title: "AI Match Notification",
    message: "A matching item was found in the Canteen.",
    time: "Yesterday, 4:20 PM",
    read: true,
    icon: "🤖",
  },
  {
    id: 5,
    type: "status",
    title: "Report Approved",
    message: "Your found item report \"Calculator\" has been approved by the admin.",
    time: "2 days ago",
    read: true,
    icon: "✅",
  },
  {
    id: 6,
    type: "system",
    title: "Welcome to FindNest",
    message: "Your student account has been successfully activated.",
    time: "1 week ago",
    read: true,
    icon: "🎉",
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(notifications);

  const filtered = items.filter((n) => filter === "all" || n.type === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setItems(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
  };

  const typeColor: Record<string, { bg: string; text: string }> = {
    match: { bg: "bg-green-50", text: "text-green-600" },
    status: { bg: "bg-blue-50", text: "text-blue-600" },
    reminder: { bg: "bg-yellow-50", text: "text-yellow-600" },
    system: { bg: "bg-purple-50", text: "text-purple-600" },
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/student-home" className="text-lg font-black text-[#1a237e] hover:opacity-80 transition">
            FIND<span className="text-[#ffd700]">NEST</span>
          </a>
        </div>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">
            R
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-8 py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1a237e]">Notifications</h1>
            <p className="text-gray-400 text-sm mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-bold text-[#1a237e] hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 w-fit">
          {[
            { key: "all", label: "All" },
            { key: "match", label: "Matches" },
            { key: "status", label: "Status" },
            { key: "reminder", label: "Reminders" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === tab.key
                  ? "bg-[#1a237e] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.map((notif) => {
            const colors = typeColor[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition ${
                  notif.read
                    ? "bg-white border-gray-100"
                    : "bg-blue-50/40 border-blue-100 shadow-sm"
                }`}
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-700 text-sm">{notif.title}</p>
                    {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{notif.message}</p>
                  <p className="text-gray-400 text-xs mt-2">{notif.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔔</p>
            <p className="font-bold text-lg">No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </main>
    </div>
  );
}