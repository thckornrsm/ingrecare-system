// app/(backoffice)/allingredient/page.jsx

"use client";
import React, { useState, useMemo, useEffect } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import DeletedModal from "@/components/DeletedModal";
import EditModal from "@/components/EditModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Trash2, PencilLine } from 'lucide-react';

// ExpiryStatus Component
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

// Main Page
export default function AllIngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

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
                        category_id: item.ingredient.category.category_name,
                        expiryDate: latestExpiryDate || null,
                        daysLeft: daysLeft,
                        quantity: item.quantity,
                        unit_type: item.unit.unit_name,
                    };
                }).filter(Boolean);
                
                setIngredients(formattedIngredients);

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
    
    // Filtering and Sorting
    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter(item => category === 'ทั้งหมด' || item.category_id === category)
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, category, ingredients]);

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

    const handleOpenDeletedModal = (ingredient) => {
        const itemToForceDelete = {
            ...ingredient,
            count: 0,
        };
        setSelectedIngredient(itemToForceDelete);
        setIsDeletedModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto py-9 px-25">
                <div className="mb-8">
                    <h1 className="text-black text-3xl font-bold">วัตถุดิบทั้งหมดในสต็อก</h1>
                    <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับวัตถุดิบทั้งหมดในสต็อก</p>
                </div>

                {/* Filter and Search */}
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
                                                <div className="flex justify-start space-x-1">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(item)} 
                                                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                                                        <PencilLine size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenDeletedModal(item)}
                                                        className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center p-8 text-gray-500">
                                            ไม่พบข้อมูล
                                        </td>
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
                        totalItems={filteredItems.length}
                    />
                )}
            </main>

            {/* Modals */}
            {selectedIngredient && (
                <>
                    <DeletedModal
                        isOpen={isDeletedModalOpen}
                        onClose={() => setIsDeletedModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        itemToDelete={selectedIngredient}
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