/* รายงานการนำเข้าวัตถุดิบ */
'use client';

import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plus, Calendar,Trash2, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ToastNotification from '@/components/ToastNotification';

// CustomDateInput Component
const CustomDateInput = forwardRef(({ value, onClick}, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            type="text"
            value={value}
            placeholder="วว/ดด/ปปปป"
            readOnly
            className="bg-white w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] text-black cursor-pointer"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    </div>
));
CustomDateInput.displayName = 'CustomDateInput';

// IngredientFormRow Component
const IngredientFormRow = ({ item, onUpdate, onRemove }) => {
    const handleInputChange = (field, value) => {
        if (field === 'quantity' || field === 'shelfLife') {
            // อนุญาตให้ว่างไว้เพื่อโชว์ placeholder
            if (value === '') return onUpdate(item.id, { [field]: '' });
            
            const n = parseInt(value, 10);
            if (Number.isNaN(n)) return;             // ข้ามถ้าไม่ใช่ตัวเลข
            if (n < 1) return;                       // ไม่รับ 0 หรือค่าติดลบ
            return onUpdate(item.id, { [field]: n }); // เก็บเป็นเลขบวกตั้งแต่ 1
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่รับวัตถุดิบ <span className="text-red-500">*</span></label>
                    <DatePicker
                        selected={item.importDate}
                        onChange={(date) => handleInputChange('importDate', date)}
                        dateFormat="dd/MM/yyyy"
                        customInput={<CustomDateInput placeholder="วว/ดด/ปปปป (ปี พ.ศ.)" />}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ (Name) <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="กรอกชื่อวัตถุดิบ" value={item.itemName} onChange={(e) => handleInputChange('itemName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทของวัตถุดิบ (Type) <span className="text-red-500">*</span></label>
                        <select value={item.itemType} onChange={(e) => handleInputChange('itemType', e.target.value)} 
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white 
                                  ${!item.itemType ? 'text-gray-400' : 'text-black'}`}>
                            <option value="" disabled hidden className="text-gray-400">เลือกประเภทของวัตถุดิบ</option>
                            <option value="ผัก" className="text-black">ผัก</option>
                            <option value="ผลไม้" className="text-black">ผลไม้</option>
                            <option value="เนื้อสัตว์" className="text-black">เนื้อสัตว์</option>
                            <option value="ทะเล" className="text-black">ทะเล</option>
                            <option value="เครื่องปรุง" className="text-black">เครื่องปรุง</option>
                            <option value="อื่นๆ" className="text-black">อื่นๆ</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">จำนวนวัตถุดิบที่นำเข้า <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))} 
                        placeholder="กรอกตัวเลข" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">หน่วย <span className="text-red-500">*</span></label>
                        <select value={item.quantityUnit} onChange={(e) => handleInputChange('quantityUnit', e.target.value)} 
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white
                                  ${!item.quantityUnit ? 'text-gray-400' : 'text-black'}`}>
                            <option value="" disabled hidden className="text-gray-400">เลือกหน่วยของวัตถุดิบ</option>
                            <option value="กิโลกรัม" className="text-black">กิโลกรัม</option>
                            <option value="แพ็ค" className="text-black">แพ็ค</option>
                            <option value="ขวด" className="text-black">ขวด</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">ระยะเวลาในการรักษา <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={item.shelfLife} onChange={(e) => handleInputChange('shelfLife', parseInt(e.target.value))} 
                        placeholder="กรอกระยะเวลาในการรักษา" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">หน่วย <span className="text-red-500">*</span></label>
                        <select value={item.shelfLifeUnit} onChange={(e) => handleInputChange('shelfLifeUnit', e.target.value)} 
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-[#3FA170] bg-white
                                  ${!item.shelfLifeUnit ? 'text-gray-400' : 'text-black'}`}>
                            <option value="" disabled hidden className="text-gray-400">ระยะเวลาในการรักษา</option>
                            <option value="วัน" className="text-black">วัน</option>
                            <option value="สัปดาห์" className="text-black">สัปดาห์</option>
                            <option value="เดือน" className="text-black">เดือน</option>
                            <option value="ปี" className="text-black">ปี</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

// ConfirmationModal Component
const ConfirmationModal = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full mx-4 border">
            <div className="mx-auto w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mb-4">
                <Info size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">คุณต้องการยืนยันการบันทึกข้อมูล</h2>
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

/* Main Stock In Page (Import) */
export default function ImportPage() {
    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        importDate: null,
        itemName: '',
        itemType: '',
        quantity: '',
        quantityUnit: '',
        shelfLife: '',
        shelfLifeUnit: '',
    });

    const [items, setItems] = useState([createNewItem()]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleAddItem = () => {
        setItems([...items, createNewItem()]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleUpdateItem = (id, updatedValues) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updatedValues } : item));
    };
    
    const handleClearAll = () => {
        const clearedItems = items.map(item => ({ ...createNewItem(), id: item.id }));
        setItems(clearedItems);
    };

    const handleSubmit = () => {
        const isInvalid = items.some(item =>
            !item.importDate || !item.itemName || !item.itemType ||
            item.quantity === '' || Number(item.quantity) <= 0 || !item.quantityUnit ||
            item.shelfLife === '' || Number(item.shelfLife) <= 0 || !item.shelfLifeUnit
        );


        if (isInvalid) {
            showToast('การนำเข้าวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        } else {
            setIsModalOpen(true);
        }
    };

    const handleConfirmSubmit = () => {
        setIsModalOpen(false);
        showToast('การนำเข้าวัตถุดิบสำเร็จ', 'success');
        console.log("Submitting data:", items);
        // handleClearAll(); 
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-black text-3xl font-bold">นำเข้าวัตถุดิบ</h1>
                            <p className="text-[#979999]">เพิ่มข้อมูลการนำเข้าของวัตถุดิบในแต่ละล็อต</p>
                        </div>
                        <button onClick={handleAddItem} className="px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors">
                            <Plus size={16}/> เพิ่มรายการวัตถุดิบ
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {items.map(item => (
                            <IngredientFormRow 
                                key={item.id}
                                item={item}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={handleClearAll} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
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

