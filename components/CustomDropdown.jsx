"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

function CustomDropdown({ categories, selectedCategory, onSelectCategory }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);
    
    const filteredCategories = dropdownSearch
        ? categories.filter(c => c.name.toLowerCase().includes(dropdownSearch.toLowerCase()))
        : categories;

    const selectedCatObject = categories.find(c => c.name === selectedCategory);

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

    return (
        <div className="relative min-w-48 max-w-80" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#3FA170]">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500">หมวดหมู่</span>
                    {selectedCatObject && selectedCatObject.icon}
                    <span>{selectedCategory}</span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <div className="relative">
                            <input type="text" placeholder="ค้นหา..." value={dropdownSearch} onChange={(e) => setDropdownSearch(e.target.value)} className="w-full border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <ul className="py-1 max-h-48 overflow-y-auto">
                    {filteredCategories.map((cat, index) => (
                        <li key={`${cat.name}-${index}`} onClick={() => { onSelectCategory(cat.name); setIsOpen(false); setDropdownSearch(''); }} className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 cursor-pointer">
                            {cat.icon} {cat.name}
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;