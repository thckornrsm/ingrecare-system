// app/reset-password/page.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        console.log('Token from URL:', tokenFromUrl); // Debug log
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setError(''); // ล้าง error ถ้ามี token
        } else {
            setError('ไม่พบ Token สำหรับการรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์จากอีเมลอีกครั้ง');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ตรวจสอบ token ก่อน
        if (!token) {
            setError('ไม่พบ Token กรุณาคลิกลิงก์จากอีเมลอีกครั้ง');
            return;
        }
        
        // ตรวจสอบรหัสผ่าน
        if (password.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาดบางอย่าง');
            }
            
            setMessage(data.message + ' กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
            
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full md:w-160 md:h-229 md:flex-shrink-0 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 max-md:py-28">
            <div className="w-full max-w-md">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    ตั้งรหัสผ่านใหม่
                </h1>
                <p className="text-gray-600 mt-2 mb-6">
                    กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
                </p>
                
                {/* Debug Info - ลบออกหลัง deploy */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
                        <p><strong>Debug:</strong></p>
                        <p>Token: {token || 'ไม่มี'}</p>
                        <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-base md:text-lg font-medium text-gray-700 mb-1">
                            รหัสผ่านใหม่ (New Password)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-[#3FA170] focus:border-[#3FA170] transition text-black"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-base md:text-lg font-medium text-gray-700 mb-1">
                            ยืนยันรหัสผ่านใหม่ (Confirm Password)
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-[#3FA170] focus:border-[#3FA170] transition text-black"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {message && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{message}</p>}
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading || !!message}
                        className="w-full bg-[#3FA170] text-white py-3 rounded-md font-semibold hover:bg-[#2C714E] transition-colors duration-300 mb-4 disabled:bg-gray-400"
                    >
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                    </button>
                    
                    {message && (
                        <Link
                            href="/login"
                            className="w-full block text-center py-3 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-300"
                        >
                            ไปที่หน้าเข้าสู่ระบบ
                        </Link>
                    )}
                </form>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-800">
            <Navbar />
            <main className="w-full flex-grow flex flex-col md:flex-row justify-center">
                <div className="hidden md:flex flex-1 relative">
                    <Image
                        src="/background login.svg"
                        alt="Reset Password Background"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                    />
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}