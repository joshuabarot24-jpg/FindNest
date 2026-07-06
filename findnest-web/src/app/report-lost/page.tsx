"use client";
import { useState } from "react";
import Image from "next/image";

const categories = ["Electronics", "Personal Belongings", "ID/Cards", "Keys", "School Supplies", "Accessories", "Others"];

export default function ReportLostPage() {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoPreview) {
      setPhotoError(true);
      const uploadSection = document.getElementById("photo-upload-section");
      uploadSection?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPhotoError(false);
    setSubmitted(true);
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
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">R</a>
        </div>
      </nav>

      <main className="px-8 py-10 max-w-2xl mx-auto">
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
            <h1 className="text-2xl font-black text-[#1a237e]">Report Submitted!</h1>
            <p className="text-gray-400 text-sm mt-2">
              Our AI is now comparing your report against found items. You will be notified once a match is identified.
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 mt-6 text-left">
              <p className="text-[#1a237e] font-bold text-sm">{itemName || "Your Item"}</p>
              <p className="text-gray-500 text-xs mt-1">Category: {category}</p>
              <p className="text-gray-500 text-xs">Last seen: {location || "Not specified"}</p>
              <p className="text-gray-500 text-xs">Date lost: {date || "Not specified"}</p>
              <p className="text-gray-500 text-xs mt-1">Status: <span className="font-bold text-blue-600">Searching for match...</span></p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4 flex items-center gap-2">
              <p className="text-blue-700 text-xs">Our AI will notify you as soon as a potential match is found</p>
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
                <div>
                  <h1 className="text-white font-black text-xl">Report Lost Item</h1>
                  <p className="text-red-100 text-sm">Help us help you find it faster</p>
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
                      : "border-gray-200 hover:border-red-300 bg-gray-50"
                  }`}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                  ) : (
                    <>
                      <p className="text-4xl mb-3">📷</p>
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
                  <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                    A photo is required for better evidence before you can submit your report!
                  </p>
                )}
              </label>

              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                <p className="text-blue-700 text-xs">Our AI will automatically check image quality and detect item attributes from your photo</p>
              </div>

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
                <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
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

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any extra details about your item e.g. color, brand, markings"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Last Seen Location & Time</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Lab, Canteen, Room 402, Around 2:30 PM"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none transition text-gray-700"
                  required
                />
              </div>

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

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="font-bold text-gray-700 text-sm mb-2">Review Your Report</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Item:</span> {itemName || "Not filled yet"}</p>
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Category:</span> {category}</p>
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Location:</span> {location || "Not filled yet"}</p>
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Date:</span> {date || "Not filled yet"}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-center gap-2">
                <p className="text-yellow-700 text-xs">Only category, general date, and area will be publicly visible to prevent fake claims</p>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl transition shadow-lg text-lg"
              >
                Submit Report
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}