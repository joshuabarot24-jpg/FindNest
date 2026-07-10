"use client";
import { useState, useMemo, useEffect } from "react";

type AdminStatus = "ACTIVE" | "REVOKED";

interface Admin {
  id: number;
  name: string;
  role: string;
  moduleAccess: string;
  status: AdminStatus;
}

const initialAdmins: Admin[] = [
  {
    id: 1,
    name: "Matt D. Roger",
    role: "System Architect",
    moduleAccess: "Full Panel",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Security Office Main",
    role: "Office Admin",
    moduleAccess: "Admin Module",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "IT Laboratory Staff",
    role: "Staff Assistant",
    moduleAccess: "Reports Only",
    status: "REVOKED",
  },
];

const ROLE_OPTIONS = ["System Architect", "Office Admin", "Staff Assistant", "Guidance Counselor"];
const MODULE_OPTIONS = ["Full Panel", "Admin Module", "Reports Only"];

const PAGE_SIZE = 5;

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [revokingAdmin, setRevokingAdmin] = useState<Admin | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState(ROLE_OPTIONS[2]);
  const [formModule, setFormModule] = useState(MODULE_OPTIONS[2]);
  const [formError, setFormError] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.moduleAccess.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = admins.filter((a) => a.status === "ACTIVE").length;
  const revokedCount = admins.filter((a) => a.status === "REVOKED").length;

  function resetForm() {
    setFormName("");
    setFormRole(ROLE_OPTIONS[2]);
    setFormModule(MODULE_OPTIONS[2]);
    setFormError("");
  }

  function openAssignModal() {
    resetForm();
    setShowAssignModal(true);
  }

  function handleAssignSubmit() {
    if (!formName.trim()) {
      setFormError("Personnel name is required.");
      return;
    }
    const newAdmin: Admin = {
      id: Math.max(0, ...admins.map((a) => a.id)) + 1,
      name: formName.trim(),
      role: formRole,
      moduleAccess: formModule,
      status: "ACTIVE",
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setShowAssignModal(false);
    setPage(1);
    setToast(`${newAdmin.name} was assigned as ${newAdmin.role}.`);
    resetForm();
  }

  function handleRevokeConfirm() {
    if (!revokingAdmin) return;
    const nextStatus: AdminStatus = revokingAdmin.status === "ACTIVE" ? "REVOKED" : "ACTIVE";
    setAdmins((prev) =>
      prev.map((a) => (a.id === revokingAdmin.id ? { ...a, status: nextStatus } : a))
    );
    setToast(
      nextStatus === "REVOKED"
        ? `${revokingAdmin.name}'s admin access was revoked.`
        : `${revokingAdmin.name}'s admin access was restored.`
    );
    setRevokingAdmin(null);
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20"
          >
          <span>Admin Management</span>
          </a>

          <a
            href="/system-management"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
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
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium"
          >
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Admin Management</h1>
            <p className="text-gray-400 text-sm mt-1">
              Assign or revoke administrator roles and control panel access
            </p>
          </div>
          <button
            onClick={openAssignModal}
            className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform"
          >
            <span>+</span> Assign New Admin
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Total Admins</p>
            <p className="text-4xl font-black text-[#1a237e] mt-1">{admins.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Active Admins</p>
            <p className="text-4xl font-black text-green-600 mt-1">{activeCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Revoked Admins</p>
            <p className="text-4xl font-black text-red-500 mt-1">{revokedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Administrators</h2>
            <input
              type="text"
              placeholder="Search by name, role, or module..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Personnel
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Assigned Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Module Access
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                        {getInitial(admin.name)}
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
                      <div
                        className={`w-2 h-2 rounded-full ${
                          admin.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                          admin.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {admin.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {admin.status === "ACTIVE" ? (
                        <button
                          onClick={() => setRevokingAdmin(admin)}
                          className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => setRevokingAdmin(admin)}
                          className="bg-green-50 hover:bg-green-500 hover:text-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
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

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
              &ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} admins
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={
                    p === page
                      ? "px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold"
                      : "px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition"
                  }
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Assign New Admin</h2>
            <p className="text-gray-400 text-sm mb-6">
              Grant a personnel account admin panel access
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Personnel Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Assigned Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Module Access
                </label>
                <select
                  value={formModule}
                  onChange={(e) => setFormModule(e.target.value)}
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                >
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-red-500 text-xs font-semibold">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition"
              >
                Assign Admin
              </button>
            </div>
          </div>
        </div>
      )}
      
      {revokingAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl ${
                revokingAdmin.status === "ACTIVE" ? "bg-red-50" : "bg-green-50"
              }`}
            >
              {revokingAdmin.status === "ACTIVE" ? "⚠️" : "✅"}
            </div>

            <h2 className="text-xl font-black text-[#1a237e] mb-2">
              {revokingAdmin.status === "ACTIVE" ? "Revoke Admin Access?" : "Restore Admin Access?"}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {revokingAdmin.status === "ACTIVE"
                ? `${revokingAdmin.name} will lose access to the admin panel immediately.`
                : `${revokingAdmin.name} will regain access to the admin panel.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRevokingAdmin(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className={`flex-1 text-white font-bold py-3 rounded-2xl transition ${
                  revokingAdmin.status === "ACTIVE"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {revokingAdmin.status === "ACTIVE" ? "Revoke" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}