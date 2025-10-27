// components/AddCategoryModal.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, ChevronUp, Utensils, Beef, Fish, Apple, Pizza,
    ChefHat, Refrigerator, CookingPot, Soup, Shrimp, Egg, Ham, Drumstick, Hamburger, Salad,
    Bean, Carrot, Cherry, Wheat, LeafyGreen, Vegan, Dessert, CakeSlice, Candy, Lollipop,
    IceCreamCone, Coffee, Beer, Martini, Wine, CupSoda, Ellipsis, X
} from 'lucide-react';

function AddCategoryModal({ isOpen, onClose, onAddCategory, existingCategories = [] }) {
    const iconOptions = [
        { name: 'Utensils', icon: Utensils }, { name: 'ChefHat', icon: ChefHat }, { name: 'Refrigerator', icon: Refrigerator }, { name: 'CookingPot', icon: CookingPot }, { name: 'Soup', icon: Soup },
        { name: 'Fish', icon: Fish }, { name: 'Shrimp', icon: Shrimp },
        { name: 'Egg', icon: Egg }, { name: 'Beef', icon: Beef }, { name: 'Ham', icon: Ham }, { name: 'Drumstick', icon: Drumstick }, { name: 'Pizza', icon: Pizza }, { name: 'Hamburger', icon: Hamburger },
        { name: 'Salad', icon: Salad }, { name: 'Apple', icon: Apple }, { name: 'Bean', icon: Bean }, { name: 'Carrot', icon: Carrot }, { name: 'Cherry', icon: Cherry }, { name: 'Wheat', icon: Wheat }, { name: 'LeafyGreen', icon: LeafyGreen }, { name: 'Vegan', icon: Vegan },
        { name: 'Dessert', icon: Dessert }, { name: 'CakeSlice', icon: CakeSlice }, { name: 'Candy', icon: Lollipop }, { name: 'IceCreamCone', icon: IceCreamCone },
        { name: 'Coffee', icon: Coffee }, { name: 'Beer', icon: Beer }, { name: 'Martini', icon: Martini }, { name: 'Wine', icon: Wine }, { name: 'CupSoda', icon: CupSoda },
        { name: 'Ellipsis', icon: Ellipsis }
    ];
    
    const [categoryName, setCategoryName] = useState('');
    const [selectedIconName, setSelectedIconName] = useState(iconOptions[0].name);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

    const [error, setError] = useState('');
    const iconDropdownRef = useRef(null);
    const SelectedIcon = iconOptions.find(i => i.name === selectedIconName)?.icon || iconOptions[0].icon;

    useEffect(() => {
        if (!categoryName) {
            setError('');
            return;
        }
        const isDuplicate = existingCategories.some(
            cat => cat.name.trim().toLowerCase() === categoryName.trim().toLowerCase()
        );
        if (isDuplicate) {
            setError('ชื่อหมวดหมู่นี้มีอยู่แล้ว');
        } else {
            setError('');
        }
    }, [categoryName, existingCategories]);

    useEffect(() => {
        const handleClickOutside = (event) => { if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target)) { setIsIconDropdownOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetState = () => {
        setCategoryName('');
        setSelectedIconName(iconOptions[0].name);
        setError('');
        setIsIconDropdownOpen(false);
    };
    
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (categoryName.trim() === '' || error) return;
        onAddCategory({ name: categoryName.trim(), iconName: selectedIconName });
        resetState();
        onClose();
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-sm mx-4">
                <div className="mb-6 flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">เพิ่มหมวดหมู่</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/*
                    <div className="flex items-center gap-4">
                        <label className="w-24 text-sm font-medium text-gray-700">เลือกไอคอน</label>
                        <div className="relative" ref={iconDropdownRef}>
                            <button type="button" onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)} 
                                className="flex items-center justify-between w-28 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
                                <SelectedIcon size={16} className="text-gray-600" />
                                {isIconDropdownOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>
                            {isIconDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-50 bg-white border border-gray-300 rounded-md shadow-lg">
                                    <ul className="max-h-auto overflow-auto p-2 grid grid-cols-5 gap-1">
                                        {iconOptions.map(({name, icon: Icon}) => ( <li key={name} onClick={() => { setSelectedIconName(name); setIsIconDropdownOpen(false); }} 
                                        className="flex justify-center items-center p-1 rounded-md hover:bg-gray-100 cursor-pointer"> 
                                        <Icon size={16} className="text-gray-600" /> </li> ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    */}
                    <div>
                        <label htmlFor="categoryName" className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อหมวดหมู่</label>
                        <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)} 
                            className={`flex-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#3FA170] focus:border-[#3FA170]'}`}
                            required
                            autoFocus
                            placeholder="เช่น เนื้อสัตว์, ผัก, เครื่องปรุง"
                        />
                        {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={!categoryName.trim() || !!error}
                            className="rounded-md bg-[#3FA170] px-6 py-2 text-sm font-medium text-white hover:bg-[#2F7A5E] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            เพิ่มหมวดหมู่
                        </button> 
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;