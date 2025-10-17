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

const categoryIconMap = {
    'เนื้อสัตว์': <Beef size={16} className="text-gray-500"/>,
    'ผัก': <Leaf size={16} className="text-gray-500"/>,
    'ทะเล': <Fish size={16} className="text-gray-500"/>,
    'ผลไม้': <Apple size={16} className="text-gray-500"/>,
    'เครื่องปรุง': <SprayCan size={16} className="text-gray-500"/>,
    'อื่นๆ': <MoreHorizontal size={16} className="text-gray-500"/>,
};

// --- Helper Component for Expiry Status Display ---
const ExpiryStatus = ({ date, days }) => {
    if (!date || days === Infinity) {
        return <span className="text-gray-500">N/A</span>;
    }

    const formattedDate = new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });

    if (days < 1) {
        return (
            <div className="flex flex-col">
                <span className="font-medium text-red-600">{formattedDate}</span>
                <span className="text-xs text-red-500">หมดอายุแล้ว</span>
            </div>
        );
    }
    if (days <= 7) { // Warning for items expiring within a week
        return (
            <div className="flex flex-col">
                <span className="font-medium text-amber-600">{formattedDate}</span>
                <span className="text-xs text-amber-500">เหลือ {days} วัน</span>
            </div>
        );
    }
    return (
        <div className="flex flex-col">
            <span className="font-medium text-gray-700">{formattedDate}</span>
            <span className="text-xs text-gray-500">เหลือ {days} วัน</span>
        </div>
    );
};


export default function AllIngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryRes, stockinRes, categoriesRes] = await Promise.all([
                    fetch('/api/inventory'),
                    fetch('/api/stockin'),
                    fetch('/api/categories')
                ]);

                if (!inventoryRes.ok) throw new Error('ไม่สามารถดึงข้อมูลสต็อกปัจจุบันได้');
                if (!stockinRes.ok) throw new Error('ไม่สามารถดึงข้อมูลวันหมดอายุได้');
                if (!categoriesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');

                const inventoryData = await inventoryRes.json();
                const stockinBatches = await stockinRes.json();
                const dbCategories = await categoriesRes.json();
                
                const allStockins = stockinBatches.flatMap(batch => batch.stockins);

                const latestExpiryMap = allStockins.reduce((map, stockin) => {
                    if (!stockin.ingredient || !stockin.ingredient.ingredient_id) {
                        return map;
                    }
                    const ingredientId = stockin.ingredient.ingredient_id;
                    const expiryDate = new Date(stockin.expiry_date);

                    if (!map[ingredientId] || expiryDate > map[ingredientId]) {
                        map[ingredientId] = expiryDate;
                    }
                    return map;
                }, {});
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const formattedIngredients = inventoryData.map(item => {
                    if (!item.ingredient || !item.ingredient.category || !item.unit) return null;
                    
                    const ingredientId = item.ingredient.ingredient_id;
                    const latestExpiryDate = latestExpiryMap[ingredientId];
                    
                    let daysLeft = Infinity;
                    if (latestExpiryDate) {
                        const diffTime = latestExpiryDate - today;
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    return {
                        id: ingredientId,
                        name: item.ingredient.name,
                        expiryDate: latestExpiryDate || null,
                        daysLeft: daysLeft,
                        category_id: item.ingredient.category.category_name,
                        quantity: item.quantity,
                        unit_type: item.unit.unit_name,
                    };
                }).filter(Boolean);
                
                setIngredients(formattedIngredients);

                // This is for the prototype that does not include icons in the dropdown
                const dynamicCategoryOptions = [
                    { name: 'ทั้งหมด' },
                    ...dbCategories.map(cat => ({
                        name: cat.category_name,
                    }))
                ];
                setCategoryOptions(dynamicCategoryOptions);

            } catch (err) {
                setError(err.message);
                console.error("Fetch Data Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter(item => category === 'ทั้งหมด' || item.category_id === category)
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [ingredients, searchTerm, category]);

    const sortedAndPaginatedIngredients = useMemo(() => {
        let sortedData = [...filteredIngredients];
        if (sortConfig.key) {
            sortedData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

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
    
    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

    // --- Handlers for filtering and searching (as per prototype) ---
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
                <button
                    onClick={() => requestSort(columnKey)}
                    className="flex items-center gap-2 group w-full text-left"
                >
                    <span>{label}</span>
                    <SortIndicator direction={sortConfig.direction} isActive={isActive} />
                </button>
            </th>
        );
    };

    return (

            <main className="flex-1 overflow-y-auto py-9 px-25">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">วัตถุดิบทั้งหมดในสต็อก</h1>
                        <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับวัตถุดิบทั้งหมดในสต็อก</p>
                    </div>

                    {/* Filter and Search Controls (Modified to match prototype) */}
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
                                        <SortableHeader label="วันหมดอายุล่าสุด" columnKey="daysLeft" />
                                        <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                                        <SortableHeader label="จำนวนคงเหลือ" columnKey="quantity" />
                                        <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                                        <th scope="col" className="py-3 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="7" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="7" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                                    ) : sortedAndPaginatedIngredients.length > 0 ? (
                                        sortedAndPaginatedIngredients.map((ingredient) => (
                                            <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-500">{ingredient.id}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{ingredient.name}</td>
                                                <td className="py-2 px-4">
                                                   <ExpiryStatus date={ingredient.expiryDate} days={ingredient.daysLeft} />
                                                </td>
                                                <td className="py-3 px-4">{ingredient.category_id}</td>
                                                <td className="py-3 px-4">{ingredient.quantity.toFixed(2)}</td>
                                                <td className="py-3 px-4">{ingredient.unit_type}</td>
                                                <td className="py-3 ">
                                                    <div className="flex justify-center space-x-1">
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
                                        <tr>
                                            <td colSpan="7" className="text-center p-8 text-gray-500">
                                                ไม่พบข้อมูลวัตถุดิบในสต็อก
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {totalPages > 0 && !isLoading && !error && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            totalItems={filteredIngredients.length}
                        />
                    )}
                </div>
            </main>
    )
}