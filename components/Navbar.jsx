"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-none shadow-sm">
            <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
    
              <div className="flex items-center gap-3">
                <div>
                  <Image src="/logo.svg" alt="IngreCare Logo" width={24} height={24} />
                </div>
                <span className="font-semibold">IngreCare</span>
              </div>
    
              <nav className="hidden md:flex items-center gap-8 text-sm">
                <Link href="/homepage" className="hover:text-[#2AA77A]">หน้าแรก</Link>
                <Link href="/features" className="hover:text-[#2AA77A]">ฟีเจอร์ระบบ</Link>
                <Link href="/contact" className="hover:text-[#2AA77A]">ติดต่อฝ่ายขาย</Link>
              </nav>
              <Link
                href="/login"
                className="bg-[#3FA170] text-white w-[160px] h-[24px] rounded-[3px] border-none cursor-pointer font-kanit text-[16px] flex items-center justify-center hover:bg-[#2C714E] transition-colors duration-300"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </header>
  );
}

export default Navbar;
