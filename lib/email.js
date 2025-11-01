// app/reset-password/page.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
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
        console.log('Token from URL:', tokenFromUrl);
        
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('ไม่พบ Token สำหรับการรีเซ็ตรหัสผ่าน');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!password || password.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
            return;
        }
        
        if (!token) {
            setError('Token ไม่ถูกต้อง กรุณาทำรายการใหม่อีกครั้ง');
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
                throw new Error(data.error || data.message || 'เกิดข้อผิดพลาดบางอย่าง');
            }
            
            setMessage(data.message || 'เปลี่ยนรหัสผ่านสำเร็จ กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
            
            // Redirect หลัง 3 วินาที
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full md:w-160 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 max-md:py-28">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3FA170] rounded-full mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        ตั้งรหัสผ่านใหม่
                    </h1>
                    <p className="text-gray-600 mt-2">
                        กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                            รหัสผ่านใหม่
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FA170] focus:border-transparent transition text-gray-900"
                                disabled={isLoading || !!message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-base md:text-lg font-medium text-gray-700 mb-2">
                            ยืนยันรหัสผ่านใหม่
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FA170] focus:border-transparent transition text-gray-900"
                                disabled={isLoading || !!message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {message && (
                        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-green-800 text-sm">{message}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !!message || !token}
                        className="w-full bg-[#3FA170] text-white py-3 rounded-lg font-semibold hover:bg-[#2C714E] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            'บันทึกรหัสผ่านใหม่'
                        )}
                    </button>

                    {/* Back to Login Link */}
                    {message && (
                        <Link
                            href="/login"
                            className="w-full block text-center py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-300"
                        >
                            ไปที่หน้าเข้าสู่ระบบ
                        </Link>
                    )}
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        จำรหัสผ่านได้แล้ว?{' '}
                        <Link href="/login" className="text-[#3FA170] font-semibold hover:underline">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Loading Component
const LoadingFallback = () => (
    <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#3FA170]"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
    </div>
);

// Main Component
export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-800">
            <Navbar />
            <main className="w-full flex-grow flex flex-col md:flex-row">
                {/* Background Image - Desktop Only */}
                <div className="hidden md:flex flex-1 relative">
                    <Image
                        src="/background login.svg"
                        alt="Reset Password Background"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                    />
                </div>
                
                {/* Form Section */}
                <Suspense fallback={<LoadingFallback />}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}