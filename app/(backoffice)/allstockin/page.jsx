"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from '@/components/Sidebar';
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import DeletedModal from "@/components/DeletedModal";
import EditModal from "@/components/EditModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';


const processedInitialData = initialIngredientsData.map((ingredient, index) => {
    const received = new Date();
    received.setDate(received.getDate() - (index * 2 + 5));
    const expiry = new Date(received);
    expiry.setDate(expiry.getDate() + ingredient.shelflife_day);
    return {
        ...ingredient,
        received_date: received.toISOString().split('T')[0],
        expiry_date: expiry.toISOString().split('T')[0],
    };
});

// Main
export default function AllStockin() {
    const [ingredients, setIngredients] = useState(processedInitialData);
    const [stockinHistory, setStockinHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // ดึงข้อมูลสำหรับ Dropdown
    const categories = ["ทั้งหมด", ...new Set(stockinHistory.map(item => item.category))];
    const unitsForDropdown = [...new Set(stockinHistory.map(item => item.unit))].sort();
    const categoriesForDropdown = categories.filter(c => c !== 'ทั้งหมด');

    // Data Fetching
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
                        category: stockin.ingredient.category.category_name,
                        received_date: stockin.received_date, // Keep as string for sorting
                        expiry_date: stockin.expiry_date,     // Keep as string for sorting
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

    /*
    const categoryOptions = useMemo(() => {
        if (stockinHistory.length === 0) return [{ name: 'ทั้งหมด', icon: categoryIconMap['ทั้งหมด'] }];
        const uniqueCategoryNames = ["ทั้งหมด", ...new Set(stockinHistory.map(item => item.category))];
        return uniqueCategoryNames.map(name => ({
            name: name,
            icon: categoryIconMap[name] || <MoreHorizontal size={16} className="text-gray-500" />
        }));
    }, [stockinHistory]);
    */

    // Filtering and Sorting
    const filteredIngredients = useMemo(() => {
        let processData = [...ingredients];
        if (searchTerm) {
            processData = processData.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (category && category !== 'ทั้งหมด') {
            processData = processData.filter(item => item.category_id === category);
        }
        return processData;
    }, [searchTerm, category, ingredients]);

    const sortedAndPaginatedIngredients = useMemo(() => {
            let sortedData = [...filteredIngredients];
            if (sortConfig.key) {
                sortedData.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                });
            }
            const startIndex = (currentPage - 1) * itemsPerPage;
            return sortedData.slice(startIndex, startIndex + itemsPerPage);
        }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

    // Helpers and Handlers
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

    const handleSelectCategory = (selected) => {
        setCategory(selected);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
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

    const handleOpenEditModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsEditModalOpen(true);
    };

    const handleOpenDeletedModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsDeletedModalOpen(true);
    };

    const handleSaveChanges = (updatedIngredient) => {
        setIngredients(prev => prev.map(item =>
            item.id === updatedIngredient.id ? updatedIngredient : item
        ));
        console.log("Saved:", updatedIngredient);
        setIsEditModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedIngredient) {
            setIngredients(prev => prev.filter(item => item.id !== selectedIngredient.id));
            console.log("Deleted:", selectedIngredient.name);
            setIsDeletedModalOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-10 sm:px-14 md:px-25">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
                            <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
                        </div>

                        {/* Filter and Search */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
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
                                    className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#3FA170]" 
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="text-sm text-gray-500 capitalize bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <SortableHeader label="ID" columnKey="id" />
                                            <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                                            <SortableHeader label="หมวดหมู่" columnKey="category" />
                                            <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                                            <SortableHeader label="วันที่หมดอายุ" columnKey="expiry_date" />
                                            <SortableHeader label="จำนวนคงเหลือ" columnKey="quantity" />
                                            <SortableHeader label="หน่วยนับ" columnKey="unit" />
                                            <th scope="col" className="py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan="7" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                                        ) : sortedAndPaginatedIngredients.length > 0 ? (sortedAndPaginatedIngredients.map((ingredient) => (
                                            <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">{ingredient.id}</td>
                                                <td className="py-3 px-4">{ingredient.name}</td>
                                                <td className="py-3 px-4">{ingredient.category}</td>
                                                <td className="py-3 px-4">{formatDate(ingredient.received_date)}</td>
                                                <td className="py-3 px-4">{formatDate(ingredient.expiry_date)}</td>
                                                <td className="py-3 px-4">{ingredient.quantity.toFixed(2)}</td>
                                                <td className="py-3 px-4">{ingredient.unit}</td>
                                                <td className="py-3 ">
                                                    <div className="flex justify-center space-x-1">
                                                        <button
                                                            onClick={() => handleOpenEditModal(ingredient)}
                                                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenDeletedModal(ingredient)} 
                                                            className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center p-8 text-gray-500">ไม่พบข้อมูล</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Pagination */}
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
            </div>

            {/* Modals */}
            {selectedIngredient && (
                <>
                    <DeletedModal
                        isOpen={isDeletedModalOpen}
                        onClose={() => setIsDeletedModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        itemName={selectedIngredient.name}
                    />
                    <EditModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleSaveChanges}
                        ingredient={selectedIngredient}
                        categories={categoriesForDropdown}
                        units={unitsForDropdown}
                        formType="stock-in"
                    />
                </>
            )}
        </div>
    );
}