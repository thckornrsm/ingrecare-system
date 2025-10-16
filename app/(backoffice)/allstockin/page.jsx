"use client";
import React, { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import EditModal from "@/components/EditModal";
import DeletedModal from "@/components/DeletedModal";
import { Icon } from '@iconify/react';
import { Search, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

const initialIngredientsData = [
    { id: 100001, name: "เนื้อวากิวพรีเมียม", shelflife_day: 7, category_id: "เนื้อสัตว์", quantity: 10.00, unit_type: "kg.", },
    { id: 100002, name: "ผักกาดขาว", shelflife_day: 10, category_id: "ผัก", quantity: 2.50, unit_type: "kg.", },
    { id: 100003, name: "เนื้อหมูสับ", shelflife_day: 7, category_id: "เนื้อสัตว์", quantity: 5.00, unit_type: "kg.", },
];

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

export default function AllStockin() {
    const [ingredients, setIngredients] = useState(processedInitialData);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const categoriesForFilter = ["ทั้งหมด", ...new Set(ingredients.map(item => item.category_id))];
    const categoriesForDropdown = [...new Set(ingredients.map(item => item.category_id))];
    const unitsForDropdown = [...new Set(ingredients.map(item => item.unit_type))];

    const handleOpenEditModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsEditModalOpen(true);
    };

    const handleOpenDeletedModal = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsDeletedModalOpen(true);
    };

    // --- ฟังก์ชันนี้ถูกอัปเดตให้คำนวณวันหมดอายุใหม่ ---
    const handleSaveChanges = (updatedDataFromModal) => {
        // 1. สร้าง object วันที่จาก received_date ที่อาจมีการแก้ไข
        const newReceivedDate = new Date(updatedDataFromModal.received_date);
        
        // 2. สร้าง object วันที่หมดอายุใหม่ โดยเริ่มจากวันที่นำเข้าใหม่
        const newExpiryDate = new Date(newReceivedDate);
        
        // 3. บวกจำนวนวัน (shelflife_day) ที่แก้ไขใหม่เข้าไป
        newExpiryDate.setDate(newReceivedDate.getDate() + Number(updatedDataFromModal.shelflife_day));

        // 4. สร้าง object ข้อมูลสุดท้ายที่จะบันทึก
        const finalUpdatedIngredient = {
            ...updatedDataFromModal,
            expiry_date: newExpiryDate.toISOString().split('T')[0] // แปลงกลับเป็น YYYY-MM-DD
        };

        setIngredients(prev => prev.map(item =>
            item.id === finalUpdatedIngredient.id ? finalUpdatedIngredient : item
        ));
        setIsEditModalOpen(false);
        console.log("Saved with recalculated expiry date:", finalUpdatedIngredient);
    };

    const handleConfirmDelete = () => {
        if (selectedIngredient) {
            setIngredients(prev => prev.filter(item => item.id !== selectedIngredient.id));
            setIsDeletedModalOpen(false);
        }
    };

    const filteredIngredients = useMemo(() => {
        let processData = [...ingredients];
        if (searchTerm) {
            processData = processData.filter((ing) => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (category !== 'ทั้งหมด') {
            processData = processData.filter((ing) => ing.category_id === category);
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

    const SortIndicator = ({ direction, isActive }) => {
        if (!isActive) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50" />;
        if (direction === 'ascending') return <ChevronUp size={16} className="text-gray-800" />;
        return <ChevronDown size={16} className="text-gray-800" />;
    };
    
    const SortableHeader = ({ label, columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <th scope="col" className="py-3 px-4 font-normal select-none">
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
                <main className="flex-1 overflow-y-auto py-9 px-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
                            <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
                        </div>

                        {/* Filter and Search */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                            <CustomDropdown
                                label="หมวดหมู่ "
                                categories={categoriesForFilter}
                                selectedCategory={category}
                                onSelectCategory={(cat) => { setCategory(cat); setCurrentPage(1); }}
                            />
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="ค้นหาจากชื่อวัตถุดิบ..." 
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                            <SortableHeader label="ชื่อ" columnKey="name" />
                                            <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                                            <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                                            <SortableHeader label="วันหมดอายุ" columnKey="expiry_date" />
                                            <SortableHeader label="จำนวน" columnKey="quantity" />
                                            <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                                            <th scope="col" className="py-3 px-2 font-normal"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAndPaginatedIngredients.map((ingredient) => (
                                            <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                                <td className="py-3 px-4">{ingredient.id}</td>
                                                <td className="py-3 px-4">{ingredient.name}</td>
                                                <td className="py-3 px-4">{ingredient.category_id}</td>
                                                <td className="py-3 px-4">{ingredient.received_date}</td>
                                                <td className="py-3 px-4">{ingredient.expiry_date}</td>
                                                <td className="py-3 px-4">{ingredient.quantity.toFixed(2)}</td>
                                                <td className="py-3 px-4">{ingredient.unit_type}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-start space-x-2">
                                                        <button onClick={() => handleOpenEditModal(ingredient)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200">
                                                            <Icon icon="mynaui:edit" className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleOpenDeletedModal(ingredient)} className="p-1.5 rounded-md text-red-500 hover:bg-red-100">
                                                            <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} totalItems={filteredIngredients.length} />}
                    </div>
                </main>
            </div>

            {/* Modal Components */}
            {selectedIngredient && (
                <>
                    <DeletedModal isOpen={isDeletedModalOpen} onClose={() => setIsDeletedModalOpen(false)} onConfirm={handleConfirmDelete} itemName={selectedIngredient.name} />
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
    )
}