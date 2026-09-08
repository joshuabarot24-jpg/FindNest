"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface LostReport {
  id: number;
  item_name: string;
  category: string;
  status: string;
  photo_url: string | null;
}

interface FoundItem {
  id: number;
  item_name: string;
  location_found: string;
  photo_url: string | null;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

export default function StudentHome() {
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("?");

  const [myReports, setMyReports] = useState<LostReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [foundLoading, setFoundLoading] = useState(true);

  const [matchNotification, setMatchNotification] = useState<NotificationItem | null>(null);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("findnest_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "");
      setUserInitial((user.name || "?").charAt(0).toUpperCase());
    }

    const fetchMyReports = async () => {
      try {
        const response = await api.get("/lost-items/my-reports");
        setMyReports(response.data.reports || []);
      } catch (err) {
        console.error("Error fetching my reports:", err);
      } finally {
        setReportsLoading(false);
      }
    };

    const fetchFoundItems = async () => {
      try {
        const response = await api.get("/found-items", { params: { status: "unclaimed" } });
        setFoundItems((response.data.records || []).slice(0, 6));
      } catch (err) {
        console.error("Error fetching found items:", err);
      } finally {
        setFoundLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications: NotificationItem[] = response.data.notifications || [];
        const unreadMatch = notifications.find(
          (n) => !n.is_read && n.type?.toLowerCase().includes("match")
        );
        setMatchNotification(unreadMatch || null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchMyReports();
    fetchFoundItems();
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/student-home" className="text-lg font-black text-[#1a237e] hover:opacity-80 transition">
            FIND<span className="text-[#ffd700]">NEST</span>
          </a>
        </div>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Home</a>
          <a href="/view-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {matchNotification && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
            )}
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">
            {userInitial}
          </a>
        </div>
      </nav>

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {matchNotification && showNotification && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
            <div>
              <p className="font-bold text-green-700 text-sm">{matchNotification.title}</p>
              <p className="text-green-600 text-sm">{matchNotification.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/view-found-items" className="text-sm font-bold text-[#1a237e] hover:underline">
                View Match
              </a>
              <button
                onClick={() => setShowNotification(false)}
                className="text-green-400 hover:text-green-600 transition font-bold text-sm px-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          
          <a
            href="/report-lost"
            className="bg-red-500 hover:bg-red-600 rounded-2xl p-6 text-white transition shadow-lg hover:-translate-y-1 transform flex items-center gap-4"
          >
            <div>
              <p className="font-black text-lg">Report Lost Items</p>
              <p className="text-red-100 text-xs">Submit a lost item report</p>
            </div>
          </a>

          <a
            href="/report-found"
            className="bg-green-500 hover:bg-green-600 rounded-2xl p-6 text-white transition shadow-lg hover:-translate-y-1 transform flex items-center gap-4"
          >
            <div>
              <p className="font-black text-lg">Report Found Item</p>
              <p className="text-green-100 text-xs">Turn in an item you found</p>
            </div>
          </a>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="font-black text-gray-700 text-sm mb-3">Active Lost Item Reports</p>
            {reportsLoading ? (
              <p className="text-gray-400 text-xs">Loading...</p>
            ) : myReports.filter((r) => r.status === "searching").length === 0 ? (
              <p className="text-gray-400 text-xs">No active reports</p>
            ) : (
              <div className="space-y-2">
                {myReports
                  .filter((r) => r.status === "searching")
                  .slice(0, 2)
                  .map((report) => (
                    <div key={report.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {report.photo_url ? (
                          <img src={report.photo_url} alt={report.item_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px] font-bold">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-sm">{report.item_name}</p>
                        <p className="text-gray-400 text-xs">Searching</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-gray-700 text-lg">Recently Found Items</h2>
              <p className="text-gray-400 text-sm mt-0.5">Items currently held by the school office</p>
            </div>
            <a href="/view-found-items" className="text-sm font-bold text-[#1a237e] hover:underline">
              View All
            </a>
          </div>

          {foundLoading ? (
            <p className="text-gray-400 text-sm">Loading found items...</p>
          ) : foundItems.length === 0 ? (
            <p className="text-gray-400 text-sm">No found items available right now.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {foundItems.map((item) => (
                <a
                  href="/view-items"
                  key={item.id}
                  className="flex-shrink-0 w-40 bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 text-center transition cursor-pointer"
                >
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden mx-auto mb-3 shadow-sm">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.item_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-bold">
                        No Photo
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-gray-700 text-sm">{item.item_name}</p>
                  <p className="text-gray-400 text-xs mt-1">Found near {item.location_found}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}