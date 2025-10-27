// app/(frontoffice)/homepage/page.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Hero() {
  return (
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="#10b981" opacity="0.3"/>
            </pattern>
            <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#14b8a6" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      {/* Gradient Shapes */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-8 max-xl:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-2 hover:shadow-md transition-shadow">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">ระบบจัดการที่ครบครัน</span>
          </div>

          <h1 className="text-gray-900">
            <span className="block text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              IngreCare
            </span>
            <span className="block mt-2 text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800">
              ระบบจัดการวัตถุดิบ
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
            ช่วยให้ร้านค้าของคุณจัดการรับวัตถุดิบหลังบ้านได้สะดวกมากขึ้น<br/>
            เป็นผู้ช่วยที่ใช้งานง่าย พร้อมด้วยบริการแสดงสถิติการใช้
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="../contact"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3FA170] to-[#48A78D] text-white text-lg font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>เริ่มต้นใช้งาน</span>
              <Icon icon="mdi:arrow-right" className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              href="../features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
            >
              <span>เรียนรู้เพิ่มเติม</span>
            </Link>
          </div>
        </div>

        {/* Right Side - Mockup */}
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-2xl"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-3xl blur-2xl"></div>

          {/* Floating Stats Cards */}
          <div className="absolute -left-8 top-1/4 bg-white rounded-2xl shadow-xl p-4 animate-float-slow z-20 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-[#48A78D] rounded-lg flex items-center justify-center">
                <Icon icon="mdi:check-circle" className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">วัตถุดิบ</div>
                <div className="text-lg font-bold text-gray-900">156 รายการ</div>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 top-1/3 bg-white rounded-2xl shadow-xl p-4 animate-float-slow z-20 hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E15050]/80 to-[#E15050] rounded-lg flex items-center justify-center">
                <Icon icon="mdi:alert-circle" className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">ใกล้หมดอายุ</div>
                <div className="text-lg font-bold text-gray-900">8 รายการ</div>
              </div>
            </div>
          </div>

          <div className="absolute -left-6 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 animate-float-slow z-20 hidden lg:block" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:chart-areaspline" className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">เบิกจ่ายมากที่สุด</div>
                <div className="text-lg font-bold text-emerald-600">+18%</div>
              </div>
            </div>
          </div>

          {/* Main Mockup */}
          <div className="relative perspective-1000">
            <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-3xl shadow-2xl p-3 transform hover:rotate-y-2 transition-all duration-700 preserve-3d">
              {/* Laptop Top Bar */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-700 rounded-b-lg"></div>
              
              {/* Screen */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-inner">
                {/* Browser Chrome */}
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#E15050]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F9BF22]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#3FA170]"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 flex items-center gap-2">
                    <Icon icon="mdi:lock" className="w-3 h-3 text-gray-400" />
                    <span>IngreCare</span>
                  </div>
                </div>

                {/* Screen Content */}
                <div className="relative">
                  <Image 
                    src="../mockup01.svg" //picture here kub
                    alt="IngreCare Dashboard" 
                    width={706} 
                    height={400} 
                    className="w-full h-auto"
                  />
                  {/* Overlay Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Laptop Base */}
            <div className="relative h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-3xl shadow-xl transform scale-x-110"></div>
            
            {/* Laptop Shadow */}
            <div className="mx-auto mt-4 h-3 w-4/5 rounded-full bg-gradient-to-r from-transparent via-black/20 to-transparent blur-lg"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .hover\:rotate-y-2:hover {
          transform: rotateY(-2deg) rotateX(2deg);
        }
      `}</style>
    </section>
  );
}

// FeatureCard component with scroll animation
function FeatureCard({ title, lines, icon, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center p-8 rounded-lg text-white text-center shadow-lg transform transition-all duration-500 ease-out overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ 
        background: "linear-gradient(180deg, #3FA170 0%, #48A78D 100%)",
        transitionDelay: `${index * 150}ms`
      }}
    >
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-12 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4">
          <Icon icon={icon} className="w-16 h-16" />
        </div>
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        <div className="text-sm space-y-1">
          {lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0F2B46]">
      <Navbar />
      
      <Hero />

      {/* Intro Section */}
      <section className="py-48 max-md:pb-20 max-md:pt-32 bg-white text-white animate-fade-in duration-1000">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            <span
              className="relative cursor-default overflow-hidden"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.classList.add('active');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove('active');
              }}
            >
              <span className="bg-gradient-to-r from-[#3FA170]/40 to-[#48A78D] bg-clip-text text-transparent">"ครบ จบ ที่เดียว"</span>
              <span className="absolute top-0 left-0 w-20 h-20 bg-white/60 rounded-full blur-xl pointer-events-none opacity-0 transition-opacity duration-100" 
                style={{
                  left: 'var(--mouse-x, 0)',
                  top: 'var(--mouse-y, 0)',
                  transform: 'translate(-50%, -50%)'
                }}
              ></span>
            </span> กับ IngreCare
          </p>
          <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            เพราะเราเข้าใจความยุ่งยากในการจัดการวัตถุดิบ
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-10">
            ไม่ว่าคุณจะเป็นร้านอาหารขนาดเล็กหรือใหญ่ IngreCare ช่วยให้การจัดการวัตถุดิบเป็นเรื่องง่าย<br/>
            ลดความซับซ้อน เพิ่มประสิทธิภาพ และช่วยให้คุณมุ่งเน้นที่การสร้างสรรค์เมนูอร่อยๆ ได้มากขึ้น
          </p>
        </div>
              
        <style jsx>{`
          .active span:last-child {
            opacity: 1 !important;
          }
        `}</style>
      </section>

      {/* Why IngreCare? */}
      <section id="features" className="pb-32 max-sm:pb-10 max-sm:pt-18">
        <div className="mx-auto max-w-7xl px-8 max-xl:px-16 py-4">
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon="mage:lock-fill"
              title="ปลอดภัยและใช้งานง่าย"
              lines={[
                "กำหนดสิทธิ์การเข้าถึงข้อมูลป้องกันข้อมูลรั่วไหล",
                "ให้คุณมั่นใจในความปลอดภัยทุกครั้งที่ใช้งาน",
              ]}
              index={0}
            />

            <FeatureCard
              icon="el:idea"
              title="จัดการวัตถุดิบอย่างแม่นยำ"
              lines={[
                "พร้อมเครื่องมือบันทึก/ปรับยอดแบบละเอียด",
                "ช่วยป้องกันของขาด/ของเสีย ด้วยการเตือนอัตโนมัติ",
              ]}
              index={1}
            />

            <FeatureCard
              icon="tdesign:file-add-filled"
              title="นับวัตถุดิบแบบ Realtime"
              lines={[
                "สต๊อกอัปเดตทันทีที่รับเข้า/เบิกออก",
                "รองรับบาร์โค้ด/QR เพื่อความรวดเร็ว",
              ]}
              index={2}
            />

            <FeatureCard
              icon="icomoon-free:stats-bars"
              title="ดูสถิติการใช้วัตถุดิบได้"
              lines={[
                "ดูแนวโน้มการใช้/การสั่งซื้อเพื่อวางแผน",
                "ควบคุมต้นทุนและลดของเสียได้ดีขึ้น",
              ]}
              index={3}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}