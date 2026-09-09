"use client";
import { useState, useMemo, useEffect } from "react";
import api from "@/lib/api";

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  school_id: string | null;
  course: string | null;
  year_level: string | null;
  education_level: string | null;
  is_active: boolean;
  trust_score: number;
  password_change_requested: boolean;
  password_change_reason: string | null;
  password_last_changed_at: string | null;
}

const PAGE_SIZE = 5;

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatRole(role: string) {
  return role.replace("_", " ");
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export default function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [mainTab, setMainTab] = useState<"admins" | "students">("admins");
  const [studentSubTab, setStudentSubTab] = useState<"college" | "high_school">("college");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [revokingUser, setRevokingUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    school_id: "",
    course: "",
    year_level: "",
    education_level: "college",
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
      const allUsers: SystemUser[] = response.data.users || [];
      setUsers(allUsers.filter((u) => u.role !== "super_admin"));
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const baseFiltered = useMemo(() => {
    if (mainTab === "admins") {
      return users.filter((u) => u.role === "admin");
    }
    return users.filter(
      (u) => u.role === "student" && u.education_level === studentSubTab
    );
  }, [users, mainTab, studentSubTab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return baseFiltered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.school_id || "").toLowerCase().includes(q)
    );
  }, [baseFiltered, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [mainTab, studentSubTab, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.filter((u) => !u.is_active).length;
  const pendingPasswordCount = users.filter((u) => u.password_change_requested).length;

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: mainTab === "admins" ? "admin" : "student",
      school_id: "",
      course: "",
      year_level: "",
      education_level: "college",
    });
    setFormError("");
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  function openEditModal(user: SystemUser) {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      school_id: user.school_id || "",
      course: user.course || "",
      year_level: user.year_level || "",
      education_level: user.education_level || "college",
    });
    setFormError("");
    setEditingUser(user);
  }

  async function handleCreateSubmit() {
    setFormError("");
    setFormLoading(true);
    try {
      await api.post("/users", formData);
      setShowCreateModal(false);
      setPage(1);
      setToast(`${formData.name} was added successfully.`);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(", ") ||
          "Failed to create user"
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEditSubmit() {
    if (!editingUser) return;
    setFormError("");
    setFormLoading(true);
    try {
      await api.put(`/users/${editingUser.id}`, formData);
      setToast(`${formData.name}'s account was updated.`);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(", ") ||
          "Failed to update user"
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRevokeConfirm() {
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
      setRevokingUser(null);
    }
  }

  const editCooldownDaysLeft = editingUser?.password_last_changed_at
    ? Math.max(0, 14 - daysSince(editingUser.password_last_changed_at))
    : 0;
  const editOnCooldown = editingUser?.role === "student" && editCooldownDaysLeft > 0;

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
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">
            Management
          </p>

          <a
            href="/user-management"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20"
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
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Super Admin</p>
            <p className="text-blue-300 text-xs mt-1">System Administrator</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("findnest_token");
              localStorage.removeItem("findnest_user");
              window.location.href = "/";
            }}
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
            <p className="text-gray-400 text-sm mt-1">
              Manage all system users and their access credentials
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform"
          >
            <span>+</span> Create New User
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Total Users</p>
            <p className="text-4xl font-black text-[#1a237e] mt-1">{users.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Active Users</p>
            <p className="text-4xl font-black text-green-600 mt-1">{activeCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Inactive Users</p>
            <p className="text-4xl font-black text-red-500 mt-1">{inactiveCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Password Requests</p>
            <p className="text-4xl font-black text-orange-500 mt-1">{pendingPasswordCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setMainTab("admins")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              mainTab === "admins"
                ? "bg-[#1a237e] text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setMainTab("students")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              mainTab === "students"
                ? "bg-[#1a237e] text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]"
            }`}
          >
            Students
          </button>

          {mainTab === "students" && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <button
                onClick={() => setStudentSubTab("college")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  studentSubTab === "college"
                    ? "bg-blue-50 text-[#1a237e] border border-blue-200"
                    : "bg-white text-gray-400 border border-gray-200 hover:text-gray-600"
                }`}
              >
                College
              </button>
              <button
                onClick={() => setStudentSubTab("high_school")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  studentSubTab === "high_school"
                    ? "bg-blue-50 text-[#1a237e] border border-blue-200"
                    : "bg-white text-gray-400 border border-gray-200 hover:text-gray-600"
                }`}
              >
                High School
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">
              {mainTab === "admins" ? "All Admins" : studentSubTab === "college" ? "College Students" : "High School Students"}
            </h2>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold">Loading users...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {mainTab === "admins" ? "Role" : "School ID"}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                          {getInitial(user.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-700">{user.name}</p>
                            {user.password_change_requested && (
                              <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                PASSWORD REQUEST
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">
                            ID: USR-{String(user.id).padStart(3, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {mainTab === "admins" ? (
                        <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg capitalize">
                          {formatRole(user.role)}
                        </span>
                      ) : (
                        <p className="text-gray-600 text-sm font-semibold">{user.school_id || "—"}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.is_active ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                            user.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
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
                          className={
                            user.is_active
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
              <p className="font-bold text-lg">No users found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
              &ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
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

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Create New User</h2>
            <p className="text-gray-400 text-sm mb-6">
              Add a new user account to the system
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                  autoComplete="off"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. juan.delacruz@sjdmcci.edu.ph"
                  autoComplete="off"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm capitalize"
                >
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {formData.role === "student" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Education Level
                    </label>
                    <select
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    >
                      <option value="college">College</option>
                      <option value="high_school">High School</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      School ID
                    </label>
                    <input
                      type="text"
                      value={formData.school_id}
                      onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                      placeholder="e.g. 2022-10043"
                      autoComplete="off"
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {formData.education_level === "college" ? "Course" : "Section"}
                    </label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      placeholder={formData.education_level === "college" ? "e.g. BSIT" : "e.g. Newton"}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {formData.education_level === "college" ? "Year Level" : "Grade Level"}
                    </label>
                    <input
                      type="text"
                      value={formData.year_level}
                      onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                      placeholder={formData.education_level === "college" ? "e.g. 3rd Year" : "e.g. Grade 8"}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                </>
              )}

              {formError && (
                <p className="text-red-500 text-xs font-semibold">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={formLoading}
                className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
              >
                {formLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Edit User</h2>
            <p className="text-gray-400 text-sm mb-6">
              Update {editingUser.name}&apos;s account details
            </p>

            {editingUser.role === "student" && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Trust Score</p>
                  <p className="text-2xl font-black text-[#1a237e]">{editingUser.trust_score}</p>
                </div>
              </div>
            )}

            {editingUser.password_change_requested && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5">
                <p className="text-orange-700 font-bold text-sm mb-1">Password Change Requested</p>
                <p className="text-orange-600 text-xs">
                  {editingUser.password_change_reason || "No reason provided."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoComplete="off"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="off"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  disabled={editOnCooldown}
                  className={`w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm ${
                    editOnCooldown ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""
                  }`}
                />
                {editOnCooldown && (
                  <p className="text-orange-500 text-xs font-semibold mt-1">
                    This student's password was changed recently. Wait {editCooldownDaysLeft} more day{editCooldownDaysLeft === 1 ? "" : "s"} before changing it again.
                  </p>
                )}
              </div>

              {editingUser.role === "student" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Education Level
                    </label>
                    <select
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    >
                      <option value="college">College</option>
                      <option value="high_school">High School</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      School ID
                    </label>
                    <input
                      type="text"
                      value={formData.school_id}
                      onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                      autoComplete="off"
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {formData.education_level === "college" ? "Course" : "Section"}
                    </label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {formData.education_level === "college" ? "Year Level" : "Grade Level"}
                    </label>
                    <input
                      type="text"
                      value={formData.year_level}
                      onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                      className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm"
                    />
                  </div>
                </>
              )}

              {formError && (
                <p className="text-red-500 text-xs font-semibold">{formError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={formLoading}
                className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
              >
                {formLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
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
              <button
                onClick={() => setRevokingUser(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className={`flex-1 text-white font-bold py-3 rounded-2xl transition ${
                  revokingUser.is_active
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
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