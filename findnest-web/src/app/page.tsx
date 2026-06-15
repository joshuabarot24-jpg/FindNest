"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Login Role Selection Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            
            {/* Close Button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none"
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-[#1a237e] mb-1">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Choose your account type to continue</p>
            </div>

            {/* Role Options */}
            <div className="space-y-4">

              {/* Super Admin */}
              <a
                href="/login"
                className="flex items-center gap-4 w-full border-2 border-[#1a237e]/20 hover:border-[#1a237e] hover:bg-[#1a237e]/5 rounded-2xl p-4 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-[#1a237e] rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1a237e] text-base">Super Admin</p>
                  <p className="text-gray-400 text-xs">CCI IT Coordinator — Full system access</p>
                </div>
                <span className="ml-auto text-[#1a237e]/40 group-hover:text-[#1a237e] text-xl transition">→</span>
              </a>

              {/* Admin */}
              <a
                href="/admin-login"
                className="flex items-center gap-4 w-full border-2 border-[#ffd700]/40 hover:border-[#ffd700] hover:bg-[#ffd700]/5 rounded-2xl p-4 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-[#ffd700] rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1a237e] text-base">Admin</p>
                  <p className="text-gray-400 text-xs">Guidance Counselor — Manage items &amp; claims</p>
                </div>
                <span className="ml-auto text-[#ffd700]/60 group-hover:text-[#ffd700] text-xl transition">→</span>
              </a>

              {/* Student */}
              <a
                href="/student-login"
                className="flex items-center gap-4 w-full border-2 border-red-400/30 hover:border-red-500 hover:bg-red-50 rounded-2xl p-4 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1a237e] text-base">Student</p>
                  <p className="text-gray-400 text-xs">Report &amp; track lost or found items</p>
                </div>
                <span className="ml-auto text-red-400/60 group-hover:text-red-500 text-xl transition">→</span>
              </a>

            </div>

            {/* Footer note */}
            <p className="text-center text-gray-400 text-xs mt-6">
              Not sure which to pick? Contact your school administrator.
            </p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-4 bg-[#1a237e]/95 backdrop-blur-md shadow-lg">
       <div className="flex items-center gap-3">
          <span className="text-xl font-black text-white tracking-wide">
            FIND<span className="text-[#ffd700]">NEST</span>
          </span>
        </div>
        <div className="flex items-center gap-10">
          <a href="#" className="text-blue-200 hover:text-[#ffd700] transition font-medium text-sm tracking-wide">HOME</a>
          <a href="#" className="text-blue-200 hover:text-[#ffd700] transition font-medium text-sm tracking-wide">LOST</a>
          <a href="#" className="text-blue-200 hover:text-[#ffd700] transition font-medium text-sm tracking-wide">FOUND</a>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-[#ffd700] text-[#1a237e] font-bold px-6 py-2 rounded-full hover:bg-yellow-300 transition shadow-md text-sm"
          >
            LOG IN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#1565c0] overflow-hidden pt-20">

    <div className="absolute top-20 right-20 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between px-20 w-full">
        <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-200 text-sm font-medium">AI-Powered Lost &amp; Found System</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-tight mb-6">
              Never Lose
              <span className="block text-[#ffd700]">What Matters</span>
              <span className="block text-white">Most.</span>
            </h1>

            <p className="text-blue-200 text-lg mb-10 leading-relaxed">
              FindNest uses advanced AI image recognition to match lost and found items on campus. Submit a report, get notified instantly.
            </p>

            <div className="flex gap-4">
              <a href="#" className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-2xl transition shadow-xl hover:shadow-red-500/30 hover:-translate-y-1">
                <span>📋</span> Report Lost Item
              </a>
              <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition backdrop-blur-sm hover:-translate-y-1">
                <span>🔍</span> Found Something?
              </a>
            </div>
            
            <div className="flex gap-10 mt-12">
              <div>
                <p className="text-3xl font-black text-[#ffd700]">675+</p>
                <p className="text-blue-300 text-sm">Students</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <p className="text-3xl font-black text-[#ffd700]">AI</p>
                <p className="text-blue-300 text-sm">Powered Matching</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <p className="text-3xl font-black text-[#ffd700]">24/7</p>
                <p className="text-blue-300 text-sm">Real-Time Alerts</p>
              </div>
            </div>
          </div>

         <div className="relative">
            <div className="w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
             <Image
                src="/images/findnest-logo.svg"
                alt="FindNest Logo"
                width={300}
                height={300}
                className="rounded-2xl mb-4"
                priority
             />
              <h3 className="text-white font-black text-lg text-center">SJDM Cornerstone</h3>
              <p className="text-blue-300 text-sm text-center mb-6">College Inc.</p>
            <div className="space-y-3 w-full">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-white text-sm font-semibold">AI Image Matching</p>
                    <p className="text-blue-300 text-xs">Smart item recognition</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="text-white text-sm font-semibold">Instant Notifications</p>
                    <p className="text-blue-300 text-xs">Real-time push alerts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="text-white text-sm font-semibold">Claim Verification</p>
                    <p className="text-blue-300 text-xs">5-layer security check</p>
                  </div>
                </div>
              </div>
            </div>
          <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
              ✓ Match Found!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#ffd700] text-[#1a237e] text-xs font-bold px-3 py-2 rounded-full shadow-lg">
              🔍 89% Match
            </div>
          </div>
        </div>

      <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-20 py-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#1a237e] mb-4">How FindNest Works</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">A smarter way to manage lost and found items on campus</p>
        </div>
      <div className="grid grid-cols-3 gap-8">
          <div className="group text-center p-8 rounded-3xl border-2 border-gray-100 hover:border-[#1a237e] hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 group-hover:bg-[#1a237e] rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="font-black text-[#1a237e] text-xl mb-3">Submit a Report</h3>
            <p className="text-gray-500 leading-relaxed">Upload a photo of your lost or found item. Our AI automatically detects item details.</p>
          </div>
        <div className="group text-center p-8 rounded-3xl border-2 border-gray-100 hover:border-[#ffd700] hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-yellow-50 group-hover:bg-[#ffd700] rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="font-black text-[#1a237e] text-xl mb-3">AI Finds a Match</h3>
            <p className="text-gray-500 leading-relaxed">Our AI engine compares your report against all found items and finds potential matches instantly.</p>
          </div>
        <div className="group text-center p-8 rounded-3xl border-2 border-gray-100 hover:border-red-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-red-50 group-hover:bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="font-black text-[#1a237e] text-xl mb-3">Claim Your Item</h3>
            <p className="text-gray-500 leading-relaxed">Go through our secure 5-layer verification process and claim your belongings from the school office.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-20 py-20 bg-gradient-to-r from-[#1a237e] to-[#1565c0]">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4">Lost Something on Campus?</h2>
          <p className="text-blue-200 text-lg mb-10">Report it now and let our AI do the work for you.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="bg-[#ffd700] text-[#1a237e] font-black px-10 py-4 rounded-2xl hover:bg-yellow-300 transition shadow-xl text-lg">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1757] px-20 py-12">
        <div className="flex justify-between items-start">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-black text-white">
                FIND<span className="text-[#ffd700]">NEST</span>
              </span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">
              A multi-platform lost and found record management system for SJDM Cornerstone College Inc.
            </p>
          </div>
          <div>
            <p className="font-bold mb-4 text-[#ffd700] text-sm tracking-wide uppercase">Site</p>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Lost Items</a>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Found Items</a>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Report Item</a>
          </div>
          <div>
            <p className="font-bold mb-4 text-[#ffd700] text-sm tracking-wide uppercase">Help</p>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Customer Support</a>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Privacy Policy</a>
          </div>
          <div>
            <p className="font-bold mb-4 text-[#ffd700] text-sm tracking-wide uppercase">Connect</p>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">LinkedIn</a>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">Facebook</a>
            <a href="#" className="block text-blue-300 text-sm hover:text-white mb-2">YouTube</a>
          </div>
          <div>
            <p className="font-bold mb-4 text-[#ffd700] text-sm tracking-wide uppercase">Contact</p>
            <p className="text-blue-300 text-sm mb-2">+63 XXX XXX XXXX</p>
            <p className="text-blue-300 text-sm">findnest@email.com</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-blue-400 text-sm">© 2026 FindNest — SJDM Cornerstone College Inc. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}