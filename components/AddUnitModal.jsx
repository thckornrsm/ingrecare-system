// components/AddUnitModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function AddUnitModal({ isOpen, onClose, onAddUnit, existingUnits = [] }) {
    const [unitName, setUnitName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!unitName) {
            setError('');
            return;
        }
        const isDuplicate = existingUnits.some(
            unit => unit.name.trim().toLowerCase() === unitName.trim().toLowerCase()
        );
        if (isDuplicate) {
            setError('ชื่อหน่วยนับนี้มีอยู่แล้ว');
        } else {
            setError('');
        }
    }, [unitName, existingUnits]);

    const resetState = () => {
        setUnitName('');
        setError('');
    };
    
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (unitName.trim() === '' || error) return;
        onAddUnit({ name: unitName.trim() });
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
                    <h3 className="text-lg font-semibold text-gray-800">เพิ่มหน่วยนับ</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} /> 
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="unitName" className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อหน่วยนับ</label>
                        <input 
                            type="text" 
                            id="unitName" 
                            value={unitName} 
                            onChange={(e) => setUnitName(e.target.value)} 
                            className={`flex-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#3FA170] focus:border-[#3FA170]'}`} 
                            placeholder="เช่น กิโลกรัม, ถุง, แกลลอน"
                            required 
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-500 mt-1 ml-[calc(6rem+1rem)]">{error}</p>
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                    
                        <button 
                            type="submit" 
                            disabled={!unitName.trim() || !!error}
                            className="rounded-md bg-[#3FA170] px-6 py-2 text-sm font-medium text-white hover:bg-[#2F7A5E] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            เพิ่มหน่วยนับ
                        </button> 
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUnitModal;
