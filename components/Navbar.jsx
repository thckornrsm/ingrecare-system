// components/Navbar.jsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-none shadow-sm">
      <div className="mx-auto max-w-7xl px-8 max-xl:px-16 h-16 flex items-center justify-between" /*mx-auto max-w-7xl px-8 max-xl:px-16 pb-4 pt-16 */>
        
        {/* Logo */}
        <Link href="/homepage" className="flex items-center gap-3">
          <div>
            <Image src="/logo.svg" alt="IngreCare Logo" width={24} height={24} />
          </div>
          <span className="font-semibold text-lg text-black">IngreCare</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/homepage" className="hover:text-[#3FA170] transition-colors">
            หน้าแรก
          </Link>
          <Link href="/features" className="hover:text-[#3FA170] transition-colors">
            ฟีเจอร์ระบบ
          </Link>
          <Link href="/contact" className="hover:text-[#3FA170] transition-colors">
            ติดต่อฝ่ายขาย
          </Link>
        </nav>

        {/* Desktop Login Button */}
        <Link
          href="/login"
          className="hidden md:flex bg-[#3FA170] text-white px-6 py-2 rounded-md border-none cursor-pointer font-kanit text-sm items-center justify-center hover:bg-[#2C714E] transition-colors duration-300"
        >
          เข้าสู่ระบบ
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            <Link
              href="/homepage"
              onClick={closeMenu}
              className="px-4 py-3 hover:bg-gray-50 rounded-md transition-colors text-gray-700 hover:text-[#2AA77A]"
            >
              หน้าแรก
            </Link>
            <Link
              href="/features"
              onClick={closeMenu}
              className="px-4 py-3 hover:bg-gray-50 rounded-md transition-colors text-gray-700 hover:text-[#2AA77A]"
            >
              ฟีเจอร์ระบบ
            </Link>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="px-4 py-3 hover:bg-gray-50 rounded-md transition-colors text-gray-700 hover:text-[#2AA77A]"
            >
              ติดต่อฝ่ายขาย
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="mx-4 mt-2 bg-[#3FA170] text-white py-3 rounded-md text-center hover:bg-[#2C714E] transition-colors duration-300"
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;