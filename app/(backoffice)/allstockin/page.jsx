// app/(backoffice)/allstockin/page.jsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import DeletedModal from "@/components/DeletedModal";
import EditModal from "@/components/EditModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, PencilLine, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

/*  โค้ดเดิม (เอาออกแล้วใช้โค้ดใน CustomDropdown.jsx แทน ไม่ได้ลบเพราะเผื่อเชื่อมไม่เหมือนกัน)

const CustomDropdown = ({ categories, selectedCategory, onSelectCategory }) => {
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
                        <li key={cat.name} onClick={() => handleSelect(cat.name)} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100">
                            {cat.icon}
                            <span>{cat.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
*/

/*  โค้ดเดิม (เอาออกแล้วใช้โค้ดใน DeletedModal.jsx แทน ไม่ได้ลบเพราะเผื่อเชื่อมไม่เหมือนกัน)

const EditStockinModal = ({ isOpen, onClose, onSave, itemData }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (itemData) {
            setFormData({
                id: itemData.id,
                name: itemData.name || '',
                quantity: itemData.quantity || '',
                received_date: itemData.received_date ? new Date(itemData.received_date).toISOString().split('T')[0] : '',
                expiry_date: itemData.expiry_date ? new Date(itemData.expiry_date).toISOString().split('T')[0] : '',
            });
            setErrors({});
        }
    }, [itemData, isOpen]);

    if (!isOpen || !itemData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name || formData.name.trim() === '') newErrors.name = 'ชื่อห้ามเป็นค่าว่าง';
        if (parseFloat(formData.quantity) <= 0 || isNaN(parseFloat(formData.quantity))) newErrors.quantity = 'จำนวนต้องมากกว่า 0';
        if (!formData.received_date) newErrors.received_date = 'วันที่นำเข้าห้ามว่าง';
        if (!formData.expiry_date) newErrors.expiry_date = 'วันหมดอายุห้ามว่าง';
        if (new Date(formData.expiry_date) < new Date(formData.received_date)) newErrors.expiry_date = 'วันหมดอายุต้องไม่ก่อนวันที่นำเข้า';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(formData);
        } else {
            toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง');
        }
    };
    
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSave();
      }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E5E5]">
                    <h3 className="text-lg font-semibold text-gray-800">แก้ไขรายการ: {itemData.name} (ID: {itemData.id})</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">ชื่อวัตถุดิบ</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} onKeyDown={handleKeyDown} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3FA170]'}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">จำนวน</label>
                            <input name="quantity" type="number" min={0} value={formData.quantity || ''} onChange={handleChange} onKeyDown={handleKeyDown} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3FA170]'}`} />
                            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">วันที่นำเข้า</label>
                            <input name="received_date" type="date" value={formData.received_date || ''} onChange={handleChange} onKeyDown={handleKeyDown} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${errors.received_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3FA170]'}`} />
                            {errors.received_date && <p className="mt-1 text-sm text-red-500">{errors.received_date}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">วันหมดอายุ</label>
                            <input name="expiry_date" type="date" value={formData.expiry_date || ''} onChange={handleChange} onKeyDown={handleKeyDown} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${errors.expiry_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3FA170]'}`} />
                            {errors.expiry_date && <p className="mt-1 text-sm text-red-500">{errors.expiry_date}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#2F7A5E]">แก้ไขข้อมูล</button>
                </div>
            </div>
        </div>
    );
};
*/

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

