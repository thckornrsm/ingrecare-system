'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-800 ">
      <Navbar />
      <main className="w-full flex-grow flex flex-col md:flex-row">
        
        {/* Background Image: จะแสดงเฉพาะบนจอขนาดกลางขึ้นไป (md:) */}
        <div className="hidden md:flex flex-1 relative">
          <Image
            src="/background login.svg"
            alt="Forgot Password Background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-[640px] md:h-[800px] md:flex-shrink-0 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              ลืมรหัสผ่าน
            </h1>
            <p className="text-gray-600 mt-2 mb-6">
              กรุณากรอกอีเมลเพื่อรับรหัสผ่านใหม่
            </p>
            <form>
              <div className="mb-6">
                <label htmlFor="email" className="block text-base md:text-lg font-medium text-gray-700 mb-1">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3FA170] focus:border-[#3FA170] transition text-black"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#3FA170] text-white py-3 rounded-md font-semibold hover:bg-[#2C714E] transition-colors duration-300 mb-4"
              >
                ยืนยัน
              </button>
              <Link
                href="/login"
                className="w-full block text-center py-3 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                ย้อนกลับ
              </Link>
            </form>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}