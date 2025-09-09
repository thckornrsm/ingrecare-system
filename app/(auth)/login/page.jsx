// app/(auth)/login/page.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// ========= Header Component (ไม่มีการเปลี่ยนแปลง) =========
const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="IngreCare Logo" width={24} height={24} />
          <span className="font-semibold text-gray-800">IngreCare</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#2AA77A]">หน้าแรก</Link>
          <Link href="/#features" className="hover:text-[#2AA77A]">ฟีเจอร์ระบบ</Link>
          <Link href="/#contact" className="hover:text-[#2AA77A]">ติดต่อฝ่ายขาย</Link>
        </nav>
        <Link
          href="/login"
          className="bg-[#3FA170] text-white px-6 py-2 rounded-md border-none cursor-pointer font-semibold text-sm flex items-center justify-center hover:bg-[#2C714E] transition-colors duration-300"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
};

// ========= Footer Component (ไม่มีการเปลี่ยนแปลง) =========
const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
        {/* Column 1: Logo and Company Info */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/logo.svg" alt="IngreCare Logo" width={32} height={32} />
            <span className="font-bold text-lg text-gray-800">IngreCare</span>
          </div>
          <p>ระบบบริการวัตถุดิบ</p>
        </div>

        {/* Column 2: Admin Info */}
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-gray-800 mb-2">ผู้ดูแลระบบ</h3>
          <ul>
            <li>คุณกร วิชานันท์</li>
            <li>คุณโสภณัฐ กิจดำรงค์ธรรม</li>
            <li>คุณปุญญ์ เพชรพลอย</li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-800 mb-2 invisible">Contact</h3> {/* Hidden title for alignment */}
            <ul>
                <li>thatchakorn.r@ku.th</li>
                <li>somchanok.v@ku.th</li>
                <li>nattamon.a@ku.th</li>
            </ul>
        </div>
      </div>
    </footer>
  );
};


// ========= Main Login Page Component (Updated for Responsiveness) =========
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-800 font-sans">
      <Header />

      <main className="w-full flex-grow flex flex-col md:flex-row">
        
        {/* Background Image: จะแสดงเฉพาะบนจอขนาดกลางขึ้นไป (md:) */}
        <div className="hidden md:flex flex-1 relative">
          <Image
            src="/background login.svg"
            alt="Login Background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-[640px] md:h-[800px] md:flex-shrink-0 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            {/* ปรับขนาด h1 สำหรับจอ mobile */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              เข้าสู่ระบบ
            </h1>
            <form>
              <div className="mb-4">
                {/* ปรับขนาด label สำหรับจอ mobile */}
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
              <div className="mb-4">
                {/* ปรับขนาด label สำหรับจอ mobile */}
                <label htmlFor="password" className="block text-base md:text-lg font-medium text-gray-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="ใส่รหัสผ่านของคุณ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3FA170] focus:border-[#3FA170] transition text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="text-right mb-6">
                <Link href="/forget-password" className="text-sm text-[#2AA77A] hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full bg-[#3FA170] text-white py-3 rounded-md font-semibold hover:bg-[#2C714E] transition-colors duration-300"
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