// Main Page
export default function AllStockin() {
    const [ingredients, setIngredients] = useState(processedInitialData);
    const [stockinHistory, setStockinHistory] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);

    const [category, setCategory] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [itemsPerPage, setItemsPerPage] = useState(20);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/stockin');
                if (!res.ok) throw new Error((await res.json()).error || 'ไม่สามารถดึงข้อมูลได้');
                const batches = await res.json();
                const formattedHistory = batches.flatMap(batch =>
                    batch.stockins.map(stockin => ({
                        id: stockin.stockin_id,
                        name: stockin.ingredient.name,
                        category: stockin.ingredient.category.category_name,
                        received_date: stockin.received_date,
                        expiry_date: stockin.expiry_date,
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
    
    // Filtering and Sorting
    const filteredIngredients = useMemo(() => {
        return stockinHistory
            .filter(item => category === 'ทั้งหมด' || item.category_id === category)
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, category, stockinHistory]);

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
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

    const handleDeleteClick = (item) => setItemToDelete(item);
    const handleEditClick = (item) => setItemToEdit(item);
    
/*  โค้ดเดิม
    const handleSaveEdit = async (formData) => {
        const loadingToast = toast.loading('กำลังบันทึกการแก้ไข...');
        try {
            const res = await fetch(`/api/stockin/${formData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'ไม่สามารถบันทึกได้');
            
            const { updatedItem } = await res.json();
            
            setStockinHistory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
            toast.success('บันทึกการแก้ไขสำเร็จ!', { id: loadingToast });

        } catch (err) {
            toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
        } finally {
            setItemToEdit(null);
        }
    };
*/

/*  โค้ดเดิม
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const loadingToast = toast.loading('กำลังลบข้อมูล...');
        try {
            const res = await fetch(`/api/stockin/${itemToDelete.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).error || 'ไม่สามารถลบข้อมูลได้');
            setStockinHistory(prev => prev.filter(item => item.id !== itemToDelete.id));
            toast.success('ลบข้อมูลสำเร็จ!', { id: loadingToast });
        } catch (err) {
            toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
        } finally {
            setItemToDelete(null);
        }

    };
*/

    const handleOpenDeletedModal = (ingredient) => {
        const itemToForceDelete = {
            ...ingredient,
            count: 0,
        };
        setSelectedIngredient(itemToForceDelete);
        setIsDeletedModalOpen(true);
    };

    const handleSaveChanges = (updatedIngredient) => {
        if (updatedIngredient) {
            setIngredients(prev => prev.map(item =>
                item.id === updatedIngredient.id ? updatedIngredient : item
            ));
            console.log("Saved:", updatedIngredient);
            setIsEditModalOpen(false);
            setSelectedIngredient(null);
        }
    }

    const handleConfirmDelete = () => {
        if (selectedIngredient) {
            setIngredients(prev => prev.filter(item => item.id !== selectedIngredient.id));
            console.log("Deleted:", selectedIngredient.name);
            setIsDeletedModalOpen(false);
        }
    };

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
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
                
                <Toaster position="top-right" />
{/* 
                <ConfirmationModal 
                    isOpen={!!itemToDelete} 
                    onClose={() => setItemToDelete(null)} 
                    onConfirm={handleConfirmDelete} 
                    itemToDelete={itemToDelete} />
                <EditStockinModal 
                    isOpen={!!itemToEdit} 
                    onClose={() => setItemToEdit(null)}
                    onSave={handleSaveEdit} 
                    itemData={itemToEdit} />
*/}
                <div className="mb-8">
                    <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
                    <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
                </div>

                {/* Filters and Search */}  
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
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-sm text-gray-500 capitalize bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <SortableHeader label="ID" columnKey="id" />
                                    <SortableHeader label="ชื่อ" columnKey="name" />
                                    <SortableHeader label="หมวดหมู่" columnKey="category" />
                                    <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                                    <SortableHeader label="วันหมดอายุ" columnKey="expiry_date" />
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
                                ) : sortedAndPaginatedIngredients.length > 0 ? (sortedAndPaginatedIngredients.map((item) => (
                                    <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">{item.id}</td>
                                        <td className="py-3 px-4">{item.name}</td>
                                        <td className="py-3 px-4">{item.category}</td>
                                        <td className="py-3 px-4">{formatDate(item.received_date)}</td>
                                        <td className="py-3 px-4">{formatDate(item.expiry_date)}</td>
                                        <td className="py-3 px-4">{item.quantity.toFixed(2)}</td>
                                        <td className="py-3 px-4">{item.unit}</td>
                                        <td className="py-3 px-4">
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