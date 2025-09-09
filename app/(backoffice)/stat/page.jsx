// app/(backoffice)/statistics/page.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    LayoutDashboard, BarChart2, Inbox, Package, 
    History, Wrench, LogOut,
    Beef, Carrot, Apple, Fish, CookingPot
} from 'lucide-react';

// ========= Mock Data for Donut Chart =========
const donutChartData = [
    { name: 'ทะเล', value: 30, color: 'bg-sky-300', strokeColor: 'text-sky-300' },
    { name: 'ผัก', value: 15, color: 'bg-green-300', strokeColor: 'text-green-300' },
    { name: 'ผลไม้', value: 13, color: 'bg-violet-300', strokeColor: 'text-violet-300' },
    { name: 'เครื่องปรุง', value: 20, color: 'bg-yellow-300', strokeColor: 'text-yellow-300' },
    { name: 'เนื้อสัตว์', value: 14, color: 'bg-red-400', strokeColor: 'text-red-400' },
    { name: 'อื่นๆ', value: 6, color: 'bg-gray-300', strokeColor: 'text-gray-300' },
];

// ========= Mock Data for Bar Chart =========
const barChartData = {
    'ผัก': [
        { name: 'ผักกาด', value: 35 }, { name: 'ผักกวางตุ้ง', value: 70 },
        { name: 'แครอท', value: 28 }, { name: 'หัวหอม', value: 62 },
        { name: 'ฟักทอง', value: 44 }, { name: 'กะหล่ำปลี', value: 78 },
        { name: 'ข้าวโพดอ่อน', value: 72 }
    ],
    'ผลไม้': [
        { name: 'แอปเปิ้ล', value: 60 }, { name: 'กล้วย', value: 80 }, 
        { name: 'ส้ม', value: 45 }, { name: 'มะม่วง', value: 75 }
    ],
    'เนื้อสัตว์': [
        { name: 'เนื้อวัว', value: 85 }, { name: 'เนื้อหมู', value: 90 }, 
        { name: 'ไก่', value: 70 }, { name: 'เป็ด', value: 50 }
    ],
    'ทะเล': [
        { name: 'กุ้ง', value: 75 }, { name: 'ปลาหมึก', value: 65 }, 
        { name: 'ปลาแซลมอน', value: 88 }, { name: 'หอย', value: 40 }
    ],
    'เครื่องปรุง': [
        { name: 'น้ำปลา', value: 95 }, { name: 'น้ำตาล', value: 85 }, 
        { name: 'ซอสพริก', value: 70 }, { name: 'น้ำมันหอย', value: 80 }
    ],
    'อื่นๆ': [
        { name: 'ไข่ไก่', value: 90 }, { name: 'เต้าหู้', value: 60 }, 
        { name: 'วุ้นเส้น', value: 70 }
    ],
};


// ========= Sidebar Component (แก้ไขให้สมบูรณ์) =========
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
            <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <LayoutDashboard size={20} /> หน้าหลัก
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg bg-[#3FA170] text-white">
                <BarChart2 size={20} /> สถิติการใช้งาน
            </Link>
            <p className="text-xs text-gray-400 uppercase font-semibold pt-4">การจัดการข้อมูล</p>
            <Link href="stockin" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> นำเข้าวัตถุดิบ
            </Link>
            <Link href="stockout" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
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

// ========= FilterTabs Component (ไม่มีการเปลี่ยนแปลง) =========
const FilterTabs = ({ activeFilter, setActiveFilter }) => {
    const categories = [
        { name: 'ทั้งหมด', icon: null }, { name: 'ผัก', icon: <Carrot size={16}/> },
        { name: 'ผลไม้', icon: <Apple size={16}/> }, { name: 'เนื้อสัตว์', icon: <Beef size={16}/> },
        { name: 'ทะเล', icon: <Fish size={16}/> }, { name: 'เครื่องปรุง', icon: <CookingPot size={16}/> },
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

// ========= DonutChart Component (ไม่มีการเปลี่ยนแปลง) =========
const DonutChart = () => {
    const totalValue = donutChartData.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 p-4">
            <div className="relative w-72 h-72">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {donutChartData.map((item, index) => {
                        const percentage = (item.value / totalValue) * 100;
                        const dashArray = `${percentage} ${100 - percentage}`;
                        const dashOffset = -cumulativePercentage;
                        cumulativePercentage += percentage;
                        return (
                            <circle key={index} cx="18" cy="18" r="14"
                                className={`stroke-current ${item.strokeColor}`}
                                strokeWidth="8" fill="none"
                                strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-col gap-4">
                {donutChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-sm ${item.color}`}></div>
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-semibold text-gray-800 ml-auto">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ========= BarChart Component (แก้ไข) =========
const BarChart = ({ data, categoryName }) => {
    const barColors = [
        'bg-sky-300', 
        'bg-emerald-300', 
        'bg-violet-300', 
        'bg-amber-300', 
        'bg-red-300', 
        'bg-pink-300', 
        'bg-indigo-300'
    ];

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                แผนภูมิแท่งแสดงสัดส่วนการใช้วัตถุดิบประเภท "{categoryName}"
            </h2>
            <div className="w-full h-72 flex gap-4 items-end border-l border-b border-gray-300 px-4 pt-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                        <div 
                            className={`w-full ${barColors[index % barColors.length]} rounded-t-md`}
                            style={{ height: `${item.value}%` }}
                        ></div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// ========= Main Statistics Page (ปรับปรุง Logic การแสดงผล) =========
export default function StatisticsPage() {
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">สถิติการใช้งาน</h1>
                        <p className="text-gray-500">สถิติการใช้งานเพื่อใช้ในการตัดสินใจ</p>
                    </div>

                    <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                    <div className="bg-white p-10 rounded-lg shadow-sm">
                        {activeFilter === 'ทั้งหมด' ? (
                            <>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                                    แผนภูมิวงกลมสัดส่วนการใช้วัตถุดิบตามประเภท
                                </h2>
                                <DonutChart />
                            </>
                        ) : (
                            <BarChart 
                                data={barChartData[activeFilter] || []} 
                                categoryName={activeFilter}
                            />
                        )}
                    </div>  
                </main>
            </div>
        </div>
    );
}

