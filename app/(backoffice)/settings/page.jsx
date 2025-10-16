'use client';

import { useState } from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// หมวดหมู่วัตถุดิบ เชื่อม backend
const materialTypes = [
  { id: 1, name: 'ผัก', count: 10 },
  { id: 2, name: 'ผลไม้', count: 10 },
  { id: 3, name: 'เนื้อสัตว์', count: 10 },
  { id: 4, name: 'ทะเล', count: 10 },
  { id: 5, name: 'ซอสปรุงรส', count: 10 },
];

//หมวดหมู่วัตถุดิบ เชื่อม backend
const units = [
    { id: 1, name: 'ผัก', count: 10 },
    { id: 2, name: 'ผลไม้', count: 10 },
    { id: 3, name: 'เนื้อสัตว์', count: 10 },
    { id: 4, name: 'ทะเล', count: 10 },
    { id: 5, name: 'ซอส', count: 10 },
];

// เกี่ยวกับร้านค้า
const AboutStore = () => (
  <div className="">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">เกี่ยวกับร้านค้า</h2>
    <div className="bg-[#F8FAFB] border border-gray-200 rounded-lg p-8">
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">ชื่อร้านค้า</label>
            <input type="text" id="store-name" placeholder="ระบุชื่อร้านค้า" defaultValue="สุกี้ตี๋ใหญ่" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">ที่อยู่</label>
            <textarea id="address" rows={3} placeholder="ระบุรายละเอียดที่อยู่" defaultValue="42 ถนนมาลัยแมน" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black"></textarea>
          </div>
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">จังหวัด</label>
            <input type="text" id="province" placeholder="เลือกจังหวัด" defaultValue="นครปฐม" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">อำเภอ</label>
            <input type="text" id="district" placeholder="เลือกอำเภอ" defaultValue="กำแพงแสน" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
          </div>
          <div>
            <label htmlFor="sub-district" className="block text-sm font-medium text-gray-700">ตำบล</label>
            <input type="text" id="sub-district" placeholder="เลือกตำบล" defaultValue="กำแพงแสน" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
          </div>
          <div>
            <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
            <input type="text" id="zip-code" placeholder="ระบุรหัสไปรษณีย์" defaultValue="73140" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
          </div>
        </div>
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" className="px-6 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200">ยกเลิก</button>
          <button type="submit" className="px-6 py-2 bg-[#3FA170] text-white rounded-md hover:bg-[#1E7957]">บันทึก</button>
        </div>
      </form>
    </div>
  </div>
);

// จัดการหมวดหมู่
const ManageCategories = () => {
  // Helper component สำหรับแสดงรายการแต่ละประเภท
  const CategorySection = ({ title, items }) => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button className="flex items-center space-x-2 text-[#3FA170] hover:text-[#3FA170]">
          <PlusCircle size={20} />
          <span>เพิ่มหมวดหมู่</span>
        </button>
      </div>
      <div className="bg-[#F8FAFB] border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_100px_80px] gap-4 px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 border-b">
          <input type="checkbox" className="h-4 w-4 text-[#3FA170] border-gray-300 rounded focus:ring-[#3FA170]" />
          <span>ชื่อประเภท</span>
          <span className="text-center">จำนวนวัตถุดิบ</span>
          <span className="text-center">จัดการ</span>
        </div>
        {/* Body */}
        <div className="divide-y divide-gray-200">
          {items.map(item => (
            <div key={item.id} className="grid grid-cols-[40px_1fr_100px_80px] gap-4 px-4 py-3 items-center text-gray-700">
              <input type="checkbox" className="h-4 w-4 text-[#3FA170] border-gray-300 rounded focus:ring-[#3FA170]" />
              <span>{item.name}</span>
              <span className="text-center">{item.count}</span>
              <div className="flex justify-center space-x-3">
                <button className="text-gray-400 hover:text-blue-600"><Pencil size={18} /></button>
                <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <CategorySection title="ประเภทวัตถุดิบ" items={materialTypes} />
      <CategorySection title="หน่วยนับ" items={units} />
    </div>
  );
};


// บัญชีของฉัน
const MyAccount = () => (
  <div className="bg-[#F8FAFB] border border-gray-200 rounded-lg p-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">บัญชีของฉัน</h2>
    <form className="space-y-6 max-w-lg">
       <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">บทบาท</label>
        <input type="text" id="role" readOnly defaultValue="ผู้จัดการร้าน" className="mt-1 block bg-gray-100 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล์</label>
        <input type="email" id="email" defaultValue="manager@sukiteeyai.com" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
        <input type="password" id="password" defaultValue="********" className="mt-1 block bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black" />
      </div>
       <div className="flex justify-end pt-4 space-x-3">
        <button type="button" className="px-6 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200">ยกเลิก</button>
        <button type="submit" className="px-6 py-2 bg-[#3FA170] text-white rounded-md hover:bg-[#1E7957]">บันทึก</button>
      </div>
    </form>
  </div>
);

// Main Settings Page
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'categories', 'account'

  const tabs = [
    { id: 'about', label: 'เกี่ยวกับร้านค้า' },
    { id: 'categories', label: 'จัดการหมวดหมู่' },
    { id: 'account', label: 'บัญชีของฉัน' },
  ];

  return (
    <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto py-9 px-25">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-black text-3xl font-bold">การตั้งค่า</h1>
                  <p className="text-gray-500">จัดการข้อมูลบัญชีและร้านค้าได้ที่นี่</p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-300">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          whitespace-nowrap py-2 px-1 border-b-3 font-medium text-sm
                          ${activeTab === tab.id
                            ? 'border-[#3FA170] text-[#3FA170]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition duration-200 ease-in-out'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                  {activeTab === 'about' && <AboutStore />}
                  {activeTab === 'categories' && <ManageCategories />}
                  {activeTab === 'account' && <MyAccount />}
                </div>
            </main>
        </div>
    </div>
  );
}