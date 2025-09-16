'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import FilterTabs from '@/components/FilterTabs';
import { Plus, FileText } from 'lucide-react';

// setup 1 day left = critical, 2-3 days = warning, +3 days = good
const inventoryItems = [
    { name: 'เนื้อวัวเทนเดอร์ลอย', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'เนื้อสัตว์' },
    { name: 'ผักกาดขาว', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'ผัก' },
    { name: 'ปลาแซลมอล', daysLeft: 1, lot: 10001, importDate: '10/01/2569', expiryDate: '17/01/2569', status: 'critical', category: 'ทะเล' },
    { name: 'ปลาหมึก', daysLeft: 2, lot: 10022, importDate: '11/01/2569', expiryDate: '18/01/2569', status: 'warning', category: 'ทะเล' },
    { name: 'เนื้อสันนอก', daysLeft: 2, lot: 10022, importDate: '11/01/2569', expiryDate: '18/01/2569', status: 'warning', category: 'เนื้อสัตว์' },
    { name: 'เนื้ออกไก่สไลด์', daysLeft: 3, lot: 10033, importDate: '12/01/2569', expiryDate: '19/01/2569', status: 'warning', category: 'เนื้อสัตว์' },
    { name: 'ต้นหอม', daysLeft: 5, lot: 10005, importDate: '14/01/2569', expiryDate: '21/01/2569', status: 'good', category: 'ผัก' },
    { name: 'ไข่ไก่', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'อื่นๆ' },
    { name: 'แตงโม', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'ผลไม้' },
    { name: 'พริกไทยดำป่น', daysLeft: 12, lot: 10002, importDate: '26/01/2569', expiryDate: '02/02/2569', status: 'good', category: 'เครื่องปรุง' },
];

// Color Status Styles
const statusStyles = {
    critical: { bg: 'bg-[#E15050]', text: 'text-red-600', border: 'border-red-500' },
    warning: { bg: 'bg-[#F9BF22]', text: 'text-yellow-600', border: 'border-yellow-500' },
    good: { bg: 'bg-[#3FA170]', text: 'text-green-600', border: 'border-green-500' },
};

// ItemCard Component
const ItemCard = ({ item }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <div className="bg-white rounded-lg flex items-stretch overflow-hidden shadow-xl/4" >
            <div className={`flex-shrink-0 w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-4xl font-bold">{item.daysLeft}</span>
                <span className="text-base font-bold">day left</span>
            </div>
            <div className="flex-grow px-5 py-3">
                <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 justify-center text-sm text-gray-600">
                    <span className="text-sm text-[#B8B8B8]">Lot</span>
                    <span className="text-sm text-black text-right">{item.lot}</span>
                    <span className="text-sm text-[#B8B8B8]">วันที่นำเข้า</span>
                    <span className="text-sm text-black text-right">{item.importDate}</span>
                    <span className="text-sm text-[#B8B8B8]">วันที่หมดอายุ</span>
                    <span className="text-sm text-black text-right">{item.expiryDate}</span>
                </div>
            </div>
        </div>
    );
};

// ** Main Dashboard Page **
export default function DashboardPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const filteredItems = inventoryItems.filter(item => 
        activeFilter === 'ทั้งหมด' || item.category === activeFilter
    );
    return (
        <div className="flex h-screen bg-white"> 
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-black text-3xl font-bold">หน้าหลัก</h1>
                            <p className="text-[#979999]">แสดงรายการวัตถุดิบใกล้หมดอายุ ที่อยู่ภายในร้านของคุณ</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                              onClick={() => router.push("/stockout")}
                              className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] 
                                         text-[#3FA170] font-medium flex items-center gap-2 
                                         hover:bg-green-50 transition-colors"
                            >
                              <FileText size={16} /> เบิกจ่ายวัตถุดิบ
                            </button>

                            <button
                              onClick={() => router.push("/stockin")}
                              className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] 
                                         bg-[#3FA170] text-white font-medium flex items-center gap-2 
                                         hover:bg-[#1E7957] transition-colors"
                            >
                              <Plus size={16} /> เพิ่มวัตถุดิบ
                            </button>
                          </div>
                        </div>

                    <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                    <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

