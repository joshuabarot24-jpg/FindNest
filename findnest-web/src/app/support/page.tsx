"use client";
import Image from "next/image";
import { useState } from "react";

export default function SupportPage() {
  const [inquiryType, setInquiryType] = useState("Account Help");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image
            src="/images/findnest-logo.svg"
            alt="FindNest Logo"
            width={38}
            height={38}
            className="rounded-lg"
          />
          <span className="text-lg font-black text-[#1a237e]">
            FIND<span className="text-[#ffd700]">NEST</span>
          </span>
        </div>

        <div className="flex items-center gap-8">
          <a href="/student-home" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Home</a>
          <a href="/view-found-items" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">View Found Items</a>
          <a href="/claim-status" className="text-gray-500 hover:text-[#1a237e] transition text-sm font-medium">Claim Status</a>
          <a href="/support" className="text-[#1a237e] font-bold text-sm border-b-2 border-[#1a237e] pb-1">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/notifications" className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">1</span>
          </a>
          <a href="/profile" className="w-10 h-10 bg-[#1a237e] rounded-full flex items-center justify-center text-white font-bold">
            R
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-8 py-12 max-w-3xl mx-auto">

        <div className="grid grid-cols-3 gap-6">

          {/* Left - Form */}
          <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h1 className="text-xl font-black text-[#1a237e]">Support & Feedback</h1>
                <p className="text-gray-400 text-sm">We are here to help with any concerns</p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  ✅
                </div>
                <p className="font-black text-gray-700 text-lg">Inquiry Submitted!</p>
                <p className="text-gray-400 text-sm mt-1">Our team will get back to you shortly.</p>
                <button
                  onClick={() => { setSubmitted(false); setMessage(""); }}
                  className="mt-6 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-xl transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700"
                  >
                    <option>Account Help</option>
                    <option>Report a Problem</option>
                    <option>Claim Dispute</option>
                    <option>Lost Item Inquiry</option>
                    <option>Found Item Inquiry</option>
                    <option>General Feedback</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I lost my wallet at my classroom."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1a237e] focus:outline-none transition text-gray-700 resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-black py-4 rounded-xl transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Right - Contact Info */}
          <div className="col-span-1 space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <p className="font-black text-gray-700 text-sm mb-4">Contact Information</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Guidance Counselor</p>
                    <p className="text-gray-400 text-xs">Ms. Shelly S. Durban</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Email</p>
                    <p className="text-gray-400 text-xs">findnest@sjdmcci.edu.ph</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Office</p>
                    <p className="text-gray-400 text-xs">Guidance Office, Main Bldg</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">Office Hours</p>
                    <p className="text-gray-400 text-xs">Mon-Fri, 8AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-3xl border border-blue-100 p-6">
              <p className="font-bold text-[#1a237e] text-sm mb-2">💡 Quick Tip</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                For faster response, include your report ID or claim ID in your message.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}