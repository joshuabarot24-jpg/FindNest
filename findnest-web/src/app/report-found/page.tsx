"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

export default function ReportFoundPage() {
  const [userInitial, setUserInitial] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("findnest_user");
    if (stored) {
      const currentUser = JSON.parse(stored);
      setUserInitial(currentUser?.name?.charAt(0).toUpperCase() || "");
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count || 0);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    fetchUnread();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError(false);
    setUploading(true);
    setPhotoUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "found-items");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setPhotoPreview(null);
      setPhotoError(true);
      alert("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoUrl) {
      setPhotoError(true);
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post("/found-items", {
        item_name: itemName,
        category: category,
        description: description,
        location_found: location,
        date_found: new Date().toISOString().split("T")[0],
        photo_url: photoUrl,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      alert(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">
            {userInitial}
          </a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-2xl mx-auto">
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-[#1a237e]">Thank You!</h1>
            <p className="text-gray-400 text-sm mt-2">
              Your found item report has been submitted. Please surrender the item to the school office to complete the process.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mt-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-orange-700 text-sm">Important Reminder!</p>
              </div>
              <p className="text-orange-600 text-xs leading-relaxed">
                Surrender this item to Ms. Shelly S. Durban at the Guidance Office within <strong>2 school days</strong>. If not surrendered within this window, the post will be automatically rejected and your account may be flagged.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 mt-4 text-left">
              <p className="text-[#1a237e] font-bold text-sm">{itemName || "Your Reported Item"}</p>
              <p className="text-gray-500 text-xs mt-1">Category: {category}</p>
              <p className="text-gray-500 text-xs">Found at: {location || "Not specified"}</p>
              <p className="text-gray-500 text-xs mt-1">Status: <span className="font-bold text-yellow-600">Pending Physical Receipt</span></p>
            </div>
            <div className="flex gap-3 mt-6">
              <a href="/student-home" className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition text-center text-sm">
                Back to Home
              </a>
              <a href="/claim-status" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition text-center text-sm">
                Track Status
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-white font-black text-xl">Report Found Item</h1>
                  <p className="text-green-100 text-sm">Help reunite this item with its owner</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">

              <label id="photo-upload-section" className="block">
                <p className="text-sm font-bold text-gray-600 mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </p>
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                    photoError
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-green-300 bg-gray-50"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 font-medium">Uploading to cloud...</p>
                    </div>
                  ) : photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                      {photoUrl && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                          <span className="text-green-600 text-xs font-bold">Photo uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 ${photoError ? "text-red-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className={`font-bold text-sm ${photoError ? "text-red-600" : "text-gray-600"}`}>
                        Click to upload a photo
                      </p>
                      <p className={`text-xs mt-1 ${photoError ? "text-red-400" : "text-gray-400"}`}>
                        PNG, JPG up to 10MB
                      </p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {photoError && (
                  <p className="text-red-500 text-xs font-bold mt-2">
                    A photo is required before you can submit this report.
                  </p>
                )}
              </label>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Scientific Calculator"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition text-gray-700"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Location Found & Time</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Library, Canteen, Room 402, Around 2:30 PM"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any details that might help identify the owner"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition text-gray-700 resize-none"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-orange-700 text-sm">Surrender Reminder!</p>
                </div>
                <p className="text-orange-600 text-xs leading-relaxed">
                  You must surrender this item to <strong>Ms. Shelly S. Durban</strong> at the Guidance Office within <strong>2 school days</strong>. Failure to do so will result in automatic post rejection and account flagging.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <p className="text-purple-700 text-xs">This report is private and visible only to you and administrators</p>
              </div>

              <button
                type="submit"
                disabled={submitLoading || uploading || !photoUrl}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl transition shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? "Submitting..." : uploading ? "Waiting for photo upload..." : "Submit Report"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}