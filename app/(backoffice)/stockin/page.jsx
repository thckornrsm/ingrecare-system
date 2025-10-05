'use client';

import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plus, Calendar, Trash2, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ToastNotification from '@/components/ToastNotification';
import CustomDropdown from '@/components/CustomDropdown';
import AddCategoryModal from '@/components/AddCategoryModal';

// CustomDateInput Component
const CustomDateInput = forwardRef(({ value, onClick}, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
        <input
            type="text"
            value={value}
            placeholder="วว/ดด/ปปปป"
            readOnly
            className="bg-white w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    </div>
));
CustomDateInput.displayName = 'CustomDateInput';

// IngredientFormRow Component
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
        <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
            <button 
                type="button"
                onClick={() => onRemove(item.id)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <Trash2 size={18} />
            </button>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... Date, Item Name, Item Type fields ... */}
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">วันที่รับวัตถุดิบ <span className="text-red-500">*</span></label>
                        <DatePicker
                            selected={item.importDate}
                            onChange={(date) => handleInputChange('importDate', date)}
                            dateFormat="dd/MM/yyyy"
                            wrapperClassName="w-full"
                            customInput={<CustomDateInput />}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวัตถุดิบ <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder="เช่น เนื้อหมูสันนอก, ผักกาดขาว, ไข่ไก่" 
                            value={item.itemName} 
                            onChange={(e) => handleInputChange('itemName', e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทของวัตถุดิบ <span className="text-red-500">*</span></label>
                        <CustomDropdown 
                            categories={availableCategories}
                            selectedCategory={item.itemType} 
                            onSelectCategory={(selectedType) => handleInputChange('itemType', selectedType)}
                            placeholder="เลือกประเภทของวัตถุดิบ"
                            onAddNewCategoryClick={onAddNewCategoryClick}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">จำนวนวัตถุดิบที่นำเข้า <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} 
                        placeholder="ระบุค่าตัวเลข เช่น 2.5, 10, 27" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">หน่วย <span className="text-red-500">*</span></label>
                        <CustomDropdown
                            categories={quantityUnits}
                            selectedCategory={item.quantityUnit}
                            onSelectCategory={(unit) => handleInputChange('quantityUnit', unit)}
                            placeholder="เช่น กิโลกรัม, แพ็ค, ขวด"
                            onAddNewCategoryClick={onAddNewQuantityUnitClick} // <-- เพิ่ม prop นี้
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">ระยะเวลาในการรักษา <span className="text-red-500">*</span></label>
                        <input type="number" min="1" value={item.shelfLife} onChange={(e) => handleInputChange('shelfLife', e.target.value)} 
                        placeholder="ระบุค่าตัวเลข เช่น 1, 7, 30, ..." 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">หน่วย <span className="text-red-500">*</span></label>
                         <CustomDropdown
                            categories={shelfLifeUnits}
                            selectedCategory={item.shelfLifeUnit}
                            onSelectCategory={(unit) => handleInputChange('shelfLifeUnit', unit)}
                            placeholder="เช่น วัน, สัปดาห์, เดือน, ปี"
                            
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

// ConfirmationModal Component **แก้
const ConfirmationModal = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
    const [categoryNames, setCategoryNames] = useState(["เนื้อสัตว์", "ผัก", "ทะเล", "ผลไม้", "เครื่องปรุง", "อื่นๆ"]); //หาวิธีดึงจาก database
    const [quantityUnits, setQuantityUnits] = useState(["กิโลกรัม", "แพ็ค", "ขวด"]); //หาวิธีดึงจาก database
    const [shelfLifeUnits] = useState(["วัน", "สัปดาห์", "เดือน", "ปี"]);

    const createNewItem = () => ({
        id: Date.now() + Math.random(),
        importDate: null, itemName: '', itemType: '',
        quantity: '', quantityUnit: '',
        shelfLife: '', shelfLifeUnit: '',
    });

    const [items, setItems] = useState([createNewItem()]);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const handleAddNewQuantityUnit = () => {
        const newUnit = prompt("เพิ่มหน่วยสำหรับจำนวน (เช่น: ชิ้น, ถุง):");
        if (newUnit && !quantityUnits.includes(newUnit.trim())) {
            setQuantityUnits(prev => [...prev, newUnit.trim()]);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleAddCategory = ({ name }) => {
        if (!categoryNames.includes(name)) {
            setCategoryNames(prevCategories => [...prevCategories, name]);
        }
        setAddCategoryModalOpen(false);
    };

    const handleUpdateItem = (id, updatedValues) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updatedValues } : item));
    };
    
    const handleAddItem = () => setItems([...items, createNewItem()]);
    const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
    const handleClearAll = () => { setItems(items.map(item => ({ ...createNewItem(), id: item.id }))); };
    const handleSubmit = () => {
        const isInvalid = items.some(item => !item.importDate || !item.itemName || !item.itemType || !item.quantity || !item.quantityUnit || !item.shelfLife || !item.shelfLifeUnit);
        if (isInvalid) {
            showToast('การนำเข้าวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        } else {
            setConfirmModalOpen(true);
        }
    };
    const handleConfirmSubmit = () => {
        setConfirmModalOpen(false);
        showToast('การนำเข้าวัตถุดิบสำเร็จ', 'success');
        console.log("Submitting data:", items);
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
                                availableCategories={categoryNames}
                                onAddNewCategoryClick={() => setAddCategoryModalOpen(true)}
                                quantityUnits={quantityUnits}
                                onAddNewQuantityUnitClick={handleAddNewQuantityUnit}
                                shelfLifeUnits={shelfLifeUnits}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={handleClearAll} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            ล้างข้อมูล
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            className="px-6 py-2 text-sm font-semibold text-white bg-[#3FA170] rounded-md hover:bg-[#2F7A5E]"
                        >
                            ยืนยันข้อมูล
                        </button>
                    </div>
                </main>
            </div>
            
            {isConfirmModalOpen && (
                <ConfirmationModal 
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}
            
            {isAddCategoryModalOpen && (
                 <AddCategoryModal 
                    isOpen={isAddCategoryModalOpen}
                    onClose={() => setAddCategoryModalOpen(false)}
                    onAddCategory={handleAddCategory}
                    existingCategories={categoryNames.map(name => ({ name }))} 
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