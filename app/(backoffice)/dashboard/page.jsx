'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import CustomDropdown from '@/components/CustomDropdown';
import AddCategoryModal from '@/components/AddCategoryModal';
import { 
    LayoutDashboard, BarChart2, Archive, ClipboardList, FileText, 
    ChevronDown, ChevronUp, Search, Plus,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal, Pizza, 
    ChefHat, Refrigerator, CookingPot, Soup, Shrimp, Egg, Ham, Drumstick, Hamburger, Salad, 
    Bean, Carrot, Cherry, Wheat, LeafyGreen, Vegan, Dessert, CakeSlice, Candy, Lolipop, 
    IceCreamCone, Coffee, Beer, Martini, Wine, CupSoda, Ellipsis
} from 'lucide-react';

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
                    <span className="text-sm text-[#B8B8B8]">ล็อต</span>
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

// Icon Options for Categories
const iconOptions = [
    { name: 'Utensils', icon: Utensils }, { name: 'ChefHat', icon: ChefHat }, { name: 'Refrigerator', icon: Refrigerator }, { name: 'CookingPot', icon: CookingPot }, { name: 'Soup', icon: Soup },
    { name: 'Fish', icon: Fish }, { name: 'Shrimp', icon: Shrimp },
    { name: 'Egg', icon: Egg }, { name: 'Beef', icon: Beef }, { name: 'Ham', icon: Ham }, { name: 'Drumstick', icon: Drumstick }, { name: 'Pizza', icon: Pizza }, { name: 'Hamburger', icon: Hamburger },
    { name: 'Salad', icon: Salad }, { name: 'Apple', icon: Apple }, { name: 'Bean', icon: Bean }, { name: 'Carrot', icon: Carrot }, { name: 'Cherry', icon: Cherry }, { name: 'Wheat', icon: Wheat }, { name: 'LeafyGreen', icon: LeafyGreen }, { name: 'Vegan', icon: Vegan },
    { name: 'Dessert', icon: Dessert }, { name: 'CakeSlice', icon: CakeSlice }, { name: 'Candy', icon: Candy }, { name: 'Lolipop', icon: Lolipop }, { name: 'IceCreamCone', icon: IceCreamCone },
    { name: 'Coffee', icon: Coffee }, { name: 'Beer', icon: Beer }, { name: 'Martini', icon: Martini }, { name: 'Wine', icon: Wine }, { name: 'CupSoda', icon: CupSoda },
    { name: 'Ellipsis', icon: Ellipsis }
];
const iconMap = Object.fromEntries(iconOptions.map(opt => [opt.name, opt.icon]));

// ** Main Dashboard Page **
export default function DashboardPage() {
    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const itemsPerPage = 12;

    const initialCategories = [
        { name: 'ทั้งหมด', icon: <Utensils size={16} className="text-gray-500"/> }, { name: 'เนื้อสัตว์', icon: <Beef size={16} className="text-gray-500"/> },
        { name: 'ผัก', icon: <Leaf size={16} className="text-gray-500"/> }, { name: 'ทะเล', icon: <Fish size={16} className="text-gray-500"/> },
        { name: 'ผลไม้', icon: <Apple size={16} className="text-gray-500"/> }, { name: 'เครื่องปรุง', icon: <SprayCan size={16} className="text-gray-500"/> },
        { name: 'อื่นๆ', icon: <MoreHorizontal size={16} className="text-gray-500"/> },
    ];
    const [categories, setCategories] = useState(initialCategories);

    const filteredItems = inventoryItems
        .filter(item => category === 'ทั้งหมด' || item.category === category)
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectCategory = (selected) => {
        setCategory(selected);
        setCurrentPage(1);
    };

    const handleAddCategory = ({ name, iconName }) => {
        const Icon = iconMap[iconName];
        const newCategory = { name, icon: <Icon size={16} className="text-gray-500" /> };
        setCategories([...categories, newCategory]);
    };

    return (
        <>
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

                        {/* Filter and Search Controls */}
                        <div className="flex mb-6">
                            <div className="flex items-center gap-4 w-full">
                                <div className="relative w-64">
                                     <CustomDropdown categories={categories} selectedCategory={category} onSelectCategory={handleSelectCategory} />
                                </div>
                                <div className="relative w-full">
                                    <input type="text" placeholder="ค้นหาจากชื่อวัตถุดิบ..." value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#3FA170]" />
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            {/*
                            <button onClick={() => setAddCategoryModalOpen(true)} className="text-sm font-medium text-[#3FA170] flex items-center gap-2 hover:underline">
                                <Plus size={16} /> เพิ่มหมวดหมู่
                            </button>
                            */}
                        </div>

                        {/* Item Grid */}
                        <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredItems.map((item, index) => (
                                    <ItemCard key={index} item={item} />
                                ))}
                            </div>
                            {paginatedItems.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    <p>ไม่พบรายการวัตถุดิบ</p>
                                </div>
                            )}
                           {totalPages > 1 && (
                             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                           )}
                        </div>  
                    </main>
                </div>
            </div>
            <AddCategoryModal 
                isOpen={isAddCategoryModalOpen}
                onClose={() => setAddCategoryModalOpen(false)}
                onAddCategory={handleAddCategory}
                iconOptions={iconOptions}
            />
        </>
    );
}