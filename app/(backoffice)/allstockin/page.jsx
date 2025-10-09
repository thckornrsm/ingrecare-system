"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Search, ChevronsUpDown, ChevronUp, ChevronDown,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { Icon } from '@iconify/react';
import Sidebar from "../../../components/Sidebar";

// ========= Inline Components =========

// CustomDropdown to filter by category
const CustomDropdown = ({ label, categories, selectedCategory, onSelectCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (categoryName) => {
        onSelectCategory(categoryName);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full md:w-56" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <div className="flex items-center gap-2">
                    {categories.find(c => c.name === selectedCategory)?.icon}
                    <span className="flex-grow text-left">{selectedCategory}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {categories.map((cat) => (
                        <li
                            key={cat.name}
                            onClick={() => handleSelect(cat.name)}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {cat.icon}
                            <span>{cat.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Pagination component with "Rows per page" and item count
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600 px-1 py-2">
             <div>
                <span className="font-medium">แสดงรายการ {startItem}-{endItem}</span> จาก {totalItems}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span>จำนวนต่อหน้า:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(e.target.value)}
                        className="border-gray-300 border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <span className="font-medium">{currentPage} / {totalPages || 1}</span>
                    <button onClick={handlePrevious} disabled={currentPage === 1} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};


// Icon map for categories
const categoryIconMap = {
    'เนื้อสัตว์': <Beef size={16} className="text-gray-500" />,
    'ผัก': <Leaf size={16} className="text-gray-500" />,
    'ทะเล': <Fish size={16} className="text-gray-500" />,
    'ผลไม้': <Apple size={16} className="text-gray-500" />,
    'เครื่องปรุง': <SprayCan size={16} className="text-gray-500" />,
    'อื่นๆ': <MoreHorizontal size={16} className="text-gray-500" />,
    'ทั้งหมด': <Utensils size={16} className="text-gray-500" />
};

export default function AllStockin() {
    // Data states
    const [stockinHistory, setStockinHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI and Filter states
    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/stockin');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
                }
                const batches = await res.json();

                const formattedHistory = batches.flatMap(batch =>
                    batch.stockins.map(stockin => ({
                        id: stockin.stockin_id,
                        name: stockin.ingredient.name,
                        received_date: stockin.received_date, // Keep as string for sorting
                        expiry_date: stockin.expiry_date,     // Keep as string for sorting
                        category: stockin.ingredient.category.category_name,
                        quantity: stockin.quantity,
                        unit: stockin.unit.unit_name,
                    }))
                );
                setStockinHistory(formattedHistory);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const categoryOptions = useMemo(() => {
        if (stockinHistory.length === 0) return [{ name: 'ทั้งหมด', icon: categoryIconMap['ทั้งหมด'] }];
        const uniqueCategoryNames = ["ทั้งหมด", ...new Set(stockinHistory.map(item => item.category))];
        return uniqueCategoryNames.map(name => ({
            name: name,
            icon: categoryIconMap[name] || <MoreHorizontal size={16} className="text-gray-500" />
        }));
    }, [stockinHistory]);
    
    // Core Logic: Filtering based on search and category state
    const filteredIngredients = useMemo(() => {
        return stockinHistory
            .filter(item => category === 'ทั้งหมด' || item.category === category)
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [stockinHistory, category, searchTerm]);


    // Core Logic: Sorting and Paginating the filtered data
    const sortedAndPaginatedIngredients = useMemo(() => {
        let sortedData = [...filteredIngredients];
        const key = sortConfig.key;
        if (key) {
            sortedData.sort((a, b) => {
                if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

    // Total pages calculation for pagination
    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

    // Handlers to update UI state
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page
    };

    const handleSelectCategory = (selected) => {
        setCategory(selected);
        setCurrentPage(1); // Reset to first page
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
    };

    // Sub-components for table rendering
    const SortIndicator = ({ direction, isActive }) => {
        if (!isActive) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100" />;
        if (direction === 'ascending') return <ChevronUp size={16} className="text-gray-800" />;
        return <ChevronDown size={16} className="text-gray-800" />;
    };

    const SortableHeader = ({ label, columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <th scope="col" className="py-3 px-4 font-medium select-none">
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
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
                            <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
                        </div>

                        {/* Filter and Search Controls Section */}
                        <div className="flex items-center gap-4 mb-6">
                             <CustomDropdown 
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
                                            <SortableHeader label="ชื่อ" columnKey="name" />
                                            <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                                            <SortableHeader label="วันหมดอายุ" columnKey="expiry_date" />
                                            <SortableHeader label="หมวดหมู่" columnKey="category" />
                                            <SortableHeader label="จำนวน" columnKey="quantity" />
                                            <SortableHeader label="หน่วย" columnKey="unit" />
                                            <th scope="col" className="py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr><td colSpan="8" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan="8" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                                        ) : sortedAndPaginatedIngredients.length > 0 ? (sortedAndPaginatedIngredients.map((item) => (
                                            <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">{item.id}</td>
                                                <td className="py-3 px-4">{item.name}</td>
                                                <td className="py-3 px-4">{formatDate(item.received_date)}</td>
                                                <td className="py-3 px-4">{formatDate(item.expiry_date)}</td>
                                                <td className="py-3 px-4">{item.category}</td>
                                                <td className="py-3 px-4">{item.quantity.toFixed(2)}</td>
                                                <td className="py-3 px-4">{item.unit}</td>
                                                <td className="py-3 px-4">
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
                                            <tr><td colSpan="8" className="text-center p-8 text-gray-500">ไม่พบข้อมูล</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Pagination Section */}
                        {!isLoading && !error && filteredIngredients.length > 0 && (
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
            </div>
        </div>
    );
}