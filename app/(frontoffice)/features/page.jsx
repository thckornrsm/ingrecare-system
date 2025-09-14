import React from "react";
import Image from "next/image";
import { Icon } from '@iconify/react';


export default function Home() {
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

      {/* Tell the Features */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-black text-2xl md:text-4xl font-semibold">ฟีเจอร์ระบบ</h2>
          <p className="mt-2 text-gray-600">เราเป็นตัวช่วยธุรกิจร้านอาหารที่มีการนำเข้าวัตถุดิบหลากหลายประเภท ช่วยจัดการหลังบ้านได้อย่างสะดวกและง่ายดาย</p>
          <p className="mt-1 text-gray-600">แสดงข้อมูลของวัตถุดิบที่ใกล้หมดอายุ และคำนวณสถิติการใช้วัตถุดิบให้คุณเพื่อการตัดสินใจได้</p>

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

          </div>
        </div>
      </section>

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