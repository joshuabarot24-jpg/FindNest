"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

export default function ReportLostPage() {
  const [userInitial, setUserInitial] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [othersSpecify, setOthersSpecify] = useState("");
  const [description, setDescription] = useState("");
  const [aiFilled, setAiFilled] = useState(false);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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
      formData.append("folder", "lost-items");

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);

      if (res.data.ai_category && categories.includes(res.data.ai_category)) {
        setCategory(res.data.ai_category);
      }
      if (res.data.ai_description) {
        setDescription(res.data.ai_description);
        setAiFilled(true);
      } else {
        setAiFilled(false);
      }
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      setPhotoPreview(null);
      setPhotoError(true);
      alert(err.response?.data?.message || "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      setPhotoError(true);
      return;
    }
    if (!description.trim()) {
      setSubmitError("Description is required. Please add details manually since our AI could not auto-fill it.");
      return;
    }
    setSubmitError("");
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitLoading(true);
    try {
      await api.post("/lost-items", {
        item_name: itemName,
        category: category === "Others" ? othersSpecify.trim() : category,
        description: description,
        location_lost: location,
        date_lost: date,
        photo_url: photoUrl,
      });
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setShowConfirm(false);
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
          <a href="/view-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Items</a>
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
            <h1 className="text-2xl font-black text-[#1a237e]">Report Submitted!</h1>
            <p className="text-gray-400 text-sm mt-2">
              Our AI is now comparing your report against found items. You will be notified once a match is identified.
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 mt-6 text-left">
              <p className="text-[#1a237e] font-bold text-sm">{itemName || "Your Item"}</p>
              <p className="text-gray-500 text-xs mt-1">Category: {category === "Others" ? othersSpecify : category}</p>
              <p className="text-gray-500 text-xs">Last seen: {location || "Not specified"} {time && `at ${time}`}</p>
              <p className="text-gray-500 text-xs">Date lost: {date || "Not specified"}</p>
              <p className="text-gray-500 text-xs mt-1">Status: <span className="font-bold text-blue-600">Searching for match...</span></p>
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
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <h1 className="text-white font-black text-xl">Report Lost Item</h1>
              <p className="text-red-100 text-sm">Help us help you find it faster</p>
            </div>

            <form onSubmit={handleReview} className="p-8 space-y-5">

              <label className="block">
                <p className="text-sm font-bold text-gray-600 mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </p>
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                  photoError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 bg-gray-50"
                }`}>
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-red-300 border-t-red-500 rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 font-medium">Analyzing photo with AI...</p>
                    </div>
                  ) : photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                      {photoUrl && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                          <span className="text-green-600 text-xs font-bold">Photo uploaded and analyzed</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className={`font-bold text-sm ${photoError ? "text-red-600" : "text-gray-600"}`}>
                      Click to upload a photo
                    </p>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {photoError && (
                  <p className="text-red-500 text-xs font-bold mt-2">
                    A photo is required for better evidence before you can submit your report!
                  </p>
                )}
              </label>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Red iPhone with clear case"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Category {photoUrl && <span className="text-green-600 font-normal">(auto-detected, editable)</span>}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {category === "Others" && (
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Please Specify</label>
                  <input
                    type="text"
                    value={othersSpecify}
                    onChange={(e) => setOthersSpecify(e.target.value)}
                    placeholder="Tell us what kind of item this is"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Description {aiFilled ? <span className="text-green-600 font-normal">(auto-filled by AI, editable)</span> : <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={aiFilled ? "" : "If our AI could not auto-fill this. Please describe your item manually (color, brand, markings)."}
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700 resize-none ${
                    !aiFilled && !description.trim() ? "border-red-200 bg-red-50" : "border-gray-200"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Last Seen Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Lab, Canteen, Room 402"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Date Lost</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Approx. Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                  />
                </div>
              </div>

              {submitError && (
                <p className="text-red-500 text-xs font-bold">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={uploading || !photoUrl}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl transition shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Waiting for photo analysis..." : "Review Report"}
              </button>
            </form>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm px-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-black text-[#1a237e] mb-1">Confirm Your Report</h2>
            <p className="text-gray-400 text-sm mb-6">Please review before submitting — this will be visible to other students</p>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-6">
              <p><span className="font-bold text-gray-700">Item:</span> <span className="text-gray-600">{itemName}</span></p>
              <p><span className="font-bold text-gray-700">Category:</span> <span className="text-gray-600">{category === "Others" ? othersSpecify : category}</span></p>
              <p><span className="font-bold text-gray-700">Description:</span> <span className="text-gray-600">{description}</span></p>
              <p><span className="font-bold text-gray-700">Location:</span> <span className="text-gray-600">{location}</span></p>
              <p><span className="font-bold text-gray-700">Date:</span> <span className="text-gray-600">{date}</span> {time && <span className="text-gray-600">at {time}</span>}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition disabled:opacity-50"
              >
                {submitLoading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}