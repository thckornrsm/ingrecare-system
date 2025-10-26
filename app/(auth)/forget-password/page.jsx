// app/(auth)/forget-password/page.jsx
'use client';

import React, { useState } from 'react'; // 1. import useState
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
    // 2. สร้าง state สำหรับเก็บค่าอีเมล, loading, และข้อความตอบกลับ
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 3. สร้างฟังก์ชันสำหรับจัดการการ submit ฟอร์ม
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันหน้าเว็บโหลดใหม่
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดบางอย่าง');
            }

            setMessage(data.message);
            setEmail(''); // ล้างค่าในฟอร์มหลังส่งสำเร็จ

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-800 ">
            <Navbar />
            <main className="w-full flex-grow flex flex-col md:flex-row">
                
                <div className="hidden md:flex flex-1 relative">
                    <Image
                        src="/background login.svg"
                        alt="Forgot Password Background"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                    />
                </div>

                <div className="w-full md:w-[640px] md:h-[800px] md:flex-shrink-0 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
                    <div className="w-full max-w-md">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                            ลืมรหัสผ่าน
                        </h1>
                        <p className="text-gray-600 mt-2 mb-6">
                            กรุณากรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
                        </p>
                        
                        {/* 4. เชื่อมฟอร์มกับฟังก์ชัน handleSubmit */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-base md:text-lg font-medium text-gray-700 mb-1">
                                    อีเมล (Email)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="example@company.com"
                                    required // เพิ่ม required เพื่อบังคับกรอก
                                    value={email} // 5. เชื่อม input กับ state
                                    onChange={(e) => setEmail(e.target.value)} // 5. อัปเดต state เมื่อผู้ใช้พิมพ์
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3FA170] focus:border-[#3FA170] transition text-black"
                                />
                            </div>
                            
                            {/* 6. แสดงข้อความตอบกลับจาก API */}
                            {message && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{message}</p>}
                            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                            
                            <button
                                type="submit"
                                disabled={isLoading} // 7. ปิดการใช้งานปุ่มตอนกำลังโหลด
                                className="w-full bg-[#3FA170] text-white py-3 rounded-md font-semibold hover:bg-[#2C714E] transition-colors duration-300 mb-4 disabled:bg-gray-400"
                            >
                                {isLoading ? 'กำลังส่ง...' : 'ยืนยัน'}
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