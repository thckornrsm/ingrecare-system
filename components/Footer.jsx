// src/components/Footer.js
import React from 'react';
import Image from 'next/image';

function Footer() {
  return (
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
        <div className="bg-gradient-to-r from-[#3FA170] to-[#48A78D] text-center text-sm text-[#6B8AA3] py-2"></div>
      </footer>
    
  );
}

export default Footer;
