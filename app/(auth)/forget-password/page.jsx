// app/(auth)/forgot-password/page.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

// ========= Header Component (ใช้ร่วมกับหน้า Login) =========
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

// ========= Footer Component (ใช้ร่วมกับหน้า Login) =========
const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/logo.svg" alt="IngreCare Logo" width={32} height={32} />
            <span className="font-bold text-lg text-gray-800">IngreCare</span>
          </div>
          <p>ระบบบริการวัตถุดิบ</p>
        </div>
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-gray-800 mb-2">ผู้ดูแลระบบ</h3>
          <ul>
            <li>คุณกร วิชานันท์</li>
            <li>คุณโสภณัฐ กิจดำรงค์ธรรม</li>
            <li>คุณปุญญ์ เพชรพลอย</li>
          </ul>
        </div>
        <div className="text-center md:text-left">
            <h3 className="font-semibold text-gray-800 mb-2 invisible">Contact</h3>
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


// ========= Main Forgot Password Page Component =========
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-800 font-sans">
      <Header />

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
