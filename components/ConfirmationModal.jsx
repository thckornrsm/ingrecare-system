"use client";

import React from 'react';
import { BadgeInfo } from 'lucide-react';

function ConfirmationModal({ isOpen, onClose, onConfirm, isSubmitting, formType = 'default' }) {
    if (!isOpen) {
        return null;
    }
    const renderContent = () => {
        switch (formType) {
            // Case 1: StockIn
            case 'stock-in':
                return (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            คุณต้องการยืนยันการนำเข้าวัตถุดิบ
                        </h3>
                        <p className="text-gray-500 mb-6">
                            บันทึกข้อมูลการนำเข้าทั้งหมดใช่หรือไม่?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isSubmitting}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957] transition-colors disabled:bg-green-300"
                            >
                                {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </>
                );
            
            // Case 2: StockOut
            case 'stock-out':
                return (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            คุณต้องการยืนยันการเบิกจ่ายวัตถุดิบ
                        </h3>
                        <p className="text-gray-500 mb-6">
                            ยืนยันการเบิกจ่ายวัตถุดิบนี้ใช่หรือไม่?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957] transition-colors"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#ECF6F1] mb-6">
                        <BadgeInfo size={40} className="text-[#3FA170]" />
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;