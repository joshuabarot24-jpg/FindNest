"use client";
import Image from "next/image";
import { useState } from "react";

export default function SystemManagement() {
  const [sensitivity, setSensitivity] = useState(75);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <span className="text-white font-black text-lg block">
              FIND<span className="text-[#ffd700]">NEST</span>
            </span>
            <span className="text-blue-300 text-xs">Super Admin Panel</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/10 mb-4"></div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Management</p>

          <a href="/user-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span className="text-xl">👥</span>
            <span>User Management</span>
          </a>
          <a href="/admin-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span className="text-xl">🛡️</span>
            <span>Admin Management</span>
          </a>
          <a href="/system-management" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span className="text-xl">⚙️</span>
            <span>System Management</span>
          </a>
        </nav>

        {/* Bottom */}
        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Super Admin</p>
            <p className="text-blue-300 text-xs mt-1">System Administrator</p>
          </div>
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a237e]">System Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage software versions, updates, maintenance, and deployments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">System Version</p>
                <p className="text-3xl font-black text-[#1a237e] mt-1">v2.0.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">System Status</p>
                <p className="text-3xl font-black text-green-600 mt-1">Online</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Last Backup</p>
                <p className="text-3xl font-black text-[#ffd700] mt-1">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* AI Matching Sensitivity */}
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

            <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-semibold ${
              sensitivity >= 80
                ? "bg-green-50 text-green-700"
                : sensitivity >= 65
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-600"
            }`}>
              {sensitivity >= 80
                ? "✅ High accuracy — fewer false matches"
                : sensitivity >= 65
                ? "⚠️ Moderate — balanced matching"
                : "❌ Low — may produce false matches"}
            </div>
          </div>

          {/* Database Maintenance */}
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
                <span className="text-2xl font-black text-[#1a237e]">1,240</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-700 text-sm">Database Size</p>
                  <p className="text-gray-400 text-xs mt-0.5">Current usage</p>
                </div>
                <span className="text-2xl font-black text-[#1a237e]">2.4 GB</span>
              </div>

              <button className="w-full bg-[#ffd700] hover:bg-yellow-400 text-[#1a237e] font-black py-3 rounded-xl transition shadow-sm hover:-translate-y-0.5 transform">
                Backup Records Now
              </button>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-700 text-sm">Maintenance Mode</p>
                  <p className="text-gray-400 text-xs mt-0.5">Disable system access temporarily</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    maintenanceMode ? "bg-red-500" : "bg-gray-300"
                  } relative`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    maintenanceMode ? "left-6" : "left-0.5"
                  }`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-black text-gray-700">System Logs</h2>
                <p className="text-gray-400 text-xs">All system activities are being recorded for auditing</p>
              </div>
            </div>
            <button className="text-sm font-bold text-[#1a237e] hover:underline">
              View All Logs
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              { action: "User Login", user: "Super Admin", time: "Today, 09:15 AM", type: "info" },
              { action: "Backup Completed", user: "System", time: "Today, 08:00 AM", type: "success" },
              { action: "Admin Role Revoked", user: "Super Admin", time: "Yesterday, 04:20 PM", type: "warning" },
              { action: "New Admin Assigned", user: "Super Admin", time: "Yesterday, 02:10 PM", type: "success" },
              { action: "System Update", user: "System", time: "June 10, 2026", type: "info" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    log.type === "success" ? "bg-green-500" :
                    log.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                  }`}></div>
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
    </div>
  );
}