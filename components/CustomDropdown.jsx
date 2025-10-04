"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search, Plus } from 'lucide-react';
import AddCategoryModal from '@/components/AddCategoryModal';

function CustomDropdown({ categories = [], selectedCategory, onSelectCategory, placeholder, onAddNewCategoryClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);
    
    const isObjectArray = categories.length > 0 && typeof categories[0] === 'object' && categories[0] !== null;

    const filteredCategories = dropdownSearch
        ? categories.filter(c => {
            const name = isObjectArray ? c.name : c;
            return name.toLowerCase().includes(dropdownSearch.toLowerCase());
        })
        : categories;

    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    const getSelectedDisplay = () => {
        if (!selectedCategory) {
            return <span className="text-gray-400">{placeholder || 'กรุณาเลือก'}</span>;
        }

        if (isObjectArray) {
            const selectedObj = categories.find(c => c.name === selectedCategory);
            return selectedObj ? <div className="flex items-center gap-2">{selectedObj.icon} <span>{selectedObj.name}</span></div> : <span>{selectedCategory}</span>;
        }
        
        return <span>{selectedCategory}</span>;
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center justify-between focus:ring-[#3FA170] focus:border-[#3FA170]"
            >
                {getSelectedDisplay()}
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <div className="relative">
                            <input type="text" placeholder="ค้นหา..." value={dropdownSearch} onChange={(e) => setDropdownSearch(e.target.value)} className="w-full border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3FA170]" />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                        {filteredCategories.map((cat, index) => {
                            const name = isObjectArray ? cat.name : cat;
                            const icon = isObjectArray ? cat.icon : null;
                            
                            return (
                                <li key={`${name}-${index}`} onClick={() => { onSelectCategory(name); setIsOpen(false); setDropdownSearch(''); }} className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 cursor-pointer">
                                    {icon} {name}
                                </li>
                            );
                        })}

                        {onAddNewCategoryClick && (
                            <>
                                <hr className="my-1 border-t border-gray-200" />
                                <li 
                                    onClick={() => {
                                        setIsOpen(false);
                                        onAddNewCategoryClick();
                                    }} 
                                    className="px-3 py-2 text-sm flex items-center gap-2 text-[#3FA170] hover:bg-gray-100 cursor-pointer"
                                >
                                    <Plus size={16} /> เพิ่มหมวดหมู่
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