"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";

const PAGE_SIZE = 5;

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [revokingUser, setRevokingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student",
    school_id: "", course: "", year_level: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const allUsers = response.data.users || [];
      setUsers(allUsers.filter((u: any) => u.role === "student"));
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.school_id || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;

  function resetForm() {
    setFormData({ name: "", email: "", password: "", role: "student", school_id: "", course: "", year_level: "" });
    setFormError("");
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    setFormError("");
    setFormLoading(true);
    try {
      await api.post("/users", formData);
      setShowCreateModal(false);
      resetForm();
      setPage(1);
      setToast("User was added successfully.");
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(", ") || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    setFormError("");
    setFormLoading(true);
    try {
      await api.put(`/users/${editingUser.id}`, formData);
      setToast(`${formData.name}'s account was updated.`);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(", ") || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokingUser) return;
    try {
      if (revokingUser.is_active) {
        await api.post(`/users/${revokingUser.id}/revoke`);
        setToast(`${revokingUser.name}'s access was revoked.`);
      } else {
        await api.post(`/users/${revokingUser.id}/restore`);
        setToast(`${revokingUser.name}'s access was restored.`);
      }
      setRevokingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  function openEditModal(user: any) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: "student",
      school_id: user.school_id || "",
      course: user.course || "",
      year_level: user.year_level || "",
    });
    setFormError("");
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
            <a href="/user-management" className="text-white font-black text-lg block hover:opacity-80 transition">
              FIND<span className="text-[#ffd700]">NEST</span>
            </a>
            <span className="text-blue-300 text-xs">Super Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Management</p>
          <a href="/user-management" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>User Management</span>
          </a>
          <a href="/admin-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Admin Management</span>
          </a>
          <a href="/system-management" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>System Management</span>
          </a>
          <a href="/super-admin-records" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Digital Records</span>
          </a>
          <a href="/audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">User Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all student accounts and their access credentials</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform"
          >
            + Create User
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Total Students</p>
            <p className="text-4xl font-black text-[#1a237e] mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Active Students</p>
            <p className="text-4xl font-black text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Inactive Students</p>
            <p className="text-4xl font-black text-red-500 mt-1">{inactiveCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Students</h2>
            <input
              type="text"
              placeholder="Search by name, email, or school ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold">Loading students...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">School ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                          {user.name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{user.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm font-medium">{user.school_id || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 text-sm">{user.course || "—"} {user.year_level ? `· ${user.year_level}` : ""}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never logged in"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`} />
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${user.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {user.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="bg-blue-50 hover:bg-[#1a237e] hover:text-white text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRevokingUser(user)}
                          className={user.is_active
                            ? "bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                            : "bg-green-50 hover:bg-green-600 hover:text-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          }
                        >
                          {user.is_active ? "Revoke" : "Restore"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold text-lg">No students found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={p === page ? "px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold" : "px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition"}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>
            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Create New User</h2>
            <p className="text-gray-400 text-sm mb-6">Add a new student account to the system</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Juan Dela Cruz" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="e.g. juan@sjdmcci.edu.ph" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">School ID</label>
                <input type="text" value={formData.school_id} onChange={(e) => setFormData({...formData, school_id: e.target.value})} placeholder="e.g. 2022-10043" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course</label>
                <input type="text" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} placeholder="e.g. BSIT" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year Level</label>
                <input type="text" value={formData.year_level} onChange={(e) => setFormData({...formData, year_level: e.target.value})} placeholder="e.g. 3rd Year" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50">
                  {formLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>
            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Edit Student</h2>
            <p className="text-gray-400 text-sm mb-6">Update {editingUser.name}&apos;s account details</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">School ID</label>
                <input type="text" value={formData.school_id} onChange={(e) => setFormData({...formData, school_id: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course</label>
                <input type="text" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year Level</label>
                <input type="text" value={formData.year_level} onChange={(e) => setFormData({...formData, year_level: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50">
                  {formLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {revokingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <h2 className="text-xl font-black text-[#1a237e] mb-2">
              {revokingUser.is_active ? "Revoke Access?" : "Restore Access?"}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {revokingUser.is_active
                ? `${revokingUser.name} will lose access to the system immediately.`
                : `${revokingUser.name} will regain access to the system.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRevokingUser(null)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={handleRevokeConfirm}
                className={`flex-1 text-white font-bold py-3 rounded-2xl transition ${revokingUser.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
              >
                {revokingUser.is_active ? "Revoke" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}