import React from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0F2B46]">
      <Navbar />
      {/* Tell the Features */}
      <section id="features" className="py-18">
        <div className="mx-40 max-md:mx-20 px-4 ">
          <h2 className="text-black text-2xl md:text-4xl font-semibold text-center">ฟีเจอร์ระบบ</h2>
          <p className="mt-2 text-gray-600 text-center">เราเป็นตัวช่วยธุรกิจร้านอาหารที่มีการนำเข้าวัตถุดิบหลากหลายประเภท ช่วยจัดการหลังบ้านได้อย่างสะดวกและง่ายดาย</p>
          <p className="mt-1 text-gray-600 text-center">แสดงข้อมูลของวัตถุดิบที่ใกล้หมดอายุ และคำนวณสถิติการใช้วัตถุดิบให้คุณเพื่อการตัดสินใจได้</p>

          <div className="mt-8 flex flex-col items-center">
            <div className="w-full max-w-5xl bg-black p-8 md:p-15 rounded-lg items-center">
              <div className="grid md:grid-cols-2 gap-8">
                <FeatureCard
                  icon="ix:user-profile"
                  title="เข้าสู่ระบบ (Login Module)"
                  lines={[
                    "สำหรับการควบคุมสิทธิ์การเข้าใช้งาน",
                    "ป้องกันข้อมูลรั่วไหล",
                  ]}
                />
                <FeatureCard
                  icon="icon-park-outline:inbox-in"
                  title="นำเข้าข้อมูลวัตถุดิบ (Stock In)"
                  lines={[
                    "บันทึกเมื่อมีการนำเข้าวัตถุดิบใหม่",
                    "ระบบแยกประเภทอันที่นำเข้าและจัดเก็บ",
                    "พร้อมแสดงวันหมดอายุ",
                  ]}
                />
                <FeatureCard
                  icon="icon-park-outline:inbox-out"
                  title="เบิกวัตถุดิบ (Stock Out)"
                  lines={[
                    "ใช้เมื่อมีการนำวัตถุดิบไปใช้งาน",
                    "ระบบจะคำนวณและอัปเดตวัตถุดิบ",
                    "คงเหลืออัตโนมัติ",
                  ]}
                />
                <FeatureCard
                  icon="pajamas:time-out"
                  title="จัดการวัตถุดิบหมดอายุ (Expired)"
                  lines={[
                    "ระบบตรวจสอบวันหมดอายุของวัตถุดิบ",
                    "แยกวัตถุดิบออกจากคลังสินค้า",
                    "เพื่อไม่ให้ใช้งานผิดพลาด",
                  ]}
                />
                <FeatureCard
                  icon="akar-icons:statistic-up"
                  title="แสดงสถิติเพื่อการตัดสินใจ (Statistics Module)"
                  lines={[
                    "วิเคราะห์ข้อมูลการเบิกใช้วัตถุดิบ",
                    "แสดงรายการวัตถุดิบที่ใช้งานบ่อย",
                  ]}
                />
                <FeatureCard
                  icon="icons8:box"
                  title="ภาพรวมคลังวัตถุดิบ (Ingredient)"
                  lines={[
                    "แสดงรายการข้อมูลวัตถุดิบทั้งหมด",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function FeatureCard({ title, lines, icon }) {
  return (
    <div className="flex items-start space-x-4 text-white">
      <div className="w-25 h-25 flex-shrink-0 flex items-center justify-center rounded-full bg-white">
        <Icon icon={icon} className="w-16 h-16 text-[#3FA170]" />
      </div>
      <div className="text-left">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <ul className="text-sm list-disc list-inside space-y-1">
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}