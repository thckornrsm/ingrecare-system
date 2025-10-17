"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search, Plus } from 'lucide-react';

function CustomDropdown({ 
    categories = [], 
    selectedCategory, 
    onSelectCategory,
    placeholder, 
    onAddNewClick,
    addNewText,
    label 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);
    
    const isObjectArray = categories.length > 0 && typeof categories[0] === 'object' && categories[0] !== null;

    const filteredCategories = dropdownSearch
        ? categories.filter(c => {
            // ✨ แก้ไขจุดที่ 1: ตรวจสอบทั้ง 'name' และ 'category_name'
            const name = isObjectArray ? (c.name || c.category_name) : c;
            return name ? name.toLowerCase().includes(dropdownSearch.toLowerCase()) : false;
        })
        : categories;

    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    const getSelectedDisplay = () => {
        if (!selectedCategory) {
            return <span className="text-gray-400">{placeholder || 'กรุณาเลือก'}</span>;
        }

        if (isObjectArray) {
            // ✨ แก้ไขจุดที่ 2: ค้นหาจากทั้ง 'name' และ 'category_name'
            const selectedObj = categories.find(c => (c.name || c.category_name) === selectedCategory);
            return <span>{selectedObj ? (selectedObj.name || selectedObj.category_name) : selectedCategory}</span>;
        }
        
        return <span>{selectedCategory}</span>;
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 gap-4 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#3FA170]"
            >
                <div className="flex items-center gap-2 truncate">
                    {label && <span className="text-gray-500 mr-2">{label}:</span>}
                    {getSelectedDisplay()}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <div className="relative">
                            <input type="text" placeholder="ค้นหา..." value={dropdownSearch} onChange={(e) => setDropdownSearch(e.target.value)} 
                            className="w-full border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA170]" />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                        {filteredCategories.map((cat, index) => {
                            // ✨ แก้ไขจุดที่ 3: ดึงค่าจาก 'name' หรือ 'category_name'
                            const name = isObjectArray ? (cat.name || cat.category_name) : cat;
                            if (!name) return null; // ไม่แสดงรายการถ้าไม่มีชื่อ
                            
                            return (
                                <li 
                                    key={`${name}-${index}`} 
                                    onClick={() => { 
                                        onSelectCategory(name); 
                                        setIsOpen(false); 
                                        setDropdownSearch(''); 
                                    }} 
                                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                                    <span>{name}</span>
                                </li>
                            );
                        })}

                        {onAddNewClick && addNewText && (
                            <>
                                <hr className="my-1 border-t border-gray-200" />
                                <li 
                                    onClick={() => {
                                        setIsOpen(false);
                                        onAddNewClick();
                                    }} 
                                    className="px-3 py-2 text-sm flex items-center gap-4 text-[#3FA170] hover:bg-gray-100 cursor-pointer"
                                >
                                    <Plus size={16} /> {addNewText}
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;