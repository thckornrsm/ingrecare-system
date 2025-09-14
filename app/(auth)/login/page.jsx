'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-800">
      <Navbar />
      <main className="w-full flex-grow flex flex-col md:flex-row">
        {/* Background Image: จะแสดงเฉพาะบนจอขนาดกลางขึ้นไป (md:) */}
        <div className="hidden md:flex flex-1 relative">
          <Image
            src="/background login.svg"
            alt="Login Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        {/* Form Section */}
        <div className="w-full md:w-[640px] md:h-[916px] md:flex-shrink-0 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            {/* ปรับขนาด h1 สำหรับจอ mobile */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              เข้าสู่ระบบ
            </h1>
            <form>
              <div className="mb-4">
                {/* ปรับขนาด label สำหรับจอ mobile */}
                <label
                  htmlFor="email"
                  className="block text-base md:text-lg font-medium text-gray-700 mb-1"
                >
                  อีเมล (Email)  
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="อีเมล (Email)"
                  className="block w-full border border-gray-300 rounded-md p-2 text-base md:text-lg"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-base md:text-lg font-medium text-gray-700 mb-1"
                >
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="รหัสผ่าน (Password)"
                    className="block w-full border border-gray-300 rounded-md p-2 text-base md:text-lg"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#3FA170] text-white rounded-md py-2 text-base md:text-lg font-semibold hover:bg-[#2C714E] transition-colors duration-300"
              >
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

