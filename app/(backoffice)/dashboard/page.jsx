// app/(backoffice)/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import CustomDropdown from '@/components/CustomDropdown';
import { Search } from 'lucide-react';
import { Icon } from '@iconify/react';

// Status Styles
const statusStyles = {
    critical: { bg: 'bg-[#E15050]' }, // Red
    warning: { bg: 'bg-[#F9BF22]' }, // Yellow
    good: { bg: 'bg-[#3FA170]' }, // Green
};

// Item Card Component
const ItemCard = ({ item }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <div className="bg-white rounded-lg flex items-stretch overflow-hidden shadow-sm">
            <div className={`flex-shrink-0 w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-4xl font-bold">{item.daysLeft < 0 ? 'EXP' : item.daysLeft}</span>
                <span className="text-base font-bold">day left</span>
            </div>
            <div className="flex-grow px-5 py-3">
                <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#B8B8B8]">
                    <span className="text-sm text-gray-400">ล็อต</span>
                    <span className="text-sm text-black text-right font-normal">{item.lot_number}</span>
                    <span className="text-sm text-gray-400">วันที่นำเข้า</span>
                    <span className="text-sm text-black text-right font-normal">{item.importDate}</span>
                    <span className="text-sm text-gray-400">วันที่หมดอายุ</span>
                    <span className="text-sm text-black text-right font-normal">{item.expiryDate}</span>
                </div>
            </div>
        </div>
    );
};

// Main Page
export default function DashboardPage() {
    const router = useRouter();

    const [inventoryData, setInventoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 12;

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stockRes, categoriesRes] = await Promise.all([
                    fetch('/api/stockin'),
                    fetch('/api/categories')
                ]);

                if (!stockRes.ok || !categoriesRes.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้');
                }

                // Process stock data
                const batches = await stockRes.json();
                const processedItems = batches.flatMap(batch => 
                    batch.stockins.map(stockin => {
                        const expiryDate = new Date(stockin.expiry_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let status = 'good';
                        if (diffDays <= 1) status = 'critical';
                        else if (diffDays <= 3) status = 'warning';

                        return {
                            name: stockin.ingredient.name,
                            daysLeft: diffDays,
                            lot_number: batch.lot_number,
                            importDate: new Date(stockin.received_date).toLocaleDateString('th-TH'),
                            expiryDate: expiryDate.toLocaleDateString('th-TH'),
                            status: status,
                            category: stockin.ingredient.category.category_name,
                        };
                    })
                )
                .filter(item => item.daysLeft > 0)
                .sort((a, b) => a.daysLeft - b.daysLeft);
                
                setInventoryData(processedItems);

                // Process categories data
                const dbCategories = await categoriesRes.json();
                // *** START: MODIFICATION ***
                // สร้าง array ของหมวดหมู่โดยไม่มี object icon
                const formattedCategories = [
                    { name: 'ทั้งหมด' },
                    ...dbCategories.map(cat => ({
                        name: cat.category_name,
                    }))
                ];
                // *** END: MODIFICATION ***
                setCategories(formattedCategories);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtering and Pagination
    const filteredItems = inventoryData
        .filter(item => activeFilter === 'ทั้งหมด' || item.category === activeFilter)
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handler Functions
    const handleSelectCategory = (selected) => {
        setActiveFilter(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Render
    const renderContent = () => {
        if (isLoading) return <p className="text-center text-gray-500 py-10">กำลังโหลดข้อมูล...</p>;
        if (error) return <p className="text-center text-red-500 py-10">เกิดข้อผิดพลาด: {error}</p>;
        if (paginatedItems.length === 0) return <p className="text-center text-gray-500 py-10">ไม่พบรายการวัตถุดิบ</p>;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedItems.map((item, index) => (
                    <ItemCard key={`${item.lot}-${index}`} item={item} />
                ))}
            </div>
        );
    };

    return (
        <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-black text-3xl font-bold">หน้าหลัก</h1>
                    <p className="text-[#979999]">แสดงรายการวัตถุดิบใกล้หมดอายุ ที่อยู่ภายในร้านของคุณ</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-4">
                    <button
                        onClick={() => router.push("/stockout")}
                        className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] text-[#3FA170] font-medium flex items-center gap-2 hover:bg-green-50 transition-colors w-full sm:w-auto justify-center"
                    >
                        <Icon icon="icon-park-solid:inbox-out" className="w-4 h-4" /> เบิกจ่ายวัตถุดิบ
                    </button>
                    <button
                        onClick={() => router.push("/stockin")}
                        className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors w-full sm:w-auto justify-center"
                    >
                        <Icon icon="icon-park-twotone:inbox-in" className="w-4 h-4" /> นำเข้าวัตถุดิบ
                    </button>
                </div>
            </div>
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <CustomDropdown 
                    label="หมวดหมู่" 
                    categories={categories} 
                    selectedCategory={activeFilter} 
                    onSelectCategory={handleSelectCategory} 
                />
                <div className="relative w-full">
                    <input 
                        type="text" 
                        placeholder="ค้นหาจากชื่อวัตถุดิบ..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#3FA170]" 
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            {/* Item Grid */}
            <div className="bg-[#F6F8FA] p-4 sm:p-9 rounded-lg border border-[#E5E5E5] h-auto">
                {renderContent()}
            </div> 
            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                />
            )}
        </main>
    );
}