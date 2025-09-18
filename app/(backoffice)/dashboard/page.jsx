// app/(backoffice)/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar'; // <-- 1. ใช้ Sidebar จาก Component
import FilterTabs from '@/components/FilterTabs'; // <-- 2. ใช้ FilterTabs จาก Component
import { 
    Plus, FileText
} from 'lucide-react';

// Color Status Styles
const statusStyles = {
    critical: { bg: 'bg-[#E15050]' },
    warning: { bg: 'bg-[#F9BF22]' },
    good: { bg: 'bg-[#3FA170]' },
};


// ========= ItemCard Component (อัปเดตดีไซน์) =========
const ItemCard = ({ item }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <div className="bg-white rounded-lg flex items-stretch overflow-hidden shadow-sm">
            <div className={`flex-shrink-0 w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-4xl font-bold">{item.daysLeft < 0 ? 'EXP' : item.daysLeft}</span>
                <span className="text-base font-bold">day left</span>
            </div>
            <div className="flex-grow px-5 py-3">
                <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="text-sm text-gray-400">Lot</span>
                    <span className="text-sm text-black text-right font-medium">{item.lot}</span>
                    <span className="text-sm text-gray-400">วันที่นำเข้า</span>
                    <span className="text-sm text-black text-right font-medium">{item.importDate}</span>
                    <span className="text-sm text-gray-400">วันที่หมดอายุ</span>
                    <span className="text-sm text-black text-right font-medium">{item.expiryDate}</span>
                </div>
            </div>
        </div>
    );
};


// ========= Main Dashboard Page (อัปเดตใหม่) =========
export default function DashboardPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const [inventoryData, setInventoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/stockin');
                if (!res.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลได้');
                }
                const batches = await res.json();
                
                const processedItems = batches.flatMap(batch => 
                    batch.stockins.map(stockin => {
                        const expiryDate = new Date(stockin.expiry_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let status = 'good';
                        if (diffDays <= 1) {
                            status = 'critical';
                        } else if (diffDays <= 3) {
                            status = 'warning';
                        }

                        return {
                            name: stockin.ingredient.name,
                            daysLeft: diffDays,
                            lot: batch.batch_id,
                            importDate: new Date(stockin.received_date).toLocaleDateString('th-TH'),
                            expiryDate: expiryDate.toLocaleDateString('th-TH'),
                            status: status,
                            category: stockin.ingredient.category.category_name,
                        };
                    })
                )
                // --- 3. แก้ไข Logic การกรอง ---
                // กรองเอาเฉพาะรายการที่ยังไม่หมดอายุ (daysLeft > 0)
                .filter(item => item.daysLeft > 0); 
                
                processedItems.sort((a, b) => a.daysLeft - b.daysLeft);
                setInventoryData(processedItems);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = inventoryData.filter(item => 
        activeFilter === 'ทั้งหมด' || item.category === activeFilter
    );

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</p>;
        }
        if (filteredItems.length === 0) {
            return <p className="text-center text-gray-500">ไม่พบรายการวัตถุดิบใกล้หมดอายุ</p>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item, index) => (
                    <ItemCard key={`${item.lot}-${index}`} item={item} />
                ))}
            </div>
        );
    };

    return (
        // --- 4. ปรับ UI Layout ---
        <div className="flex h-screen bg-white"> 
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-black text-3xl font-bold">หน้าหลัก</h1>
                            <p className="text-[#979999]">แสดงรายการวัตถุดิบใกล้หมดอายุ ที่อยู่ภายในร้านของคุณ</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                              onClick={() => router.push("/stockout")}
                              className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] text-[#3FA170] font-medium flex items-center gap-2 hover:bg-green-50 transition-colors"
                            >
                              <FileText size={16} /> เบิกจ่ายวัตถุดิบ
                            </button>
                            <button
                              onClick={() => router.push("/stockin")}
                              className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors"
                            >
                              <Plus size={16} /> เพิ่มวัตถุดิบ
                            </button>
                        </div>
                    </div>

                    <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                    <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5]">
                       {renderContent()}
                    </div>  
                </main>
            </div>
        </div>
    );
}

