"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface SupportMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function SupportInbox() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/support");
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Error fetching support messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleExpand = async (msg: SupportMessage) => {
    setExpandedId(expandedId === msg.id ? null : msg.id);
    if (msg.status === "new") {
      try {
        await api.post(`/support/${msg.id}/read`);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m))
        );
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  const newCount = messages.filter((m) => m.status === "new").length;

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
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Audit Trail</span>
          </a>
          <a href="/support-inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Support Inbox</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Guidance Counselor</p>
            <p className="text-blue-300 text-xs mt-1">Administrator</p>
          </div>

          <button
            onClick={() => { localStorage.removeItem("findnest_token"); localStorage.removeItem("findnest_user"); window.location.href = "/"; }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium w-full text-left"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Support Inbox</h1>
            <p className="text-gray-400 text-sm mt-1">Messages sent by students through the Support page</p>
          </div>
          {newCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <span className="text-red-600 text-sm font-bold">{newCount} new</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold text-lg">No messages yet</p>
              <p className="text-sm mt-1">Student support messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <button
                    onClick={() => handleExpand(msg)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-700 text-sm">{msg.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.status === "new" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
                          }`}>
                            {msg.status === "new" ? "NEW" : "READ"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{msg.email}</p>
                        {expandedId !== msg.id && (
                          <p className="text-gray-500 text-xs mt-1 truncate">{msg.message}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs shrink-0 ml-4">{formatTime(msg.created_at)}</span>
                  </button>

                  {expandedId === msg.id && (
                    <div className="px-6 pb-5">
                      <div className="bg-gray-50 rounded-xl p-4 ml-14">
                        <p className="text-gray-700 text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}