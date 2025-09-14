// app/(backoffice)/disburse/page.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    LayoutDashboard, BarChart2, Inbox, Package, 
    History, Wrench, LogOut, Info, CheckCircle2,
    AlertCircle, X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// ========= ConfirmationModal Component (แก้ไข) =========
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

// ========= Main Disburse Page =========
export default function DisbursePage() {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };
    
    const handleClear = () => {
        setItemName('');
        setQuantity('');
        setUnit('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemName || !quantity || quantity <= 0 || !unit) {
            showToast('การเบิกจ่ายวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmDisburse = () => {
        console.log("Disbursing:", { itemName, quantity, unit });
        setIsModalOpen(false);
        showToast('การเบิกจ่ายวัตถุดิบสำเร็จ', 'success');
        handleClear();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">เบิกจ่ายวัตถุดิบ</h1>
                        <p className="text-gray-500">เพิ่มข้อมูลการเบิกจ่ายวัตถุดิบ</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ชื่อวัตถุดิบ (Name) <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="กรอกชื่อวัตถุดิบ" 
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        จำนวนที่เบิกจ่าย <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="กรอกตัวเลข" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        หน่วย <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-black"
                                    >
                                        <option value="">-</option>
                                        <option value="กิโลกรัม">กิโลกรัม</option>
                                        <option value="กรัม">กรัม</option>
                                        <option value="ลิตร">ลิตร</option>
                                        <option value="มิลลิลิตร">มิลลิลิตร</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleClear} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    ล้างข้อมูล
                                </button>
                                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                    ยืนยันข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            {isModalOpen && (
                <ConfirmationModal 
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDisburse}
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

