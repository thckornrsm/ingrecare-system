'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import CustomDropdown from '@/components/CustomDropdown';
import { 
    Plus, FileText, Search, 
    // ไอคอนสำหรับ Mapping (ยังคงเก็บไว้เผื่อใช้งานในอนาคต)
    Utensils, ChefHat, Refrigerator, CookingPot, Soup, Fish, Shrimp, Egg, 
    Beef, Ham, Drumstick, Pizza, Hamburger, Salad, Apple, Bean, Carrot, 
    Cherry, Wheat, LeafyGreen, Vegan, Dessert, CakeSlice, Candy, Lollipop, 
    IceCreamCone, Coffee, Beer, Martini, Wine, CupSoda, Ellipsis, Leaf,
    SprayCan, MoreHorizontal
} from 'lucide-react';


// 1. เก็บรายการไอคอนทั้งหมดที่มีให้เลือก
const iconOptions = [
    { name: 'Utensils', icon: Utensils }, { name: 'ChefHat', icon: ChefHat }, { name: 'Refrigerator', icon: Refrigerator }, { name: 'CookingPot', icon: CookingPot }, { name: 'Soup', icon: Soup },
    { name: 'Fish', icon: Fish }, { name: 'Shrimp', icon: Shrimp },
    { name: 'Egg', icon: Egg }, { name: 'Beef', icon: Beef }, { name: 'Ham', icon: Ham }, { name: 'Drumstick', icon: Drumstick }, { name: 'Pizza', icon: Pizza }, { name: 'Hamburger', icon: Hamburger },
    { name: 'Salad', icon: Salad }, { name: 'Apple', icon: Apple }, { name: 'Bean', icon: Bean }, { name: 'Carrot', icon: Carrot }, { name: 'Cherry', icon: Cherry }, { name: 'Wheat', icon: Wheat }, { name: 'LeafyGreen', icon: LeafyGreen }, { name: 'Vegan', icon: Vegan },
    { name: 'Dessert', icon: Dessert }, { name: 'CakeSlice', icon: CakeSlice }, { name: 'Candy', icon: Lollipop }, { name: 'IceCreamCone', icon: IceCreamCone },
    { name: 'Coffee', icon: Coffee }, { name: 'Beer', icon: Beer }, { name: 'Martini', icon: Martini }, { name: 'Wine', icon: Wine }, { name: 'CupSoda', icon: CupSoda },
    { name: 'Leaf', icon: Leaf }, { name: 'SprayCan', icon: SprayCan }, { name: 'MoreHorizontal', icon: MoreHorizontal },
    { name: 'Ellipsis', icon: Ellipsis }
];
const iconMap = Object.fromEntries(iconOptions.map(opt => [opt.name, opt.icon]));


// 2. (สำคัญ) สร้างตัวกลางสำหรับจับคู่ "ชื่อหมวดหมู่ไทย" กับ "ชื่อไอคอนอังกฤษ"
const categoryToIconNameMap = {
  'เนื้อสัตว์': 'Beef',
  'ผัก': 'Leaf',
  'ทะเล': 'Fish',
  'ผลไม้': 'Apple',
  'เครื่องปรุง': 'SprayCan',
  'อื่นๆ': 'MoreHorizontal',
  // *** หากมีหมวดหมู่ใหม่ ให้มาเพิ่มการจับคู่ที่นี่ ***
  // 'เบเกอรี่': 'CakeSlice', 
};


// --- Color Status Styles ---
const statusStyles = {
    critical: { bg: 'bg-[#E15050]' },
    warning: { bg: 'bg-[#F9BF22]' },
    good: { bg: 'bg-[#3FA170]' },
};

// --- ItemCard Component ---
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
                    <span className="text-sm text-gray-400">ล็อต</span>
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


// ========= Main Dashboard Page (Final Version) =========
export default function DashboardPage() {
    const router = useRouter();

    // --- States ---
    const [inventoryData, setInventoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 12;

    // --- Data Fetching Effect ---
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
                            lot: batch.batch_id,
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

    // --- Filtering and Pagination Logic ---
    const filteredItems = inventoryData
        .filter(item => activeFilter === 'ทั้งหมด' || item.category === activeFilter)
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- Handlers ---
    const handleSelectCategory = (selected) => {
        setActiveFilter(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // --- Render Logic ---
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

                    {/* Filter and Search Controls */}
                    <div className="flex items-center gap-4 mb-8">
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
                    <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] min-h-[400px]">
                        {renderContent()}
                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        )}
                    </div>  
                </main>
            </div>
        </div>
    );
}