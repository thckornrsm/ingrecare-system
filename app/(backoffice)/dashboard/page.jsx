// app/(backoffice)/dashboard/page.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    LayoutDashboard, BarChart2, Inbox, Package, 
    History, Wrench, LogOut, Bell, Plus, 
    Search, ChevronDown, Beef, Carrot, Apple, Fish, CookingPot, FileText
} from 'lucide-react';


// ========= Mock Data (เพิ่ม category) =========
const inventoryItems = [
    { name: 'เนื้อวัวเทนเดอร์ลอย', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'เนื้อสัตว์' },
    { name: 'ผักกาดขาว', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'ผัก' },
    { name: 'ปลาแซลมอล', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'ทะเล' },
    { name: 'ปลาหมึก', daysLeft: 2, lot: 10022, importDate: '11/01/2569', expiryDate: '18/01/2569', status: 'good', category: 'ทะเล' },
    { name: 'เนื้อสันนอก', daysLeft: 2, lot: 10022, importDate: '11/01/2569', expiryDate: '18/01/2569', status: 'good', category: 'เนื้อสัตว์' },
    { name: 'เนื้ออกไก่สไลด์', daysLeft: 3, lot: 10033, importDate: '12/01/2569', expiryDate: '19/01/2569', status: 'good', category: 'เนื้อสัตว์' },
    { name: 'ต้นหอม', daysLeft: 5, lot: 10005, importDate: '14/01/2569', expiryDate: '21/01/2569', status: 'good', category: 'ผัก' },
    { name: 'ไข่ไก่', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'อื่นๆ' },
    { name: 'แตงโม', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'ผลไม้' },
    { name: 'พริกไทยดำป่น', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'เครื่องปรุง' },
];

const statusStyles = {
    critical: { bg: 'bg-[#E15050]', text: 'text-red-600', border: 'border-red-500' },
    good: { bg: 'bg-[#3FA170]', text: 'text-green-600', border: 'border-green-500' },
};

// ========= Sidebar Component =========
const Sidebar = () => (
    <aside className="w-64 bg-white flex flex-col border-r">
        <div className="p-4 border-b">
            <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="IngreCare Logo" width={40} height={40} />
                <div>
                    <h2 className="font-bold text-lg">Suki Teeyai</h2>
                    <p className="text-sm text-gray-500">ผู้จัดการร้าน</p>
                </div>
            </div>
            <button className="text-sm text-gray-500 hover:text-red-500 mt-2 flex items-center gap-1">
                <LogOut size={14} />
                ออกจากระบบ
            </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase font-semibold">เมนูหลัก</p>
            <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg bg-[#3FA170] text-white">
                <LayoutDashboard size={20} /> หน้าหลัก
            </Link>
            <Link href="/stat" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <BarChart2 size={20} /> สถิติการใช้งาน
            </Link>
            <p className="text-xs text-gray-400 uppercase font-semibold pt-4">การจัดการข้อมูล</p>
            <Link href="/stockin" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> นำเข้าวัตถุดิบ
            </Link>
            <Link href="/stockout" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> เบิกจ่ายวัตถุดิบ
            </Link>

            <p className="text-xs text-gray-400 uppercase font-semibold pt-4">รายการข้อมูล</p>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Inbox size={20} /> วัตถุดิบคงเหลือทั้งหมด
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> วัตถุดิบหมดอายุ
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <History size={20} /> ประวัติการนำเข้า
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Wrench size={20} /> ประวัติการเบิกจ่าย
            </Link>
        </nav>
    </aside>
);


// ========= FilterTabs Component (ปรับปรุงให้รับ props) =========
const FilterTabs = ({ activeFilter, setActiveFilter }) => {
    const categories = [
        { name: 'ทั้งหมด', icon: null },
        { name: 'ผัก', icon: <Carrot size={16}/> },
        { name: 'ผลไม้', icon: <Apple size={16}/> },
        { name: 'เนื้อสัตว์', icon: <Beef size={16}/> },
        { name: 'ทะเล', icon: <Fish size={16}/> },
        { name: 'เครื่องปรุง', icon: <CookingPot size={16}/> },
        { name: 'อื่นๆ', icon: null },
    ];

    return (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
            {categories.map(category => (
                <button 
                    key={category.name}
                    onClick={() => setActiveFilter(category.name)}
                    className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-colors ${
                        activeFilter === category.name 
                        ? 'bg-gray-200 text-gray-800 font-semibold' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    {category.icon}
                    {category.name === 'อื่นๆ' ? '... อื่นๆ' : category.name}
                </button>
            ))}
        </div>
    );
};


// ========= ItemCard Component (ดีไซน์ใหม่) =========
const ItemCard = ({ item }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <div className="bg-gray-50 rounded-lg flex items-stretch overflow-hidden border border-gray-200/80">
            <div className={`flex-shrink-0 w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-4xl font-bold">{item.daysLeft}</span>
                <span className="text-sm">day left</span>
            </div>
            <div className="flex-grow p-4">
                <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Lot</span>
                    <span className="font-semibold text-gray-800">{item.lot}</span>
                    <span>วันที่นำเข้า</span>
                    <span className="font-semibold text-gray-800">{item.importDate}</span>
                    <span>วันที่หมดอายุ</span>
                    <span className="font-semibold text-gray-800">{item.expiryDate}</span>
                </div>
            </div>
        </div>
    );
};


// ========= Main Dashboard Page (เพิ่ม State และ Logic การกรอง) =========
export default function DashboardPage() {
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');

    const filteredItems = inventoryItems.filter(item => 
        activeFilter === 'ทั้งหมด' || item.category === activeFilter
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">หน้าหลัก</h1>
                            <p className="text-gray-500">แสดงรายการวัตถุดิบคงเหลือในตู้ตามวันหมดอายุของคุณ</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-2 text-sm rounded-lg border border-[#2AA77A] text-[#2AA77A] font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors">
                                <FileText size={16}/> เบิกจ่ายวัตถุดิบ
                            </button>
                            <button className="px-4 py-2 text-sm rounded-lg bg-[#2AA77A] text-white flex items-center gap-2 hover:bg-[#1E7957] transition-colors">
                                <Plus size={16}/> เพิ่มวัตถุดิบ
                            </button>
                        </div>
                    </div>

                    <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredItems.map((item, index) => (
                                <ItemCard key={index} item={item} />
                            ))}
                        </div>
                    </div>  
                </main>
            </div>
        </div>
    );
}

