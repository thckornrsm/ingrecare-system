// src/components/HeroSection.js
import React from 'react';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        {/* ซ้าย: ข้อความ */}
        <div className="hero-left">
          <section className="hero-header">
            <h1>IngreCare - ระบบจัดการวัตถุดิบ</h1>
            <section className="hero-description">
              <p>ช่วยให้ร้านค้าของคุณจัดการกับวัตถุดิบหลังร้านได้สะดวกมากขึ้น</p>
              <p>ติดตามสถิติการใช้วัตถุดิบได้อย่างมีประสิทธิภาพ</p>
            </section>
          </section>
          <button className="cta-button">เริ่มเลย!</button>
        </div>

        {/* mockup */}
        <div className="hero-right">
          <img src="/pic/mockup.jpg" alt="mockup" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
