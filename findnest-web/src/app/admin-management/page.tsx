"use client";
import Image from "next/image";
import { useState } from "react";

const admins = [
  {
    id: 1,
    name: "Matt D. Roger",
    role: "System Architect",
    moduleAccess: "Full Panel",
    status: "ACTIVE",
    initial: "M",
  },
  {
    id: 2,
    name: "Security Office Main",
    role: "Office Admin",
    moduleAccess: "Admin Module",
    status: "ACTIVE",
    initial: "S",
  },
  {
    id: 3,
    name: "IT Laboratory Staff",
    role: "Staff Assistant",
    moduleAccess: "Reports Only",
    status: "REVOKED",
    initial: "I",
  },
];

export default function AdminManagement() {
  const [search, setSearch] = useState("");

  const filtered = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = admins.filter((a) => a.status === "ACTIVE").length;
  const revokedCount = admins.filter((a) => a.status === "REVOKED").length;

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
          <a href="/admin-management" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span className="text-xl">🛡️</span>
            <span>Admin Management</span>
          </a>
          <a href="/system-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
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

        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Admin Management</h1>
            <p className="text-gray-400 text-sm mt-1">
              Assign or revoke administrator roles and control panel access
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform">
            <span>+</span> Assign New Admin
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Admins</p>
                <p className="text-4xl font-black text-[#1a237e] mt-1">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Admins</p>
                <p className="text-4xl font-black text-green-600 mt-1">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Revoked Admins</p>
                <p className="text-4xl font-black text-red-500 mt-1">{revokedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Administrators</h2>
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-64"
            />
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Personnel</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Role</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Module Access</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                        {admin.initial}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">{admin.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">ID: ADM-00{admin.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                      {admin.moduleAccess}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${admin.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        admin.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {admin.status === "ACTIVE" ? (
                        <button className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                          Revoke
                        </button>
                      ) : (
                        <button className="bg-green-50 hover:bg-green-500 hover:text-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition">
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🛡️</p>
              <p className="font-bold text-lg">No admins found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">Showing {filtered.length} of {admins.length} admins</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold">
                1
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}