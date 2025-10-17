// app/(backoffice)/expired/page.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2'; // Added missing import for Swal

import { 
    Search, ChevronsUpDown, ChevronUp, ChevronDown,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal 
} from 'lucide-react';

// --- Icon Mapping (remains for potential future use) ---
const categoryIconMap = {
    'เนื้อสัตว์': <Beef size={16} className="text-gray-500"/>,
    'ผัก': <Leaf size={16} className="text-gray-500"/>,
    'ทะเล': <Fish size={16} className="text-gray-500"/>,
    'ผลไม้': <Apple size={16} className="text-gray-500"/>,
    'เครื่องปรุง': <SprayCan size={16} className="text-gray-500"/>,
    'อื่นๆ': <MoreHorizontal size={16} className="text-gray-500"/>,
};

// --- Main Expired Ingredients Page ---
export default function ExpiredPage() {
    // --- States ---
    const [allExpiredItems, setAllExpiredItems] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // States for UI controls
    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'expiry_date', direction: 'ascending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stockinRes, categoriesRes] = await Promise.all([
                    fetch('/api/stockin'),
                    fetch('/api/categories')
                ]);

                if (!stockinRes.ok) throw new Error('ไม่สามารถดึงข้อมูลสต็อกได้');
                if (!categoriesRes.ok) throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');

                const batches = await stockinRes.json();
                
                const processedAndExpired = batches.flatMap(batch => 
                    batch.stockins.map(stockin => {
                        const expiryDate = new Date(stockin.expiry_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return {
                            id: `${batch.batch_id}-${stockin.ingredient.name}`,
                            batch_id: batch.batch_id,
                            name: stockin.ingredient.name,
                            expiry_date: expiryDate.toISOString().split('T')[0],
                            daysLeft: diffDays,
                            category_id: stockin.ingredient.category.category_name,
                            quantity: stockin.quantity,
                            unit_type: stockin.unit.unit_name,
                        };
                    })
                ).filter(item => item.daysLeft <= 0);

                setAllExpiredItems(processedAndExpired);

                // MODIFIED: Standardized category fetching as per prototype
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

    // --- SweetAlert2 Handlers ---
    const handleEdit = (item) => {
        Swal.fire({
            title: `แก้ไข (ตัวอย่าง): ${item.name}`,
            text: "ฟังก์ชันนี้เป็นเพียงตัวอย่าง ยังไม่มีการบันทึกข้อมูลลงฐานข้อมูลจริง",
            icon: 'info',
            confirmButtonText: 'รับทราบ',
        });
    };

    const handleDelete = (itemToDelete) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `คุณต้องการลบ "${itemToDelete.name}" (Batch: ${itemToDelete.batch_id}) ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'rgba(203, 87, 87, 1)',
            cancelButtonColor: '#3F855A',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                setAllExpiredItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
                Swal.fire('ลบแล้ว!', 'รายการถูกลบออกจากหน้าแสดงผลแล้ว (ตัวอย่าง)', 'success');
            }
        });
    };
    
    // --- Filtering and Sorting Logic using useMemo ---
    const filteredItems = useMemo(() => {
        return allExpiredItems
            .filter(item => category === 'ทั้งหมด' || item.category_id === category)
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allExpiredItems, searchTerm, category]);

    const sortedAndPaginatedItems = useMemo(() => {
        let sortedData = [...filteredItems];
        if (sortConfig.key) {
            sortedData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, sortConfig, currentPage, itemsPerPage]);

    // --- Helper Functions ---
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    
    // NEW: Handlers for filtering and searching (as per prototype)
    const handleSelectCategory = (selected) => {
        setCategory(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };
    
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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

    // --- Render ---
    return (

                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-black text-3xl font-bold">วัตถุดิบหมดอายุ</h1>
                            <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับล็อตวัตถุดิบที่หมดอายุแล้ว</p>
                        </div>

                        {/* MODIFIED: Filter and Search Controls (as per prototype) */}
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
                                            <SortableHeader label="ID" columnKey="batch_id" />
                                            <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                                            <SortableHeader label="วันที่หมดอายุ" columnKey="expiry_date" />
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
                                                    <td className="py-3 px-4">{item.batch_id}</td>
                                                    <td className="py-3 px-4">{item.name}</td>
                                                    <td className="py-3 px-4">{formatDate(item.expiry_date)}</td>
                                                    <td className="py-3 px-4">{item.category_id}</td>
                                                    <td className="py-3 px-4">{item.quantity.toFixed(2)}</td>
                                                    <td className="py-3 px-4">{item.unit_type}</td>
                                                    <td className="py-3">
                                                        <div className="flex justify-start space-x-1">
                                                            <button onClick={() => handleEdit(item)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                                                <Icon icon="mynaui:edit" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item)} className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                                                                <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">ไม่พบข้อมูลวัตถุดิบที่หมดอายุ</td></tr>
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
                                totalItems={filteredItems.length}
                            />
                        )}
                    </div>
                </main>

    );
}