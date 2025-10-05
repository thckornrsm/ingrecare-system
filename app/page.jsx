"use client";

import React from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

// FeatureCard component
function FeatureCard({ title, lines, icon }) {
  return (
    <div
      className="relative flex flex-col items-center p-8 rounded-lg text-white text-center shadow-lg transform hover:scale-101 transition-transform duration-300 ease-in-out overflow-hidden"
      style={{ background: "linear-gradient(180deg, #3FA170 0%, #48A78D 100%)" }}
    >
      {/* Dark overlay that is NOT on top of the text */}
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-12 transition-opacity duration-300"></div>
    
      {/* This new div holds ALL the content and must be above the overlay */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4">
          <Icon icon={icon} className="w-16 h-16" />
        </div>
        <h3 className="text-3xl font-bold mb-2">{title}</h3>
        <div className="text-sm space-y-1">
          {lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0F2B46]">
      <Navbar />
      <Hero />
      {/* Why IngreCare? */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl md:text-4xl font-extrabold">
            <span className="text-black font-normal">ทำไมต้องใช้ </span>
            <span className="text-black font-semibold">IngreCare ?</span>
          </h2>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon="mage:lock-fill"
              title="ปลอดภัยและใช้งานง่าย"
              lines={[
                "กำหนดสิทธิ์การเข้าถึงข้อมูลป้องกันข้อมูลรั่วไหล",
                "ให้คุณมั่นใจในความปลอดภัยทุกครั้งที่ใช้งาน",
              ]}
            >
              {/* padlock */}
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" strokeWidth="2"/>
                <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </FeatureCard>

            <FeatureCard
              icon="el:idea"
              title="จัดการวัตถุดิบอย่างแม่นยำ"
              lines={[
                "พร้อมเครื่องมือบันทึก/ปรับยอดแบบละเอียด",
                "ช่วยป้องกันของขาด/ของเสีย ด้วยการเตือนอัตโนมัติ",
              ]}
            >
              {/* bulb */}
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M9 18h6M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </FeatureCard>

            <FeatureCard
              icon="tdesign:file-add-filled"
              title="นับวัตถุดิบแบบ Realtime"
              lines={[
                "สต๊อกอัปเดตทันทีที่รับเข้า/เบิกออก",
                "รองรับบาร์โค้ด/QR เพื่อความรวดเร็ว",
              ]}
            >
              {/* document */}
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </FeatureCard>

            <FeatureCard
              icon="icomoon-free:stats-bars"
              title="ดูสถิติการใช้วัตถุดิบได้"
              lines={[
                "ดูแนวโน้มการใช้/การสั่งซื้อเพื่อวางแผน",
                "ควบคุมต้นทุนและลดของเสียได้ดีขึ้น",
              ]}
            >
              {/* chart */}
              <svg viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M4 19V5M4 19h16M8 16v-5M12 19v-9M16 13V7" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </FeatureCard>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

