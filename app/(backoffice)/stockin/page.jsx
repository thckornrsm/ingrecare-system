// app/(backoffice)/import/page.jsx
'use client';

import React, { useState, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
    LayoutDashboard, BarChart2, Inbox, Package, 
    History, Wrench, LogOut, Plus, Calendar,
    Trash2, Info, CheckCircle2, AlertCircle, X
} from 'lucide-react';

// ========= Sidebar Component (ไม่มีการเปลี่ยนแปลง) =========
const Sidebar = () => (
    <aside className="w-64 bg-white flex flex-col border-r">
         <div className="p-4 border-b">
            <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="IngreCare Logo" width={40} height={40} />
                <div>
                    <h2 className="font-bold text-lg">Suki Teeyai</h2>
                    <p className="text-sm text-gray-500">ผู้จัดการร้าน</p>
                </div>
            </div>
            <button className="text-sm text-gray-500 hover:text-red-500 mt-2 flex items-center gap-1">
                <LogOut size={14} />
                ออกจากระบบ
            </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            <p className="text-xs text-gray-400 uppercase font-semibold">เมนูหลัก</p>
            <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <LayoutDashboard size={20} /> หน้าหลัก
            </Link>
            <Link href="/stat" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <BarChart2 size={20} /> สถิติการใช้งาน
            </Link>
            <p className="text-xs text-gray-400 uppercase font-semibold pt-4">การจัดการข้อมูล</p>
            <Link href="/stockin" className="flex items-center gap-3 p-2 rounded-lg bg-[#3FA170] text-white">
                <Package size={20} /> นำเข้าวัตถุดิบ
            </Link>
            <Link href="/stockout" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> เบิกจ่ายวัตถุดิบ
            </Link>

            <p className="text-xs text-gray-400 uppercase font-semibold pt-4">รายการข้อมูล</p>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Inbox size={20} /> วัตถุดิบคงเหลือทั้งหมด
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Package size={20} /> วัตถุดิบหมดอายุ
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <History size={20} /> ประวัติการนำเข้า
            </Link>
            <Link href="#" className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <Wrench size={20} /> ประวัติการเบิกจ่าย
            </Link>
        </nav>
    </aside>
);

// ========= CustomDateInput Component (ไม่มีการเปลี่ยนแปลง) =========
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            type="text"
            value={value}
            placeholder={placeholder}
            readOnly
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black cursor-pointer"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    </div>
));
CustomDateInput.displayName = 'CustomDateInput';

// ========= IngredientFormRow Component (ไม่มีการเปลี่ยนแปลง) =========
const IngredientFormRow = ({ item, onUpdate, onRemove }) => {
    const handleInputChange = (field, value) => {
        if ((field === 'quantity' || field === 'shelfLife') && value < 0) {
            return;
        }
        onUpdate(item.id, { [field]: value });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border relative">
            <button 
                onClick={() => onRemove(item.id)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 size={18} />
            </button>
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
                        <input type="text" placeholder="กรอกชื่อวัตถุดิบ" value={item.itemName} onChange={(e) => handleInputChange('itemName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทของวัตถุดิบ (Type) <span className="text-red-500">*</span></label>
                        <select value={item.itemType} onChange={(e) => handleInputChange('itemType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-black">
                            <option value="">เลือกประเภทของวัตถุดิบ</option>
                            <option value="ผัก">ผัก</option>
                            <option value="ผลไม้">ผลไม้</option>
                            <option value="เนื้อสัตว์">เนื้อสัตว์</option>
                            <option value="ทะเล">ทะเล</option>
                            <option value="เครื่องปรุง">เครื่องปรุง</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนวัตถุดิบที่นำเข้า <span className="text-red-500">*</span></label>
                        <input type="number" min="0" value={item.quantity} onChange={(e) => handleInputChange('quantity', parseInt(e.target.value, 10) || 0)} placeholder="กรอกตัวเลข" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย <span className="text-red-500">*</span></label>
                        <select value={item.quantityUnit} onChange={(e) => handleInputChange('quantityUnit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-black">
                            <option value="">-</option>
                            <option value="กิโลกรัม">กิโลกรัม</option>
                            <option value="แพ็ค">แพ็ค</option>
                            <option value="ขวด">ขวด</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ระยะเวลาในการรักษา <span className="text-red-500">*</span></label>
                        <input type="number" min="0" value={item.shelfLife} onChange={(e) => handleInputChange('shelfLife', parseInt(e.target.value, 10) || 0)} placeholder="กรอกระยะเวลาในการรักษา" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย <span className="text-red-500">*</span></label>
                        <select value={item.shelfLifeUnit} onChange={(e) => handleInputChange('shelfLifeUnit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-black">
                            <option value="">-</option>
                            <option value="วัน">วัน</option>
                            <option value="สัปดาห์">สัปดาห์</option>
                            <option value="เดือน">เดือน</option>
                            <option value="ปี">ปี</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

// ========= ToastNotification Component (ไม่มีการเปลี่ยนแปลง) =========
const ToastNotification = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-lg border-l-4 shadow-lg ${bgColor} ${borderColor} animate-fade-in-right`}>
            <Icon className={textColor} />
            <div className={`ml-3 text-sm font-medium ${textColor}`}>
                {message}
            </div>
            <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex h-8 w-8 ${textColor} hover:bg-opacity-20`}>
                <X size={20} />
            </button>
        </div>
    );
};

// ========= ConfirmationModal Component (แก้ไข) =========
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


// ========= Main Import Page (ปรับปรุง State และ Logic) =========
export default function ImportPage() {
    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        importDate: null,
        itemName: '',
        itemType: '',
        quantity: 0,
        quantityUnit: '',
        shelfLife: 0,
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
            item.quantity <= 0 || !item.quantityUnit ||
            item.shelfLife <= 0 || !item.shelfLifeUnit
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
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">นำเข้าวัตถุดิบ</h1>
                            <p className="text-gray-500">เพิ่มข้อมูลการนำเข้าวัตถุดิบ</p>
                        </div>
                        <button onClick={handleAddItem} className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white flex items-center gap-2 hover:bg-gray-700">
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

