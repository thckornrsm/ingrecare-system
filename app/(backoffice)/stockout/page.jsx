/* รายงานการเบิกจ่ายวัตถุดิบ */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Plus, Trash2, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';

// Toast Notification Component
const ToastNotification = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-lg border-l-4 shadow-lg ${bgColor} ${borderColor} animate-fade-in-right`}>
            <Icon className={textColor} />
            <div className={`ml-3 text-sm font-medium ${textColor}`}>{message}</div>
            <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex h-8 w-8 ${textColor} hover:bg-opacity-20`}>
                <X size={20} />
            </button>
        </div>
    );
};

// Confirmation Modal Component
const ConfirmationModal = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full mx-4 border">
            <div className="mx-auto w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mb-4">
                <Info size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">คุณต้องการยืนยันการเบิกจ่ายวัตถุดิบ</h2>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onClose}
                    className="px-8 py-2 text-sm font-semibold text-red-600 bg-white border border-red-500 rounded-md hover:bg-red-50"
                >
                    ยกเลิก
                </button>
                <button
                    onClick={onConfirm}
                    className="px-8 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    ยืนยัน
                </button>
            </div>
        </div>
    </div>
);

// Disburse Form Row Component
const DisburseFormRow = ({ item, onUpdate, onRemove, availableIngredients, units }) => {
    const [searchTerm, setSearchTerm] = useState(item.itemName || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        // Clear previous selection when user types
        onUpdate(item.id, { itemName: value, ingredient_id: null, unit: '', unit_id: null }); 

        if (value.length > 0) {
            const filtered = availableIngredients.filter(ing => 
                ing.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (ingredient) => {
        setSearchTerm(ingredient.name);
        // Automatically set the unit based on the selected ingredient
        const selectedUnit = units.find(u => u.unit_id === ingredient.unit_id);
        onUpdate(item.id, {
            itemName: ingredient.name,
            ingredient_id: ingredient.ingredient_id,
            unit: selectedUnit?.unit_name || '',
            unit_id: ingredient.unit_id
        });
        setSuggestions([]);
    };

    const handleQuantityChange = (value) => {
        if (value === '' || parseFloat(value) >= 0) {
            onUpdate(item.id, { quantity: value });
        }
    };

    const handleUnitChange = (e) => {
        const selectedUnitId = parseInt(e.target.value, 10);
        const selectedUnit = units.find(u => u.unit_id === selectedUnitId);
        onUpdate(item.id, {
            unit_id: selectedUnitId,
            unit: selectedUnit?.unit_name || ''
        });
    };

    return (
        <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
            <button onClick={() => onRemove(item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <Trash2 size={18} />
            </button>
            <form className="space-y-6">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อวัตถุดิบในสต็อก เช่น เนื้อหมูสันนอก, ผักกาดขาว"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click on suggestion
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"
                    />
                    {isFocused && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {suggestions.map(ing => (
                                <li 
                                    key={ing.ingredient_id} 
                                    onMouseDown={() => handleSelectSuggestion(ing)}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    {ing.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            จำนวนที่เบิกจ่าย <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            placeholder="เช่น 2.5, 10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            หน่วย <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={item.unit_id || ''}
                            onChange={handleUnitChange}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white ${!item.unit_id ? 'text-gray-400' : 'text-black'}`}
                            disabled={!item.ingredient_id}
                        >
                            <option value="" disabled>-</option>
                            {units.map(unit => (
                                <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

/* Main DisbursePage Page */
export default function DisbursePage() {
    const router = useRouter();
    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        itemName: '',
        ingredient_id: null,
        quantity: '',
        unit: '',
        unit_id: null,
    });

    const [items, setItems] = useState([createNewItem()]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all ingredients that could be in stock and all possible units
                const [ingRes, unitRes] = await Promise.all([
                    fetch('/api/ingredients'), // Fetches from the main ingredient catalog
                    fetch('/api/units')
                ]);
                if (!ingRes.ok || !unitRes.ok) throw new Error('Failed to fetch initial data');
                
                setAvailableIngredients(await ingRes.json());
                setUnits(await unitRes.json());

            } catch (error) {
                console.error("FETCH_ERROR", error);
                showToast('ไม่สามารถโหลดข้อมูลวัตถุดิบได้', 'error');
            }
        };
        fetchData();
    }, []);


    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleAddItem = () => setItems((prev) => [...prev, createNewItem()]);
    const handleRemoveItem = (id) =>
        setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
    const handleUpdateItem = (id, updated) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    const handleClearAll = () =>
        setItems((prev) => prev.map((i) => ({ ...createNewItem(), id: i.id })));

    const handleSubmit = () => {
        const isInvalid = items.some((i) => !i.ingredient_id || !i.quantity || Number(i.quantity) <= 0 || !i.unit_id);
        if (isInvalid) return showToast('การเบิกจ่ายวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        setIsModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsModalOpen(false);
        
        const payload = {
            description: `Stock-out on ${new Date().toLocaleDateString()}`,
            items: items.map(item => ({
                ingredient_id: item.ingredient_id,
                quantity: parseFloat(item.quantity),
                unit_id: item.unit_id,
            }))
        };

        try {
            const res = await fetch('/api/stockout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            showToast('การเบิกจ่ายวัตถุดิบสำเร็จ', 'success');
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error) {
            console.error("DISBURSE_ERROR", error);
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    };

    return (
        <>
                <main className="flex-1 overflow-y-auto py-9 px-10 sm:px-14 md:px-25">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-black text-3xl font-bold">เบิกจ่ายวัตถุดิบ</h1>
                            <p className="text-[#979999]">เพิ่มข้อมูลการเบิกจ่ายวัตถุดิบในแต่ละล็อต</p>
                        </div>
                        <button
                            onClick={handleAddItem}
                            className="w-full sm:w-auto justify-center px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors"
                        >
                            <Plus size={16} /> เพิ่มรายการวัตถุดิบ
                        </button>
                    </div>

                    <div className="space-y-6">
                        {items.map((item) => (
                            <DisburseFormRow
                                key={item.id}
                                item={item}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                                availableIngredients={availableIngredients}
                                units={units}
                            />
                        ))}
                    </div>
                
                    <div className="flex flex-wrap justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            ล้างข้อมูล
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full sm:w-auto px-6 py-2 text-sm text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957]"
                        >
                            ยืนยันข้อมูล
                        </button>
                    </div>
                </main>
            
            
            {isModalOpen && (
                <ConfirmationModal
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}

            {toast.show && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: '' })}
                />
            )}
        </>
    );
}
