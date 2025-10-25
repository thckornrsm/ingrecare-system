'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import CustomDropdown from '@/components/CustomDropdown';
import { Search, X } from 'lucide-react';
import { Icon } from '@iconify/react';

// Color status styles
const statusStyles = {
    critical: { bg: 'bg-[#E15050]' },
    warning: { bg: 'bg-[#F9BF22]' },
    good: { bg: 'bg-[#3FA170]' },
};

// Detail Modal Component
const DetailModal = ({ item, onClose }) => {
    if (!item) return null;
    return (
        <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl mx-4"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <X size={24} /> 
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className={`flex-1 p-5 rounded-xl text-black flex flex-col justify-center items-center text-center shadow-md
                            ${item.status === 'critical' ? ' bg-[#E15050]/10' : 
                            item.status === 'warning' ? 'bg-[#F9BF22]/10' : 
                            'bg-[#3FA170]/10'}`}>
                            
                            {item.status === 'critical' ? (
                                <Icon icon="lucide:alert-octagon" className="w-8 h-8 mb-1 text-[#E15050]" />
                            ) : item.status === 'warning' ? (
                                <Icon icon="lucide:alert-triangle" className="w-8 h-8 mb-1 text-[#F9BF22]" />
                            ) : (
                                <Icon icon="lucide:check-circle" className="w-8 h-8 mb-1 text-[#3FA170]" />
                            )}

                            <p className="text-sm font-light uppercase opacity-90">สถานะใกล้หมดอายุ</p>
                            <p className="text-2xl font-semibold mt-1">
                                {item.daysLeft < 0 ? 'หมดอายุแล้ว' : `${item.daysLeft} วัน`}
                            </p>
                        </div>
                        <div className="flex-1 p-5 rounded-xl bg-gray-50 text-black flex flex-col justify-center items-center text-center shadow-md">
                            <Icon icon="lucide:package" className="w-8 h-8 mb-1" />
                            <p className="text-sm font-light uppercase opacity-90">ปริมาณคงเหลือ</p>
                            <p className="text-2xl font-semibold mt-1">
                                {Number(item.quantity).toFixed(2)} <span className="text-2xl font-semibold opacity-90">{item.unit}</span>
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div className="py-3 px-2 border-b border-[#E5E5E5]"> 
                            <span className="text-xs text-gray-500 block">ล็อตที่</span>
                            <span className="text-base text-gray-800 font-medium">{item.lot_number}</span>
                        </div>
                        <div className="py-3 px-2 border-b border-[#E5E5E5]"> 
                            <span className="text-xs text-gray-500 block">หมวดหมู่</span>
                            <span className="text-base text-gray-800 font-medium">{item.category}</span>
                        </div>
                        <div className="py-3 px-2 border-b border-[#E5E5E5]"> 
                            <span className="text-xs text-gray-500 block">วันที่นำเข้า</span>
                            <span className="text-base text-gray-800 font-medium">{item.importDate}</span>
                        </div>
                        <div className="py-3 px-2 border-b border-[#E5E5E5]"> 
                            <span className="text-xs text-gray-500 block">วันที่หมดอายุ</span>
                            <span className="text-base text-gray-800 font-medium">{item.expiryDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Item Card Component
const ItemCard = ({ item, onSelect }) => {
    const styles = statusStyles[item.status] || statusStyles.good;
    return (
        <button 
            onClick={onSelect}
            className="bg-white rounded-lg flex items-stretch overflow-hidden shadow-sm text-left 
                       hover:shadow-md hover:ring-1 hover:ring-[#E5E5E5] transition-all cursor-pointer"
        >
            <div className={`flex-shrink-0 w-24 p-2 flex flex-col items-center justify-center text-white ${styles.bg}`}>
                <span className="text-4xl font-bold">{item.daysLeft < 0 ? 'EXP' : item.daysLeft}</span>
                <span className="text-base font-bold">day left</span>
            </div>
            <div className="flex-grow px-5 py-3">
                <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-sm text-gray-400">ล็อต</span>
                    <span className="text-sm text-black text-right font-normal">{item.lot_number}</span>
                    <span className="text-sm text-gray-400">วันที่นำเข้า</span>
                    <span className="text-sm text-black text-right font-normal">{item.importDate}</span>
                    <span className="text-sm text-gray-400">วันที่หมดอายุ</span>
                    <span className="text-sm text-black text-right font-normal">{item.expiryDate}</span>
                </div>
            </div>
        </button>
    );
};

// Main Dashboard Page
export default function DashboardPage() {
    const router = useRouter();

    const [inventoryData, setInventoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const itemsPerPage = 12;

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryRes, stockRes, categoriesRes] = await Promise.all([
                    fetch('/api/inventory'),
                    fetch('/api/stockin'),
                    fetch('/api/categories')
                ]);

                if (!inventoryRes.ok || !stockRes.ok || !categoriesRes.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้');
                }

                // ดึงข้อมูลปริมาณคงเหลือจริง (หลังหักการเบิก)
                const inventoryData = await inventoryRes.json();
                
                // สร้าง Map เก็บปริมาณคงเหลือตาม ingredient_id
                const quantityMap = {};
                inventoryData.forEach(item => {
                    if (item.ingredient?.ingredient_id) {
                        quantityMap[item.ingredient.ingredient_id] = {
                            quantity: item.quantity,
                            unit: item.unit?.unit_name || ''
                        };
                    }
                });

                // Process stock data
                const batches = await stockRes.json();
                const processedItems = batches.flatMap(batch =>
                    batch.stockins.map(stockin => {
                        const expiryDate = new Date(stockin.expiry_date);
                        const today = new Date();
                        
                        today.setHours(0, 0, 0, 0);  
                        expiryDate.setHours(0, 0, 0, 0);  

                        const diffTime = expiryDate - today;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                        let status = 'good';
                        if (diffDays <= 1) status = 'critical';
                        else if (diffDays <= 3) status = 'warning';

                        // ใช้ปริมาณคงเหลือจริงจาก inventory
                        const ingredientId = stockin.ingredient.ingredient_id;
                        const inventoryInfo = quantityMap[ingredientId] || { quantity: 0, unit: stockin.unit.unit_name };

                        return {
                            name: stockin.ingredient.name,
                            daysLeft: diffDays,
                            lot_number: batch.lot_number,
                            importDate: new Date(stockin.received_date).toLocaleDateString('th-TH'),
                            expiryDate: expiryDate.toLocaleDateString('th-TH'),
                            status: status,
                            category: stockin.ingredient.category.category_name,
                            quantity: inventoryInfo.quantity, // ใช้ปริมาณคงเหลือจริง
                            unit: inventoryInfo.unit,
                        };
                    })
                )
                .filter(item => item.daysLeft > 0 && item.quantity > 0) // กรองเฉพาะที่มีของเหลือ
                .sort((a, b) => a.daysLeft - b.daysLeft);

                setInventoryData(processedItems);

                // Process categories data
                const dbCategories = await categoriesRes.json();
                const formattedCategories = [
                    { name: 'ทั้งหมด' },
                    ...dbCategories.map(cat => ({ name: cat.category_name }))
                ];
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

    // Modal Handlers
    const handleCardClick = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    // Filter Handlers
    const handleSelectCategory = (selected) => {
        setActiveFilter(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Render Content
    const renderContent = () => {
        if (isLoading) return <p className="text-center text-gray-500 py-10">กำลังโหลดข้อมูล...</p>;
        if (error) return <p className="text-center text-red-500 py-10">เกิดข้อผิดพลาด: {error}</p>;
        if (paginatedItems.length === 0) return <p className="text-center text-gray-500 py-10">ไม่พบรายการวัตถุดิบ</p>;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedItems.map((item, index) => (
                    <ItemCard 
                        key={`${item.lot_number}-${index}`} 
                        item={item} 
                        onSelect={() => handleCardClick(item)}
                    />
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
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredItems.length}
                />
            )}
            
            {/* Detail Modal */}
            {selectedItem && (
                <DetailModal 
                    item={selectedItem} 
                    onClose={handleCloseModal} 
                />
            )}
        </main>
    );
}