'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { 
    LayoutDashboard, BarChart2, Inbox, Package, 
    History, Wrench, LogOut, Bell, Plus, 
    Search, ChevronDown, Beef, Carrot, Apple, Fish, CookingPot, FileText
} from 'lucide-react';


// Mock data for inventory items
// (ในโปรเจกต์จริง ต้องดึงข้อมูล)
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

export default function DashboardPage() {
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');

    const filteredItems = inventoryItems.filter(item => 
        activeFilter === 'ทั้งหมด' || item.category === activeFilter
    );
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">หน้าหลัก</h1>
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

