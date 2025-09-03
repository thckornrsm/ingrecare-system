// src/components/Navbar.js
import React from 'react';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <><img src="pic/logo.svg" alt="logo" /></>
        IngreCare
        </div>
      <div className="navbar-links">
        <a href="#homepage">หน้าหลัก</a>
        <a href="#features">ฟีเจอร์ระบบ</a>
        <a href="#contact">ติดต่อฝ่ายขาย</a>
      </div>
      <button className="login-button">เข้าสู่ระบบ</button>
    </nav>
  );
}

export default Navbar;
