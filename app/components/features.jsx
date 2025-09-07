// src/components/Features.js
import React from 'react';
import { Icon } from '@iconify/react';

function Features() {
  return (
    <section className="features">
      <div className="reasonwhy">
        <h2>ทำไมต้อง </h2>
        <span>IngreCare?</span>
      </div>
      <section className="features-list">
        <div className="feature">
          <Icon icon="mage:lock-fill" width="88" height="88"/>
          <div className="content">
            <h3>ปลอดภัยและใช้งานง่าย</h3>
            <p>กำหนดสิทธิ์การเข้าถึงข้อมูลได้ ป้องกันข้อมูลรั่วไหล</p>
            <p>ให้คุณมั่นใจในความปลอดภัยทุกครั้งที่ใช้งาน</p>
          </div>
        </div>
        <div className="feature">
          <Icon icon="el:idea" width="88" height="88"/>
          <div className="content">
            <h3>จัดการวัตถุดิบอย่างแม่นยำ</h3>
            <p>เพียงแค่กรอกข้อมูล ระบบจะช่วยแยกประเภทและจัดการวันหมดอายุให้อัตโนมัติ</p>
            <p>ช่วยคุณติดตามการใช้และจัดการได้อย่างมืออาชีพ</p>
          </div>
        </div>
        <div className="feature">
          <Icon icon="tdesign:file-add-filled" width="88" height="88"/>
          <div className="content">
            <h3>เบิกวัตถุดิบแบบ Realtime</h3>
            <p>การเบิกวัตถุดิบง่ายสุด ๆ แค่เลือกชนิดและจำนวน ระบบจะอัปเดตข้อมูลให้ทันที</p>
            <p>พร้อมแสดงปริมาณที่เหลือเพื่อให้คุณวางแผนการใช้งานได้ดียิ่งขึ้น</p>
          </div>
        </div>
        <div className="feature">
          <Icon icon="icomoon-free:stats-bars" width="88" height="88"/>
          <div className="content">
            <h3>ดูสถิติการใช้งานได้</h3>
            <p>คุณจะรู้ว่าวัตถุดิบใดที่ถูกใช้มากที่สุด ช่วยให้คุณสามารถตัดสินใจ</p>
            <p>นำเข้าวัตถุดิบในรอบถัดไปได้อย่างมีประสิทธิภาพ</p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Features;
