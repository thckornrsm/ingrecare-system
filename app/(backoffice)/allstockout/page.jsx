"use client";
import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import { Icon } from '@iconify/react';
import { 
    Search, ChevronsUpDown, ChevronUp, ChevronDown,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal 
} from 'lucide-react';

// Icon mapping for categories (remains for potential future use, but not used in dropdown)
const categoryIconMap = {
    'เนื้อสัตว์': <Beef size={16} className="text-gray-500"/>,
    'ผัก': <Leaf size={16} className="text-gray-500"/>,
    'ทะเล': <Fish size={16} className="text-gray-500"/>,
    'ผลไม้': <Apple size={16} className="text-gray-500"/>,
    'เครื่องปรุง': <SprayCan size={16} className="text-gray-500"/>,
    'อื่นๆ': <MoreHorizontal size={16} className="text-gray-500"/>,
};

export default function AllStockout() {
    // Data states
    const [stockoutHistory, setStockoutHistory] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stockoutRes, categoriesRes] = await Promise.all([
                    fetch('/api/stockout'),
                    fetch('/api/categories')
                ]);

                if (!stockoutRes.ok) throw new Error('ไม่สามารถดึงข้อมูลการเบิกจ่ายได้');
                if (!categoriesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');

                // Process stock-out data
                const stockoutData = await stockoutRes.json();
                const formattedHistory = stockoutData.map(item => ({
                    id: item.stockout_id,
                    name: item.ingredient.name,
                    out_datetime: new Date(item.out_date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
                    category_id: item.ingredient.category.category_name,
                    quantity: item.quantity,
                    unit_type: item.unit.unit_name,
                    _out_datetime_raw: new Date(item.out_date), // Raw date for sorting
                }));
                setStockoutHistory(formattedHistory);

                // Process categories data (without icons)
                const dbCategories = await categoriesRes.json();
                const formattedCategories = [
                    { name: 'ทั้งหมด' },
                    ...dbCategories.map(cat => ({
                        name: cat.category_name,
                    }))
                ];
                setCategoryOptions(formattedCategories);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = stockoutHistory
      .filter(item => category === 'ทั้งหมด' || item.category_id === category)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedAndPaginatedItems = useMemo(() => {
        let sortedData = [...filteredItems];
        const key = sortConfig.key;
        const sortKey = key.includes('datetime') ? `_${key}_raw` : key;

        if (key) {
            sortedData.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortKey] > b[sortKey]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, sortConfig, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    
    // --- Handlers (newly added based on the source component) ---
    const handleSelectCategory = (selected) => {
        setCategory(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    const SortIndicator = ({ direction, isActive }) => {
        if (!isActive) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100" />;
        if (direction === 'ascending') return <ChevronUp size={16} className="text-gray-800" />;
        return <ChevronDown size={16} className="text-gray-800" />;
    };

    const SortableHeader = ({ label, columnKey, className }) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <th scope="col" className={`py-3 px-4 font-medium select-none ${className}`}>
                <button onClick={() => requestSort(columnKey)} className="flex items-center gap-2 group w-full text-left">
                    <span>{label}</span>
                    <SortIndicator direction={sortConfig.direction} isActive={isActive} />
                </button>
            </th>
        );
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-black text-3xl font-bold">ประวัติการเบิกจ่าย</h1>
                            <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับการเบิกจ่ายวัตถุดิบทั้งหมดในระบบ</p>
                        </div>

                        {/* Filter and Search Controls (Modified Section) */}
                        <div className="flex items-center gap-4 mb-6">
                            <CustomDropdown 
                                label="หมวดหมู่" 
                                categories={categoryOptions} 
                                selectedCategory={category} 
                                onSelectCategory={handleSelectCategory} 
                            />
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="ค้นหาจากชื่อวัตถุดิบ..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="text-sm text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <SortableHeader label="ID" columnKey="id" />
                                            <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                                            <SortableHeader label="วันและเวลาที่เบิกจ่าย" columnKey="out_datetime" />
                                            <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                                            <SortableHeader label="จำนวน" columnKey="quantity" />
                                            <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                                            <th scope="col" className="py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan="7" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                                        ) : sortedAndPaginatedItems.length > 0 ? (
                                            sortedAndPaginatedItems.map((item) => (
                                                <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4">{item.id}</td>
                                                    <td className="py-3 px-4">{item.name}</td>
                                                    <td className="py-3 px-4">{item.out_datetime}</td>
                                                    <td className="py-3 px-4">{item.category_id}</td>
                                                    <td className="py-3 px-4">{item.quantity.toFixed(2)}</td>
                                                    <td className="py-3 px-4">{item.unit_type}</td>
                                                    <td className="py-3">
                                                        <div className="flex justify-start space-x-1">
                                                            <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                                                <Icon icon="mynaui:edit" className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                                                                <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">ไม่พบข้อมูล</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {!isLoading && !error && filteredItems.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                totalItems={filteredItems.length}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}