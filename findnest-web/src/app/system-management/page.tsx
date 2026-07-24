"use client";
import { useState, useEffect } from "react";

interface LogEntry {
  action: string;
  user: string;
  time: string;
  type: "info" | "success" | "warning";
}

const initialLogs: LogEntry[] = [
  { action: "User Login", user: "Super Admin", time: "Today, 09:15 AM", type: "info" },
  { action: "Backup Completed", user: "System", time: "Today, 08:00 AM", type: "success" },
  { action: "Admin Role Revoked", user: "Super Admin", time: "Yesterday, 04:20 PM", type: "warning" },
  { action: "New Admin Assigned", user: "Super Admin", time: "Yesterday, 02:10 PM", type: "success" },
  { action: "System Update", user: "System", time: "June 10, 2026", type: "info" },
];

function dotColor(type: LogEntry["type"]) {
  return type === "success" ? "bg-green-500" : type === "warning" ? "bg-yellow-500" : "bg-blue-500";
}

export default function SystemManagement() {
  const [sensitivity, setSensitivity] = useState(75);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState("Today");
  const [dbSizeGb, setDbSizeGb] = useState(2.4);
  const [totalRecords, setTotalRecords] = useState(1240);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function addLog(entry: Omit<LogEntry, "time">) {
    setLogs((prev) => [{ ...entry, time: "Just now" }, ...prev]);
  }

  function handleBackupNow() {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setTimeout(() => {
      setLastBackup("Today");
      setDbSizeGb((prev) => Number((prev + 0.1).toFixed(1)));
      setIsBackingUp(false);
      addLog({ action: "Backup Completed", user: "Super Admin", type: "success" });
      setToast("Backup completed successfully.");
    }, 1500);
  }

  function requestMaintenanceToggle() {
    setShowMaintenanceConfirm(true);
  }

  function confirmMaintenanceToggle() {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    setShowMaintenanceConfirm(false);
    addLog({
      action: next ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
      user: "Super Admin",
      type: next ? "warning" : "success",
    });
    setToast(
      next
        ? "Maintenance mode enabled. Students and admins are locked out."
        : "Maintenance mode disabled. System is back online."
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-[#1a237e] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/user-management" className="text-white font-black text-lg block">
              FIND<span className="text-[#ffd700]">NEST</span>
            </a>
            <span className="text-blue-300 text-xs">Super Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4"></div>

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Management</p>

          <a
            href="/user-management"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
          <span>User Management</span>
          </a>
          
          <a
            href="/admin-management"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
          <span>Admin Management</span>
          </a>
          
          <a
            href="/system-management"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20"
          >
          <span>System Management</span>
          </a>
          
          <a
            href="/super-admin-records"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
          <span>Digital Records</span>
          </a>
          
          <a
            href="/audit-trail"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
          <span>Audit Trail</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Super Admin</p>
            <p className="text-blue-300 text-xs mt-1">System Administrator</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a237e]">System Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage software versions, updates, maintenance, and deployments
          </p>
        </div>

        {maintenanceMode && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
             Maintenance mode is currently active! Students and admins cannot access the system.
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">System Version</p>
            <p className="text-3xl font-black text-[#1a237e] mt-1">v2.0.0</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">System Status</p>
            <p className={`text-3xl font-black mt-1 ${maintenanceMode ? "text-red-500" : "text-green-600"}`}>
              {maintenanceMode ? "Maintenance" : "Online"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Last Backup</p>
            <p className="text-3xl font-black text-[#ffd700] mt-1">{lastBackup}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="font-black text-gray-700 text-lg">AI Matching Sensitivity</h2>
                <p className="text-gray-400 text-sm">Control the threshold of image recognition similarity</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-500">Flexible</span>
                <span className="text-2xl font-black text-[#1a237e]">{sensitivity}%</span>
                <span className="text-sm font-bold text-gray-500">Strict</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-[#1a237e]"
              />
            </div>

            <div
              className={`mt-4 px-4 py-3 rounded-xl text-sm font-semibold ${
                sensitivity >= 80
                  ? "bg-green-50 text-green-700"
                  : sensitivity >= 65
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {sensitivity >= 80
                ? "✅ High accuracy — fewer false matches"
                : sensitivity >= 65
                ? "⚠️ Moderate — balanced matching"
                : "❌ Low — may produce false matches"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="font-black text-gray-700 text-lg">Database Maintenance</h2>
                <p className="text-gray-400 text-sm">Manage database backups and records</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-700 text-sm">Total Records</p>
                  <p className="text-gray-400 text-xs mt-0.5">All system data</p>
                </div>
                <span className="text-2xl font-black text-[#1a237e]">
                  {totalRecords.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-700 text-sm">Database Size</p>
                  <p className="text-gray-400 text-xs mt-0.5">Current usage</p>
                </div>
                <span className="text-2xl font-black text-[#1a237e]">{dbSizeGb} GB</span>
              </div>

              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="w-full bg-[#ffd700] hover:bg-yellow-400 text-[#1a237e] font-black py-3 rounded-xl transition shadow-sm hover:-translate-y-0.5 transform disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBackingUp ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#1a237e] border-t-transparent rounded-full animate-spin"></span>
                    Backing Up...
                  </>
                ) : (
                  "Backup Records Now"
                )}
              </button>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-700 text-sm">Maintenance Mode</p>
                  <p className="text-gray-400 text-xs mt-0.5">Disable system access temporarily</p>
                </div>
                <button
                  onClick={requestMaintenanceToggle}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    maintenanceMode ? "bg-red-500" : "bg-gray-300"
                  } relative`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                      maintenanceMode ? "left-6" : "left-0.5"
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="font-black text-gray-700">System Logs</h2>
              <p className="text-gray-400 text-xs">All system activities are being recorded for auditing</p>
            </div>
            <button
              onClick={() => setShowAllLogs(true)}
              className="text-sm font-bold text-[#1a237e] hover:underline"
            >
              View All Logs
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {logs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${dotColor(log.type)}`}></div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{log.action}</p>
                    <p className="text-gray-400 text-xs mt-0.5">By: {log.user}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showMaintenanceConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl ${
                maintenanceMode ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {maintenanceMode ? "✅" : "🚫"}
            </div>

            <h2 className="text-xl font-black text-[#1a237e] mb-2">
              {maintenanceMode ? "Disable Maintenance Mode?" : "Enable Maintenance Mode?"}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {maintenanceMode
                ? "Students and admins will regain access to FindNest immediately."
                : "Students and admins will be locked out of FindNest until you disable this."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMaintenanceConfirm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmMaintenanceToggle}
                className={`flex-1 text-white font-bold py-3 rounded-2xl transition ${
                  maintenanceMode ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {maintenanceMode ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8 max-h-[80vh] flex flex-col">
            <button
              onClick={() => setShowAllLogs(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-2xl font-black text-[#1a237e] mb-1">System Logs</h2>
            <p className="text-gray-400 text-sm mb-6">
              Complete history of all recorded system activity
            </p>

            <div className="overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-2xl">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${dotColor(log.type)}`}></div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">{log.action}</p>
                      <p className="text-gray-400 text-xs mt-0.5">By: {log.user}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}