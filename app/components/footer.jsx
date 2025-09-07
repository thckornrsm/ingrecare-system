// src/components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="logo-section">
        <img src="../logo.svg" alt="logo" />
        <div className="logo-text">
          <h4>IngreCare</h4>
          <p>ระบบจัดการวัตถุดิบ</p>
        </div>
      </div>
      <div className="team">
        <p>ผู้ดูแลระบบ</p>
          <div className="admin">
            <div className="name">
              <p>ทัชชกร รษามณีโชค</p>
              <p>กุลรดา กิจจาดำรงสุข</p>
              <p>ณัฐมน เหล่าพราหมณ์</p>
            </div>
            <div className="email">
              <p>thatchakorn.r@ku.th</p>
              <p>sornchanok.v@ku.th</p>
              <p>nattamon.la@ku.th</p>
            </div>
          </div>
      </div>
    </footer>
    
  );
}

export default Footer;
