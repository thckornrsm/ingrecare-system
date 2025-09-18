import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function Hero() {
  return (
    <section id="hero-section" className="relative border-none">
        <Image src="../bg-herosection.svg" alt="Background" layout="fill" objectFit="cover" quality={100} className="z-0" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-top-30 grid md:grid-cols-2 items-center">
          <div>
            <h1 className="text-black md:text-5xl font-bold leading-tight">
              IngreCare  ระบบจัดการวัตถุดิบ
            </h1>
            <p className="mt-3 text-black md:text-2xl">
              ช่วยให้ร้านค้าของคุณจัดการรับวัตถุดิบหลังบ้านได้สะดวกมากขึ้น
              เป็นผู้ช่วยที่ใช้งานง่าย พร้อมด้วยบริการแสดงสถิติการใช้
            </p>
            <Link
              href="../contact"
              className="inline-block mt-6 rounded-md bg-[#2AA77A] px-6 py-2 text-white font-medium hover:brightness-110 transition"
            >
              เริ่มเลย!
            </Link>
          </div>

          {/* Right */}
          <div className="relative md:top-35 md:-mt-10 md:-ml-10">
            <Image src="../mockup01.svg" alt="Laptop Mockup" width={706} height={400} />
            {/* เงาโน้ตบุ๊ก */}
            <div className="mx-auto mt-6 h-3 w-3/4 rounded-full bg-black/10 blur-md" />
          </div>
        </div>
      </section>
  );
}

export default Hero;