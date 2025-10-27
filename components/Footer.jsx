// components/Footer.js
import React from 'react';
import Image from 'next/image';

function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-8 max-xl:px-16 pb-4 pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 xl:gap-5">
          
          {/* 1. Logo and System Info */}
          <div className="sm:col-span-2 lg:col-span-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3FA170] to-[#48A78D] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Image 
                  src="../logo.svg" 
                  alt="IngreCare Logo" 
                  width={36} 
                  height={36}
                  className="brightness-0 invert sm:w-10 sm:h-10"
                /> 
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold bg-gradient-to-r from-[#3FA170] to-[#48A78D] bg-clip-text text-transparent">
                  IngreCare
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#6B8AA3] mt-0.5 sm:mt-1">
                  ระบบจัดการวัตถุดิบ
                </p>
              </div>
            </div>
          </div>

          {/* 2. Team Members Section */}
          <div className="sm:col-span-1 lg:col-span-3 xl:col-span-3">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-5">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-[#3FA170] to-[#48A78D] rounded-full"></div>
              <h3 className="text-base sm:text-lg md:text-lg font-bold text-gray-800">
                ทีมผู้พัฒนา
              </h3>
            </div>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                'ทัชชกร รษามณีโชค',
                'กุลธิดา กิจจาดำรงสุข',
                'ณัฐมน เหล่าพราหมณ์'
              ].map((name, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#3FA170] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs sm:text-sm md:text-sm font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Section */}
          <div className="sm:col-span-1 lg:col-span-3 xl:col-span-3">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-5">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-[#3FA170] to-[#48A78D] rounded-full"></div>
              <h3 className="text-base sm:text-lg md:text-lg font-bold text-gray-800">
                ติดต่อเรา
              </h3>
            </div>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                'thatchakorn.r@ku.th',
                'sornchanok.v@ku.th',
                'nattamon.la@ku.th'
              ].map((email, index) => (
                <li key={index}>
                  <a 
                    href={`mailto:${email}`} 
                    className="group flex items-start gap-2 text-xs sm:text-sm md:text-sm text-gray-700 hover:text-[#3FA170] transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#3FA170] flex-shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="group-hover:underline break-all">{email}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left order-2 sm:order-1">
              &copy; {new Date().getFullYear()} IngreCare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;