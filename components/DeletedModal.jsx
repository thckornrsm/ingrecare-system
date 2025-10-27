// components/DeletedModal.js

"use client";

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

function DeletedModal({ isOpen, onClose, onConfirm, itemToDelete }) {
  if (!isOpen || !itemToDelete) {
    return null;
  }
  const isDeletable = itemToDelete.count === 0;
  
  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isDeletable ? (
          // ลบได้
          <>
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#FAE3E3] mb-6">
              <Trash2 className="h-10 w-10 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              ยืนยันการลบข้อมูล
            </h3>
            <p className="text-gray-500 mb-6">
              คุณต้องการลบ "{itemToDelete.name}" ?
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                ลบเลย!
              </button>
            </div>
          </>
        ) : (
          // ลบไม่ได้ มีรายการใช้งานอยู่
          <>
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
              <AlertTriangle className="h-10 w-10 text-yellow-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              ไม่สามารถลบ "{itemToDelete.name}" ได้
            </h3>
            <p className="text-gray-500 mb-6">
              มีวัตถุดิบที่ใช้งานอยู่ ({itemToDelete.count} รายการ) จึงไม่สามารถลบได้
            </p>
            <div className="flex justify-center mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-400 rounded-md hover:bg-gray-500 transition-colors"
              >
                ฉันเข้าใจแล้ว
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeletedModal;