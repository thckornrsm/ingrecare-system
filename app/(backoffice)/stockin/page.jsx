'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import Sidebar from '@/components/Sidebar';
import CustomDropdown from '@/components/CustomDropdown'; 
import AddCategoryModal from '@/components/AddCategoryModal'; 
import AddUnitModal from '@/components/AddUnitModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import { 
    Plus, Calendar, Trash2, Info, 
    CheckCircle2, AlertCircle, X 
} from 'lucide-react';

// ========= CustomDateInput Component =========
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            type="text"
            value={value}
            placeholder={placeholder}
            readOnly
            className="bg-white w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black cursor-pointer"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    </div>
));
CustomDateInput.displayName = 'CustomDateInput';

// ========= IngredientFormRow Component (Updated) =========
const IngredientFormRow = ({ 
    item, onUpdate, onRemove, 
    availableCategories, onAddNewCategoryClick,
    quantityUnits, onAddNewQuantityUnitClick,
    shelfLifeUnits
}) => { 
    const handleInputChange = (field, value) => {
        onUpdate(item.id, { [field]: value });
    };
    
    return (
        <div className="bg-[#F6F8FA] p-6 rounded-lg border border-[#E5E5E5] relative">
             {onRemove && <button 
                type="button"
                onClick={() => onRemove(item.id)} 
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 size={18} />
            </button>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่รับวัตถุดิบ <span className="text-red-500">*</span></label>
                    <DatePicker
                        selected={item.received_date}
                        onChange={(date) => handleInputChange('received_date', date)}
                        dateFormat="dd/MM/yyyy"
                        wrapperClassName="w-full"
                        customInput={<CustomDateInput placeholder="วว/ดด/ปปปป" />}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="เช่น เนื้อหมูสันนอก, ผักกาดขาว" 
                        value={item.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทของวัตถุดิบ <span className="text-red-500">*</span></label>
                    <CustomDropdown 
                        categories={availableCategories}
                        selectedCategory={item.category_name} 
                        onSelectCategory={(selectedType) => handleInputChange('category_name', selectedType)}
                        placeholder="เลือกประเภทของวัตถุดิบ"
                        onAddNewClick={onAddNewCategoryClick}
                        addNewText="เพิ่มหมวดหมู่"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">จำนวน <span className="text-red-500">*</span></label>
                    <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} 
                    placeholder="เช่น 2.5, 10" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">หน่วย <span className="text-red-500">*</span></label>
                    <CustomDropdown
                        categories={quantityUnits}
                        selectedCategory={item.unit_name}
                        onSelectCategory={(unit) => handleInputChange('unit_name', unit)}
                        placeholder="เช่น กิโลกรัม, แพ็ค, ขวด"
                        onAddNewClick={onAddNewQuantityUnitClick}
                        addNewText="เพิ่มหน่วยนับ"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">อายุการเก็บรักษา <span className="text-red-500">*</span></label>
                    <input type="number" min="1" value={item.shelflife_value} onChange={(e) => handleInputChange('shelflife_value', e.target.value)} 
                    placeholder="เช่น 7, 30" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">หน่วยเวลา <span className="text-red-500">*</span></label>
                     <CustomDropdown
                        categories={shelfLifeUnits}
                        selectedCategory={item.shelflife_unit_name}
                        onSelectCategory={(unit) => handleInputChange('shelflife_unit_name', unit)}
                        placeholder="เช่น วัน, สัปดาห์, เดือน"
                    />
                </div>
            </div>
        </div>
    );
};

// ========= ToastNotification Component =========
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

// ========= ConfirmationModal Component =========
const ConfirmationModal = ({ onClose, onConfirm, isSubmitting }) => (
     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full mx-4 border">
            <div className="mx-auto w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mb-4">
                <Info size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ยืนยันการบันทึกข้อมูล</h2>
            <p className="text-gray-500 mb-6">คุณต้องการบันทึกข้อมูลการนำเข้าทั้งหมดใช่หรือไม่?</p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-8 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    ยกเลิก
                </button>
                <button onClick={onConfirm} disabled={isSubmitting} className="px-8 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </button>
            </div>
        </div>
    </div>
);


// ========= Main Import Page (Stock-in Form) =========
export default function StockInPage() {
    const router = useRouter();

    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        received_date: new Date(),
        name: '',
        category_name: '',
        quantity: '',
        unit_name: '',
        shelflife_value: '',
        shelflife_unit_name: '',
    });

    const [items, setItems] = useState([createNewItem()]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [availableTimeUnits, setAvailableTimeUnits] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [isAddUnitModalOpen, setAddUnitModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const fetchDropdownData = async () => {
        try {
            const [catRes, unitRes, timeUnitRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/units'),
                fetch('/api/time_units')
            ]);

            const categories = await catRes.json();
            const units = await unitRes.json();
            const timeUnits = await timeUnitRes.json();
            
            setAvailableCategories(categories.map(c => ({ name: c.category_name })));
            setAvailableUnits(units.map(u => ({ name: u.unit_name })));
            setAvailableTimeUnits(timeUnits.map(tu => ({ name: tu.unit_name })));

        } catch (error) {
            showToast("ไม่สามารถโหลดข้อมูลพื้นฐานได้", "error");
            console.error("Failed to fetch dropdown data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    const handleUpdateItem = (id, updatedValues) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updatedValues } : item));
    };
    
    const handleAddItem = () => setItems([...items, createNewItem()]);
    const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
    const handleClearAll = () => { setItems([createNewItem()]); };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const isInvalid = items.some(item => 
            !item.received_date || !item.name || !item.category_name ||
            !item.quantity || Number(item.quantity) <= 0 || !item.unit_name ||
            !item.shelflife_value || Number(item.shelflife_value) <= 0 || !item.shelflife_unit_name
        );

        if (isInvalid) {
            showToast('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน', 'error');
        } else {
            setConfirmModalOpen(true);
        }
    };

    const handleAddCategory = async ({ name }) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_name: name })
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add category');
            }
            
            showToast('เพิ่มหมวดหมู่ใหม่สำเร็จ!', 'success');
            fetchDropdownData();
            
        } catch (error) {
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
            console.error("Failed to add category:", error);
        }
    };

    const handleAddUnit = async ({ name }) => {
        try {
            const res = await fetch('/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unit_name: name })
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add unit');
            }
            
            showToast('เพิ่มหน่วยนับใหม่สำเร็จ!', 'success');
            fetchDropdownData();
            
        } catch (error) {
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
            console.error("Failed to add unit:", error);
        }
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        
        const payload = {
            items: items.map(item => ({
                name: item.name,
                category_name: item.category_name,
                unit_name: item.unit_name,
                shelflife_value: parseInt(item.shelflife_value, 10),
                shelflife_unit_name: item.shelflife_unit_name,
                quantity: parseFloat(item.quantity),
                received_date: item.received_date,
            })),
        };

        try {
            const res = await fetch('/api/stockin', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            showToast('บันทึกข้อมูลการนำเข้าสำเร็จ', 'success');
            
            setTimeout(() => {
                router.push('/dashboard'); 
            }, 1500);

        } catch (error) {
            console.error("SUBMIT_ERROR", error);
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
            setConfirmModalOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-10 sm:px-14 md:px-25">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-black text-3xl font-bold">นำเข้าวัตถุดิบ</h1>
                                <p className="text-[#979999]">เพิ่มข้อมูลการนำเข้าของวัตถุดิบในแต่ละล็อต</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddItem} 
                                className="w-full sm:w-auto justify-center px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors">
                                <Plus size={16}/> เพิ่มรายการวัตถุดิบ
                            </button>
                        </div>
                        
                        {isLoading ? <p className="text-center text-gray-500">กำลังโหลดฟอร์ม...</p> : 
                        <div className="space-y-6">
                            {items.map(item => (
                                <IngredientFormRow 
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdateItem}
                                    onRemove={items.length > 1 ? handleRemoveItem : null}
                                    availableCategories={availableCategories}
                                    onAddNewCategoryClick={() => setAddCategoryModalOpen(true)}
                                    quantityUnits={availableUnits}
                                    onAddNewQuantityUnitClick={() => setAddUnitModalOpen(true)}
                                    shelfLifeUnits={availableTimeUnits}
                                />
                            ))}
                        </div>
                        }

                        <div className="flex flex-wrap justify-end gap-4 pt-6">
                            <button 
                                type="button" 
                                onClick={handleClearAll} 
                                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                ล้างข้อมูล
                            </button>
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957]">
                                ยืนยันข้อมูล
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            
            {isConfirmModalOpen && (
                <ConfirmationModal 
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleConfirmSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
            
            <AddCategoryModal 
                isOpen={isAddCategoryModalOpen}
                onClose={() => setAddCategoryModalOpen(false)}
                onAddCategory={handleAddCategory}
                existingCategories={availableCategories.map(c => ({ name: c.name }))} 
            />

            <AddUnitModal
                isOpen={isAddUnitModalOpen}
                onClose={() => setAddUnitModalOpen(false)}
                onAddUnit={handleAddUnit}
                existingUnits={availableUnits.map(u => ({ name: u.name }))}
            />

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