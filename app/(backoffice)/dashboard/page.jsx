'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import CustomDropdown from '@/components/CustomDropdown';
import { Search } from 'lucide-react';
import { Icon } from '@iconify/react';

// --- Mock Data ---
const MOCK_INVENTORY_DATA = [
    { name: 'เนื้อสันในวัว', daysLeft: 1, lot: 'A001', importDate: '15/10/2568', expiryDate: '17/10/2568', status: 'critical', category: 'เนื้อสัตว์' },
    { name: 'อกไก่', daysLeft: 2, lot: 'A002', importDate: '15/10/2568', expiryDate: '18/10/2568', status: 'warning', category: 'เนื้อสัตว์' },
    { name: 'ผักกาดขาว', daysLeft: 3, lot: 'B203', importDate: '14/10/2568', expiryDate: '19/10/2568', status: 'warning', category: 'ผัก' },
    { name: 'เนื้อหมูสามชั้น', daysLeft: 4, lot: 'A003', importDate: '13/10/2568', expiryDate: '20/10/2568', status: 'good', category: 'เนื้อสัตว์' },
    { name: 'คะน้า', daysLeft: 5, lot: 'B206', importDate: '12/10/2568', expiryDate: '21/10/2568', status: 'good', category: 'ผัก' },
    { name: 'แครอท', daysLeft: 7, lot: 'B204', importDate: '10/10/2568', expiryDate: '23/10/2568', status: 'good', category: 'ผัก' },
    { name: 'หอมใหญ่', daysLeft: 14, lot: 'B207', importDate: '03/10/2568', expiryDate: '30/10/2568', status: 'good', category: 'ผัก' },
    { name: 'ซอสหอยนางรม', daysLeft: 150, lot: 'C511', importDate: '01/06/2568', expiryDate: '14/03/2569', status: 'good', category: 'เครื่องปรุง' },
    { name: 'น้ำปลา', daysLeft: 200, lot: 'C512', importDate: '20/05/2568', expiryDate: '04/05/2569', status: 'good', category: 'เครื่องปรุง' },
    { name: 'น้ำตาลทราย', daysLeft: 365, lot: 'C513', importDate: '01/01/2568', expiryDate: '16/10/2569', status: 'good', category: 'เครื่องปรุง' },
    { name: 'กุ้งแม่น้ำ', daysLeft: 2, lot: 'D101', importDate: '15/10/2568', expiryDate: '18/10/2568', status: 'warning', category: 'อาหารทะเล' },
    { name: 'ปลาหมึก', daysLeft: 3, lot: 'D102', importDate: '14/10/2568', expiryDate: '19/10/2568', status: 'warning', category: 'อาหารทะเล' },
    { name: 'พริกขี้หนู', daysLeft: 1, lot: 'B205', importDate: '16/10/2568', expiryDate: '17/10/2568', status: 'critical', category: 'ผัก' },
].sort((a, b) => a.daysLeft - b.daysLeft);

const MOCK_CATEGORIES = [
    { name: 'ทั้งหมด' },
    { name: 'ผัก' },
    { name: 'เนื้อสัตว์' },
    { name: 'เครื่องปรุง' },
    { name: 'อาหารทะเล' },
];

// status color
const statusStyles = {
    critical: { bg: 'bg-[#E15050]' }, //เขียว
    warning: { bg: 'bg-[#F9BF22]' }, //เหลือง
    good: { bg: 'bg-[#3FA170]' }, // แดง
};

// ItemCard
const ItemCard = ({ item }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <div className="bg-white rounded-lg flex items-stretch overflow-hidden shadow-sm">
            <div className={`flex-shrink-0 w-20 sm:w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-3xl sm:text-4xl font-bold">{item.daysLeft < 0 ? 'EXP' : item.daysLeft}</span>
                <span className="text-sm sm:text-base font-bold">day left</span>
            </div>
            <div className="flex-grow px-4 sm:px-5 py-3">
                <h3 className="font-semibold text-gray-800 mb-2 truncate">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm text-[#B8B8B8]">
                    <span className="text-gray-400">ล็อต</span>
                    <span className="text-black text-right font-normal">{item.lot}</span>
                    <span className="text-gray-400">วันที่นำเข้า</span>
                    <span className="text-black text-right font-normal">{item.importDate}</span>
                    <span className="text-gray-400">วันที่หมดอายุ</span>
                    <span className="text-black text-right font-normal">{item.expiryDate}</span>
                </div>
            </div>
        </div>
    );
};


// Main
export default function DashboardPage() {
    const router = useRouter();

    const [inventoryData] = useState(MOCK_INVENTORY_DATA);
    const [categories] = useState(MOCK_CATEGORIES);
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Filtering and Pagination
    const filteredItems = inventoryData
        .filter(item => activeFilter === 'ทั้งหมด' || item.category === activeFilter)
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Helper and Handler
    const handleSelectCategory = (selected) => {
        setActiveFilter(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const renderContent = () => {
        if (paginatedItems.length === 0) {
            return <p className="text-center text-gray-500 py-10">ไม่พบรายการวัตถุดิบ</p>;
        }
        
        // Responsive Grid
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {paginatedItems.map((item, index) => (
                    <ItemCard key={`${item.lot}-${index}`} item={item} />
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-white"> 
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
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

                    {/* Item Grid and Pagination */}
                    <div className="bg-[#F6F8FA] p-4 sm:p-9 rounded-lg border border-[#E5E5E5] h-auto">
                        {renderContent()}
                    </div>
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    )}  
                </main>
            </div>
        </div>
    );
}