// app/(frontoffice)/features/page.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      className={`group flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
        <Icon icon={icon} className="w-8 h-8 text-white" />
      </div>
      <div className="text-left flex-1">
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-emerald-300 transition-colors">{title}</h3>
        <ul className="text-sm text-gray-300 space-y-1.5">
          {lines.map((line, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-emerald-400 mr-2 mt-0.5">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const features = [
    {
      icon: "ix:user-profile",
      title: "เข้าสู่ระบบ (Login Module)",
      lines: [
        "สำหรับการควบคุมสิทธิ์การเข้าใช้งาน",
        "ป้องกันข้อมูลรั่วไหล",
      ],
    },
    {
      icon: "icon-park-outline:inbox-in",
      title: "นำเข้าข้อมูลวัตถุดิบ (Stock In)",
      lines: [
        "บันทึกเมื่อมีการนำเข้าวัตถุดิบใหม่",
        "ระบบแยกประเภทอันที่นำเข้าและจัดเก็บ",
        "พร้อมแสดงวันหมดอายุ",
      ],
    },
    {
      icon: "icon-park-outline:inbox-out",
      title: "เบิกวัตถุดิบ (Stock Out)",
      lines: [
        "ใช้เมื่อมีการนำวัตถุดิบไปใช้งาน",
        "ระบบจะคำนวณและอัปเดตวัตถุดิบ",
        "คงเหลืออัตโนมัติ",
      ],
    },
    {
      icon: "pajamas:time-out",
      title: "จัดการวัตถุดิบหมดอายุ (Expired)",
      lines: [
        "ระบบตรวจสอบวันหมดอายุของวัตถุดิบ",
        "แยกวัตถุดิบออกจากคลังสินค้า",
        "เพื่อไม่ให้ใช้งานผิดพลาด",
      ],
    },
    {
      icon: "akar-icons:statistic-up",
      title: "แสดงสถิติเพื่อการตัดสินใจ (Statistics Module)",
      lines: [
        "วิเคราะห์ข้อมูลการเบิกใช้วัตถุดิบ",
        "แสดงรายการวัตถุดิบที่ใช้งานบ่อย",
      ],
    },
    {
      icon: "icons8:box",
      title: "ภาพรวมคลังวัตถุดิบ (Ingredient)",
      lines: [
        "แสดงรายการข้อมูลวัตถุดิบทั้งหมด",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#0F2B46]">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3FA170]/10 via-white to-teal-50 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="features-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#10b981" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#features-grid)"/>
          </svg>
        </div>

        {/* Floating Feature BG*/}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] animate-float">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Icon icon="icon-park-outline:inbox-in" className="w-8 h-8 text-emerald-600/50" />
            </div>
          </div>
          <div className="absolute top-32 right-[15%] animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Icon icon="akar-icons:statistic-up" className="w-10 h-10 text-teal-600/50" />
            </div>
          </div>
          <div className="absolute bottom-32 left-[20%] animate-float" style={{ animationDelay: '2s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Icon icon="icons8:box" className="w-7 h-7 text-cyan-600/50" />
            </div>
          </div>
          <div className="absolute bottom-40 right-[12%] animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Icon icon="icon-park-outline:inbox-out" className="w-6 h-6 text-emerald-600/50" />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 hover:shadow-md transition-shadow">
            <div className="w-2 h-2 bg-[#3FA170] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">ฟังก์ชันครบครัน</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ฟีเจอร์<span className="bg-gradient-to-r from-[#3FA170] to-[#48A78D] bg-clip-text text-transparent">ระบบ</span>
          </h1>

          <div className="space-y-4 mb-10 max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              เบื่อกับการจดบันทึกวัตถุดิบที่ยุ่งยาก หรือพลาดวันหมดอายุอยู่รึเปล่า<br/>
              เราช่วยเปลี่ยนความวุ่นวายนี้ให้เป็นระบบที่ราบรื่นได้ แค่คุณเปิดดูก็รู้ทุกอย่าง !
            </p>
          </div>

          {/* Feature Highlights with Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            
            <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#3FA170] to-[#48A78D] rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icon icon="mdi:speedometer" className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">เร็ว</div>
              <div className="text-xs text-gray-600">ทำงานเรียลไทม์</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#3FA170] to-[#48A78D] rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icon icon="mdi:hand-heart" className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">ง่าย</div>
              <div className="text-xs text-gray-600">ใช้งานสะดวก</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#3FA170] to-[#48A78D] rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Icon icon="mdi:chart-line" className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">ชาญฉลาด</div>
              <div className="text-xs text-gray-600">วิเคราะห์ข้อมูล</div>
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
        `}</style>
      </section>

      {/* Intro Section */}
      <section className="pt-30 pb-20 max-md:pb-20 bg-white text-white animate-fade-in duration-1000">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            แล้วทำไมต้องเลือก<br/>
            <span className="relative inline-block group cursor-pointer mx-3 mt-4">
              <span className="text-4xl md:text-5xl bg-gradient-to-r from-[#3FA170] to-[#48A78D] bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110">
                {" "}IngreCare !
              </span>
              {/* ประกายรูปดาว 4 แฉก */}
              <span className="absolute -top-5 -right-2 w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:animate-ping">
          <span className="absolute inset-0 bg-yellow-400 rotate-0" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></span>
              </span>
              <span className="absolute -top-5 left-1/4 w-2.5 h-2.5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{animationDelay: '0.2s'}}>
          <span className="absolute inset-0 bg-emerald-400 rotate-0" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></span>
              </span>
              <span className="absolute -bottom-5 -left-2 w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{animationDelay: '0.3s'}}>
                <span className="absolute inset-0 bg-teal-400 rotate-0" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></span>
              </span>
              <span className="absolute -bottom-5 right-1/3 w-2.5 h-2.5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{animationDelay: '0.5s'}}>
          <span className="absolute inset-0 bg-yellow-300 rotate-0" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></span>
              </span>

              {/* ประกายรูปเพชร */}
              <span className="absolute top-1/2 -left-5 w-2 h-2 bg-green-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse rotate-45" style={{animationDelay: '0.1s'}}></span>
              <span className="absolute top-1/2 -right-5 w-2 h-2 bg-yellow-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse rotate-45" style={{animationDelay: '0.4s'}}></span>

              {/* จุดประกายเล็กๆ วงกลม */}
              <span className="absolute -top-3 left-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{animationDelay: '0.15s'}}></span>
              <span className="absolute bottom-0 left-1/4 w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{animationDelay: '0.35s'}}></span>
              <span className="absolute top-0 right-1/4 w-1 h-1 bg-teal-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{animationDelay: '0.25s'}}></span>
            </span>
          </p>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="pb-20 pt-10 bg-gradient-to-b from-teal/90 via-white to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                lines={feature.lines}
                index={index}
              />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div 
              className="bg-gradient-to-r from-[#3FA170] to-[#48A78D] rounded-3xl p-12 shadow-2xl relative overflow-hidden group cursor-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
              }}
            >
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.07), transparent 40%)'
                }}
              />
              
              {/* Animated shimmer line */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.24), transparent 30%)',
                  filter: 'blur(20px)'
                }}
              />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  พร้อมที่จะเริ่มต้นแล้วหรือยัง?
                </h2>
                <p className="text-gray-100 text-lg mb-8 max-w-2xl mx-auto">
                  ลองใช้งานวันนี้ ดูว่าระบบของเราจะช่วยให้ธุรกิจของคุณมีประสิทธิภาพมากขึ้นได้แค่ไหน!
                </p>
                <div className="flex flex-col sm:flex-row justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#3FA170] text-lg font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <span>เริ่มต้นใช้งาน</span>
                    <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}