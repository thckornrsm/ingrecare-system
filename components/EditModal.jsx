"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomDropdown from "@/components/CustomDropdown";

// 1. เพิ่ม prop 'formType' เพื่อใช้กำหนดรูปแบบฟอร์ม
function EditModal({ isOpen, onClose, onSave, ingredient, categories = [], units = [], formType = 'default' }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (ingredient) {
            const [outDate, outTime] = ingredient.out_datetime ? ingredient.out_datetime.split('T') : ['', ''];
            setFormData({
                name: ingredient.name || '',
                quantity: ingredient.quantity || '',
                unit_type: ingredient.unit_type || '',
                category_id: ingredient.category_id || '',
                shelflife_day: ingredient.shelflife_day,
                received_date: ingredient.received_date || '',
                out_date: outDate,
                out_time: outTime,
            });
        }
    }, [ingredient, isOpen]);

    if (!isOpen || !ingredient) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSave = () => {
        const updatedIngredient = {
            ...ingredient,
            ...formData,
            quantity: Number(formData.quantity),
            shelflife_day: formData.shelflife_day !== undefined ? Number(formData.shelflife_day) : undefined,
            out_datetime: formData.out_date ? `${formData.out_date}T${formData.out_time || '00:00'}` : undefined,
        };
        onSave(updatedIngredient);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSave();
      }
    };

    const InputField = ({ label, ...props }) => (
        <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
            <input
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3FA170] transition"
                {...props}
            />
        </div>
    );

    // 2. สร้างฟอร์มสำหรับแต่ละ Type ตามเงื่อนไข
    const renderFormContent = () => {
        switch (formType) {
            // Case 4: AllStockOut
            case 'stock-out':
                return (
                    <>
                        <InputField label="ชื่อวัตถุดิบ" name="name" value={formData.name || ''} onChange={handleChange} autoFocus />
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่</label>
                            <CustomDropdown placeholder="เลือกหมวดหมู่" categories={categories} selectedCategory={formData.category_id} onSelectCategory={(val) => handleDropdownChange('category_id', val)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="วันเบิกจ่าย" name="out_date" type="date" value={formData.out_date || ''} onChange={handleChange} />
                            <InputField label="เวลาเบิกจ่าย" name="out_time" type="time" value={formData.out_time || ''} onChange={handleChange} />
                            <InputField label="จำนวน" name="quantity" type="number" min={0} value={formData.quantity || ''} onChange={handleChange} />
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">หน่วยนับ</label>
                                <CustomDropdown placeholder="เลือกหน่วยนับ" categories={units} selectedCategory={formData.unit_type} onSelectCategory={(val) => handleDropdownChange('unit_type', val)} />
                            </div>
                        </div>
                    </>
                );
            
            // Case 3: AllStockIn
            case 'stock-in':
                 return (
                    <>
                        <InputField label="ชื่อวัตถุดิบ" name="name" value={formData.name || ''} onChange={handleChange} autoFocus />
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่</label>
                            <CustomDropdown placeholder="เลือกหมวดหมู่" categories={categories} selectedCategory={formData.category_id} onSelectCategory={(val) => handleDropdownChange('category_id', val)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="วันที่นำเข้า" name="received_date" type="date" value={formData.received_date || ''} onChange={handleChange} />
                            <InputField label="อายุ (วัน)" name="shelflife_day" type="number" min={0} value={formData.shelflife_day || ''} onChange={handleChange} />
                            <InputField label="จำนวน" name="quantity" type="number" min={0} value={formData.quantity || ''} onChange={handleChange} />
                             <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">หน่วยนับ</label>
                                <CustomDropdown placeholder="เลือกหน่วยนับ" categories={units} selectedCategory={formData.unit_type} onSelectCategory={(val) => handleDropdownChange('unit_type', val)} />
                            </div>
                        </div>
                    </>
                );

            // Case 1 & 2: AllIngredient & AllExpired (Default)
            default:
                return (
                     <>
                        <InputField label="ชื่อวัตถุดิบ" name="name" value={formData.name || ''} onChange={handleChange} autoFocus />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่</label>
                                <CustomDropdown placeholder="เลือกหมวดหมู่" categories={categories} selectedCategory={formData.category_id} onSelectCategory={(val) => handleDropdownChange('category_id', val)} />
                            </div>
                            <InputField label="อายุ (วัน)" name="shelflife_day" type="number" min={0} value={formData.shelflife_day || ''} onChange={handleChange} />
                            <InputField label="จำนวนในคลัง" name="quantity" type="number" min={0} value={formData.quantity || ''} onChange={handleChange} />
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">หน่วยนับ</label>
                                <CustomDropdown placeholder="เลือกหน่วยนับ" categories={units} selectedCategory={formData.unit_type} onSelectCategory={(val) => handleDropdownChange('unit_type', val)} />
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E5E5]">
                    <h3 className="text-lg font-semibold text-gray-800">ID #{ingredient.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                
                {/* 3. เรียกใช้ฟังก์ชันเพื่อแสดงฟอร์มที่ถูกต้อง */}
                <div className="space-y-4">
                    {renderFormContent()}
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        ยกเลิก
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#2F7A5E]">
                        แก้ไขข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;