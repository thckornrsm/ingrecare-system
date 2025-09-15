/* รายงานการเบิกจ่ายวัตถุดิบ */
'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ToastNotification from '@/components/ToastNotification';

// ConfirmationModal Component
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

// DisburseFormRow Component
const DisburseFormRow = ({ item, onUpdate, onRemove }) => {
    const handleInputChange = (field, value) => {
        if (field === 'quantity') {
            if (value === '') return onUpdate(item.id, { quantity: '' });
            const n = parseInt(value, 10);
            if (Number.isNaN(n)) return;
            if (n < 1) return;
            return onUpdate(item.id, { quantity: n });
        }
        onUpdate(item.id, { [field]: value });
    };

    return (
        <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
            {/* Remove Button */}
            <button
                onClick={() => onRemove(item.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 size={18} />
            </button>
            {/* Form Fields */}
            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ (Name) <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="กรอกชื่อวัตถุดิบ"
                        value={item.itemName}
                        onChange={(e) => handleInputChange('itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            จำนวนที่เบิกจ่าย <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            placeholder="กรอกตัวเลข"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            หน่วย <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={item.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white
                                     ${!item.unit ? 'text-gray-400' : 'text-black'}`}
                        >
                            <option value="" disabled hidden className="text-gray-400">-</option>
                            <option value="กิโลกรัม" className="text-black">กิโลกรัม</option>
                            <option value="แพ็ค" className="text-black">แพ็ค</option>
                            <option value="ขวด" className="text-black">ขวด</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

/* Main DisbursePage Page */
export default function DisbursePage() {
    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        itemName: '',
        quantity: '',
        unit: '',
    });

    const [items, setItems] = useState([createNewItem()]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
        const isInvalid = items.some((i) => !i.itemName || i.quantity === '' || Number(i.quantity) <= 0 || !i.unit);
        if (isInvalid) return showToast('การเบิกจ่ายวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        setIsModalOpen(true);
    };

    const handleConfirmSubmit = () => {
        setIsModalOpen(false);
        showToast('การเบิกจ่ายวัตถุดิบสำเร็จ', 'success');
        console.log('Disbursing items:', items);
        // handleClearAll();
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-black text-3xl font-bold">เบิกจ่ายวัตถุดิบ</h1>
                            <p className="text-[#979999]">เพิ่มข้อมูลการเบิกจ่ายวัตถุดิบในแต่ละล็อต</p>
                        </div>
                        <button
                            onClick={handleAddItem}
                            className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors"
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
                            />
                        ))}
                    </div>
                  
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            ล้างข้อมูลทั้งหมด
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                            ยืนยันข้อมูลทั้งหมด
                        </button>
                    </div>
                </main>
            </div>
                
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
        </div>
    );
}