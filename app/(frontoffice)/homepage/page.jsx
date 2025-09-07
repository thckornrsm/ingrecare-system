"use client";

import React from "react";
import { Icon } from "@iconify/react";

export default function HomePage() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">IngreCare</div>
        <div className="navbar-links">
          <a href="#features">คุณสมบัติ</a>
          <a href="#pricing">แพ็กเกจ</a>
          <a href="#contact">ติดต่อ</a>
          <button className="login-button">เข้าสู่ระบบ</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-header">
              <h1>จัดการวัตถุดิบให้เป็นเรื่องง่าย</h1>
              <p>ระบบติดตามวัตถุดิบ ครบ จบ ในที่เดียว</p>
            </div>
            <button className="cta-button">เริ่มต้นใช้งาน</button>
          </div>

          <div className="hero-right">
            {/* ใช้รูปของคุณเองแทน /pic/hero.png */}
            <img src="/pic/hero.png" alt="IngreCare hero" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="reasonwhy">
          <h2>ทำไมต้อง </h2>
          <span>IngreCare?</span>
        </div>

        <section className="features-list">
          <div className="feature">
            <Icon icon="mage:lock-fill" width="88" height="88" />
            <div className="content">
              <h3>ปลอดภัยและใช้งานง่าย</h3>
              <p>กำหนดสิทธิ์การเข้าถึงข้อมูลได้ ป้องกันข้อมูลรั่วไหล</p>
              <p>ให้คุณมั่นใจในความปลอดภัยทุกครั้งที่ใช้งาน</p>
            </div>
          </div>

          <div className="feature">
            <Icon icon="el:idea" width="88" height="88" />
            <div className="content">
              <h3>จัดการวัตถุดิบอย่างแม่นยำ</h3>
              <p>เพียงแค่กรอกข้อมูล ระบบจะช่วยแยกประเภทและจัดการวันหมดอายุให้อัตโนมัติ</p>
              <p>ช่วยคุณติดตามการใช้และจัดการได้อย่างมืออาชีพ</p>
            </div>
          </div>

          <div className="feature">
            <Icon icon="tdesign:file-add-filled" width="88" height="88" />
            <div className="content">
              <h3>เบิกวัตถุดิบแบบ Realtime</h3>
              <p>การเบิกวัตถุดิบง่ายสุด ๆ แค่เลือกชนิดและจำนวน ระบบจะอัปเดตข้อมูลให้ทันที</p>
              <p>พร้อมแสดงปริมาณที่เหลือเพื่อให้คุณวางแผนการใช้งานได้ดียิ่งขึ้น</p>
            </div>
          </div>

          <div className="feature">
            <Icon icon="icomoon-free:stats-bars" width="88" height="88" />
            <div className="content">
              <h3>ดูสถิติการใช้งานได้</h3>
              <p>คุณจะรู้ว่าวัตถุดิบใดที่ถูกใช้มากที่สุด ช่วยให้คุณสามารถตัดสินใจ</p>
              <p>นำเข้าวัตถุดิบในรอบถัดไปได้อย่างมีประสิทธิภาพ</p>
            </div>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="logo-section">
          {/* แทนที่โลโก้ด้วยรูปจริงตามโปรเจกต์ของคุณ */}
          <img src="/pic/logo.svg" alt="IngreCare logo" />
          <div style={{ marginLeft: 8 }}>
            <h4>IngreCare</h4>
            <p>จัดการวัตถุดิบ ครบ จบ ในที่เดียว</p>
          </div>
        </div>

        <div className="team">
          <p>ทีมพัฒนา</p>
          <div className="admin">
            <p>Admin A</p>
            <p>Admin B</p>
            <p>Admin C</p>
          </div>
        </div>
      </footer>

      <div className="justline" />
    </>
  );
}
