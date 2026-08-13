"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  school_id: string | null;
  course: string | null;
  year_level: string | null;
  trust_score: number;
  is_active: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        const u = res.data.user;
        setUser(u);
        setName(u.name || "");
        setSchoolId(u.school_id || "");
        setCourse(u.course || "");
        setYearLevel(u.year_level || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setInfoError("Name is required.");
      return;
    }
    setInfoError("");
    setInfoSuccess("");
    setInfoLoading(true);
    try {
      const res = await api.put("/profile", {
        name: name.trim(),
        school_id: schoolId.trim() || null,
        course: course.trim() || null,
        year_level: yearLevel.trim() || null,
      });
      setUser(res.data.user);
      setInfoSuccess("Profile updated successfully.");
      setToast("Profile updated successfully.");
    } catch (err: any) {
      setInfoError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(", ") || "Failed to update profile.");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      await api.post("/profile/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setPasswordSuccess("Password changed successfully.");
      setToast("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(", ") || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("findnest_token");
    localStorage.removeItem("findnest_user");
    window.location.href = "/";
  };

  function trustScoreColor(score: number) {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-500";
  }

  function trustScoreBg(score: number) {
    if (score >= 70) return "bg-green-50 border-green-100";
    if (score >= 40) return "bg-yellow-50 border-yellow-100";
    return "bg-red-50 border-red-100";
  }

  function trustScoreLabel(score: number) {
    if (score >= 70) return "Good Standing";
    if (score >= 40) return "Moderate";
    return "Restricted";
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-[#1a237e] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/student-home" className="flex items-center gap-3">
          <span className="text-lg font-black text-[#1a237e]">FIND<span className="text-[#ffd700]">NEST</span></span>
        </a>
        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Support</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || "M"}
          </a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading profile...</div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1a237e] to-[#1565c0] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-[#1a237e]">{user?.name}</h1>
                  <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1 rounded-full capitalize">{user?.role}</span>
                    {user?.course && <span className="text-gray-400 text-xs">{user.course} &middot; {user.year_level}</span>}
                    {user?.school_id && <span className="text-gray-400 text-xs">ID: {user.school_id}</span>}
                  </div>
                </div>
                <div className={`border rounded-2xl px-5 py-4 text-center ${trustScoreBg(user?.trust_score ?? 100)}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Trust Score</p>
                  <p className={`text-3xl font-black ${trustScoreColor(user?.trust_score ?? 100)}`}>{user?.trust_score ?? 100}</p>
                  <p className={`text-xs font-bold mt-1 ${trustScoreColor(user?.trust_score ?? 100)}`}>{trustScoreLabel(user?.trust_score ?? 100)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-4 text-sm font-bold transition ${activeTab === "info" ? "text-[#1a237e] border-b-2 border-[#1a237e]" : "text-gray-400 hover:text-[#1a237e]"}`}
                >
                  Personal Information
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex-1 py-4 text-sm font-bold transition ${activeTab === "password" ? "text-[#1a237e] border-b-2 border-[#1a237e]" : "text-gray-400 hover:text-[#1a237e]"}`}
                >
                  Change Password
                </button>
              </div>

              {activeTab === "info" ? (
                <form onSubmit={handleUpdateInfo} className="p-8 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">School ID</label>
                      <input
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        placeholder="e.g. 2022-10043"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Course</label>
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="e.g. BSIT"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Year Level</label>
                    <input
                      type="text"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      placeholder="e.g. 3rd Year"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                    />
                  </div>
                  {infoError && <p className="text-red-500 text-xs font-semibold">{infoError}</p>}
                  {infoSuccess && <p className="text-green-600 text-xs font-semibold">{infoSuccess}</p>}
                  <button
                    type="submit"
                    disabled={infoLoading}
                    className="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-black py-4 rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    {infoLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleChangePassword} className="p-8 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a237e] transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {showCurrentPassword
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                          }
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                        required
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a237e] transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {showNewPassword
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                          }
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a237e] transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {showConfirmPassword
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                          }
                        </svg>
                      </button>
                    </div>
                  </div>
                  {passwordError && <p className="text-red-500 text-xs font-semibold">{passwordError}</p>}
                  {passwordSuccess && <p className="text-green-600 text-xs font-semibold">{passwordSuccess}</p>}
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-black py-4 rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold py-4 rounded-xl transition border-2 border-red-100 hover:border-red-500"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}