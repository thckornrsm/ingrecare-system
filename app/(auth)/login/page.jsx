// app/(auth)/login/page.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Navbar from "@/components/Navbar"; // Assuming you have this component
import Footer from "@/components/Footer";   // Assuming you have this component

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', { // Your login API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Login successful, backend sets the cookie
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        // Handle errors
        const data = await res.json();
        setError(data.error || 'เกิดข้อผิดพลาดในการล็อกอิน');
      }
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              เข้าสู่ระบบ
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-base md:text-lg font-medium text-gray-700 mb-1"
                >
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมล (Email)"
                  required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน (Password)"
                    required
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
              <div className="text-right mb-6">
                <Link href="/forget-password" className="text-sm text-[#2AA77A] hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3FA170] text-white rounded-md py-2 text-base md:text-lg font-semibold hover:bg-[#2C714E] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

