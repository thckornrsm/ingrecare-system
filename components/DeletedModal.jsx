"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';

function DeletedModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-27 w-27 rounded-full bg-red-100 mb-6">
          <Trash2 className="h-15 w-15 text-red-500" strokeWidth={2} />
        </div>

        <h3 className="text-2xl font-medium text-gray-800 mb-4">
          คุณต้องการลบ {itemName}ชิปร้าาา?
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            ไม่, เปลี่ยนใจแล้ว
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-[#E15050] rounded-md hover:bg-[#B93A3A] transition-colors"
          >
            ใช่, ลบข้อมูลเลย
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedModal;