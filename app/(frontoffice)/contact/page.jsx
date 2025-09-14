"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Icon } from '@iconify/react';

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would handle form submission here (e.g., send data to an API)
    // For this example, we'll just simulate a successful submission after a short delay.
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-white text-[#0F2B46]">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-none shadow-sm">
            <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div>
                  <Image src="../logo.svg" alt="IngreCare Logo" width={24} height={24} />
                </div>
                <span className="font-semibold">IngreCare</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm">
                  <a href="../homepage" className="hover:text-[#2AA77A]">หน้าแรก</a>
                  <a href="../features" className="hover:text-[#2AA77A]">ฟีเจอร์ระบบ</a>
                  <a href="../contact" className="hover:text-[#2AA77A]">ติดต่อฝ่ายขาย</a>
                </nav>
                <a
                  href="../login"
                  className="bg-[#3FA170] text-white w-[160px] h-[24px] rounded-[3px] border-none cursor-pointer font-kanit text-[16px] flex items-center justify-center hover:bg-[#2C714E] transition-colors duration-300"
                >
                  เข้าสู่ระบบ
                </a>
            </div>
        </header>
        {/* Main Content */}
        <main className="min-h-screen bg-white text-[#0F2B46] py-12 flex flex-col items-center bg-gradient-to-t from-[#3FA170] to-[#F7FAFC] text-white">
          <h1 className="text-black text-3xl font-bold text-center  mb-8">ติดต่อฝ่ายขาย</h1>
          <div className="w-full max-w-4xl rounded-lg shadow-lg p-8 md:p-12 text-gray-800 bg-white">
            {isSubmitted ? (
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-[#E9F4E9] border border-[#6CCF74]">
                <Icon icon="mdi:check-circle-outline" className="text-[#3FA170] w-6 h-6" />
                <span className="text-sm font-semibold text-[#0F2B46]">ส่งข้อมูลสำเร็จ</span>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="companyName" className="block text-gray-700 mb-1">
                      ชื่อร้านค้า (Company Name)
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      placeholder="Enter Company Name"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">
                      อีเมล (Email)
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter Company Email"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Company Phone"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="address" className="block text-gray-700 mb-1">
                      ที่อยู่ (Address)
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder="Company Address"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-gray-700 mb-1">
                      จังหวัด
                    </label>
                    <input
                      type="text"
                      id="province"
                      placeholder="Province"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-gray-700 mb-1">
                      อำเภอ
                    </label>
                    <input
                      type="text"
                      id="district"
                      placeholder="District"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="subdistrict" className="block text-gray-700 mb-1">
                      ตำบล
                    </label>
                    <input
                      type="text"
                      id="subdistrict"
                      placeholder="District"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipcode" className="block text-gray-700 mb-1">
                      รหัสไปรษณีย์
                    </label>
                    <input
                      type="text"
                      id="zipcode"
                      placeholder="Zipcode"
                      className="w-full p-3 bg-[#F8FAFB] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#3FA170]"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="form-checkbox h-4 w-4 text-green-600 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    ฉันยอมรับข้อตกลงในการใช้งานและ <a href="#" className="text-green-600 hover:underline">นโยบายความเป็นส่วนตัว</a>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#9FD0B8] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#3FA170] transition duration-300"
                >
                  ให้เจ้าหน้าที่ติดต่อกลับ
                </button>
              </form>
            )}
          </div>
        </main>
        {/* Footer */}
        <footer id="contact" className="border-n shadow-md bg-[#F7FAFC]">
          <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Image src="../logo.svg" alt="Logo" width={58} height={58} />
              <div>
                <div className="text-4xl font-semibold">IngreCare</div>
                <div className="text-m text-[#6B8AA3]">ระบบจัดการวัตถุดิบ</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between w-full max-w-sm mx-auto p-4 md:p-6">
              <div className="flex flex-col mb-4 md:mb-0">
              <ul className="list-none p-0 m-0 text-gray-700">
                <li>ทัชชกร รษามณีโชค</li>
                <li>กุลธิดา กิจจาดำรงสุข</li>
                <li>ณัฐมน เหล่าพราหมณ์</li>
              </ul>
            </div>
            <div className="flex flex-col md:items-end">
              <h3 className="text-xl font-bold mb-2 md:hidden">อีเมล</h3>
              <ul className="list-none p-0 m-0 text-blue-600">
                <li>
                  <a href="mailto:thatchakorn.r@ku.th">thatchakorn.r@ku.th</a>
                </li>
                <li>
                  <a href="mailto:sornchanok.v@ku.th">sornchanok.v@ku.th</a>
                </li>
                <li>
                  <a href="mailto:nattamon.la@ku.th">nattamon.la@ku.th</a>
                </li>
              </ul>
              </div>
            </div>
          </div>
          <div className="bg-[#3FA170] text-center text-sm text-[#6B8AA3] py-4"></div>
        </footer>
    </main>
    
  );
}