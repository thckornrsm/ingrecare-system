"use client";
import React, { useState } from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <Navbar />
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
                    className="form-checkbox h-4 w-4 text-[#3FA170] border-[#3FA170] focus:ring-[#3FA170] rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    ฉันยอมรับข้อตกลงในการใช้งานและ <a href="#" className="text-[#3FA170] hover:underline">นโยบายความเป็นส่วนตัว</a>
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
        <Footer />
    </main>
    
  );
}