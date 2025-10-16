// app/(backoffice)/expired/page.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import DeletedModal from "@/components/DeletedModal";
import EditModal from "@/components/EditModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';

// Main
export default function ExpiredPage() {
    const [allExpiredItems, setAllExpiredItems] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [ingredients, setIngredients] = useState(initialIngredientsData);
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // ดึงข้อมูลสำหรับ Dropdown
    const categories = ["ทั้งหมด", ...new Set(allExpiredItems.map(item => item.category_id))];
    const unitsForDropdown = [...new Set(allExpiredItems.map(item => item.unit_type))].sort();
    const categoriesForDropdown = categories.filter(c => c !== 'ทั้งหมด');

    // Data Fetching
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
                            category_id: stockin.ingredient.category.category_name,
                            expiry_date: expiryDate.toISOString().split('T')[0],
                            daysLeft: diffDays,
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

    // Filtering and Sorting Logic
    const filteredItems = useMemo(() => {
        let processData = [...items];
        if (searchTerm) {
            processData = processData.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (category && category !== 'ทั้งหมด') {
            processData = processData.filter(item => item.category_id === category);
        }
        return processData;
    }, [searchTerm, category, items]);

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

    // Helpers and Handlers
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
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
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
                            <h1 className="text-black text-3xl font-bold">วัตถุดิบหมดอายุ</h1>
                            <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับล็อตวัตถุดิบที่หมดอายุแล้ว</p>
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
                                            <SortableHeader label="ID" columnKey="batch_id" />
                                            <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                                            <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                                            <SortableHeader label="วันที่หมดอายุ" columnKey="expiry_date" />
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
                                        ) : sortedAndPaginatedItems.length > 0 ? (
                                            sortedAndPaginatedItems.map((ingredient) => (
                                                <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4">{ingredient.batch_id}</td>
                                                    <td className="py-3 px-4">{ingredient.name}</td>
                                                    <td className="py-3 px-4">{ingredient.category_id}</td>
                                                    <td className="py-3 px-4">{formatDate(ingredient.expiry_date)}</td>
                                                    <td className="py-3 px-4">{ingredient.quantity.toFixed(2)}</td>
                                                    <td className="py-3 px-4">{ingredient.unit_type}</td>
                                                    <td className="py-3">
                                                        <div className="flex justify-start space-x-1">
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
                                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">ไม่พบข้อมูล</td></tr>
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
                                totalItems={filteredItems.length}
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
                    />
                </>
            )}
        </div>
    );
}