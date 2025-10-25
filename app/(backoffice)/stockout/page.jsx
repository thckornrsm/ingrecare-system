/* รายงานการเบิกจ่ายวัตถุดิบ */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal'), { ssr: false });

import { Plus, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

/* ---------- helpers: กันกรอกค่าที่ไม่ถูกต้อง ---------- */
const blockInvalidKey = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
};
const blockInvalidPaste = (e) => {
  const text = (e.clipboardData || window.clipboardData).getData('text');
  if (/[eE\-\+]/.test(text)) e.preventDefault();
};
const setPositiveNumber = (raw, opts = { float: true, min: 0 }) => {
  if (raw === '' || raw === null) return '';
  let cleaned = String(raw).replace(/[^0-9.]/g, '');
  if (!opts.float) cleaned = cleaned.replace(/\./g, '');
  const num = opts.float ? parseFloat(cleaned || '0') : parseInt(cleaned || '0', 10);
  if (isNaN(num)) return '';
  return num < (opts.min ?? 0) ? '' : cleaned;
};

/* ---------- expiry helpers (รองรับทั้ง is_expired, expiry_date หรือคำนวณเอง) ---------- */
const addByUnit = (date, value, unit) => {
  const d = new Date(date);
  const u = String(unit || '').toLowerCase();
  if (['วัน', 'day', 'days'].includes(u)) d.setDate(d.getDate() + Number(value || 0));
  else if (['สัปดาห์', 'week', 'weeks'].includes(u)) d.setDate(d.getDate() + Number(value || 0) * 7);
  else if (['เดือน', 'month', 'months'].includes(u)) d.setMonth(d.getMonth() + Number(value || 0));
  else d.setDate(d.getDate() + Number(value || 0));
  return d;
};
const computeExpiryDate = (ing) => {
  if (!ing) return null;
  if (ing.expiry_date) return new Date(ing.expiry_date);
  if (ing.received_date && ing.shelflife_value && ing.shelflife_unit_name) {
    return addByUnit(ing.received_date, ing.shelflife_value, ing.shelflife_unit_name);
  }
  return null;
};
const isExpired = (ing) => {
  if (!ing) return false;
  if (typeof ing.is_expired === 'boolean') return ing.is_expired;
  const exp = computeExpiryDate(ing);
  if (!exp) return false;
  const end = new Date(exp);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};

/* ---------- Disburse Form Row ---------- */
const DisburseFormRow = ({ item, onUpdate, onRemove, availableIngredients, units, showDeleteButton }) => {
  const [searchTerm, setSearchTerm] = useState(item.itemName || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // เคลียร์ selection เดิมเมื่อพิมพ์ใหม่
    onUpdate(item.id, { itemName: value, ingredient_id: null, unit: '', unit_id: null });

    if (value.length > 0) {
      const filtered = (availableIngredients || []).filter((ing) =>
        (ing.name || '').toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (ingredient) => {
    // ❌ บล็อกเลือกวัตถุดิบที่หมดอายุ
    if (isExpired(ingredient)) {
      toast.error('วัตถุดิบนี้หมดอายุแล้ว ไม่สามารถเบิกได้');
      return;
    }
    setSearchTerm(ingredient.name);
    const selectedUnit = units.find((u) => u.unit_id === ingredient.unit_id);
    onUpdate(item.id, {
      itemName: ingredient.name,
      ingredient_id: ingredient.ingredient_id,
      unit: selectedUnit?.unit_name || '',
      unit_id: ingredient.unit_id,
    });
    setSuggestions([]);
  };

  const handleQuantityChange = (val) => {
    onUpdate(item.id, { quantity: setPositiveNumber(val, { float: true, min: 0 }) });
  };

  const handleUnitChange = (e) => {
    const selectedUnitId = parseInt(e.target.value, 10);
    const selectedUnit = units.find((u) => u.unit_id === selectedUnitId);
    onUpdate(item.id, { unit_id: selectedUnitId, unit: selectedUnit?.unit_name || '' });
  };

  // ดู state ของวัตถุดิบที่เลือกอยู่ตอนนี้ ว่าหมดอายุไหม
  const selectedIng = availableIngredients.find((i) => i.ingredient_id === item.ingredient_id);
  const selectedIsExpired = isExpired(selectedIng);

  return (
    <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
      {/* ✅ แสดงปุ่มลบเฉพาะเมื่อ showDeleteButton = true */}
      {onRemove && showDeleteButton && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )}
      <form className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อวัตถุดิบ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="ชื่อวัตถุดิบในสต็อก เช่น เนื้อหมูสันนอก, ผักกาดขาว"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
          />

          {isFocused && suggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
              {suggestions.map((ing) => {
                const expired = isExpired(ing);
                return (
                  <li
                    key={ing.ingredient_id}
                    onMouseDown={() => !expired && handleSelectSuggestion(ing)}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                      expired ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-100'
                    }`}
                    title={expired ? 'หมดอายุแล้ว' : ''}
                  >
                    <span>{ing.name}</span>
                    {expired && (
                      <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700">
                        หมดอายุ
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนที่เบิกจ่าย <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onKeyDown={blockInvalidKey}
              onPaste={blockInvalidPaste}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={selectedIsExpired}
              placeholder={selectedIsExpired ? 'รายการนี้หมดอายุ' : 'ระบุค่าตัวเลข เช่น 2.5, 10'}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black ${
                selectedIsExpired ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            หน่วยนับ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={item.unit || 'แสดงผลอัตโนมัติ เมื่อระบุชื่อวัตถุดิบ'}
            readOnly
            disabled={selectedIsExpired}
            className={`w-full px-3 py-2 rounded-md focus:outline-none bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300 focus:ring-2 focus:ring-[#3FA170] ${
              selectedIsExpired ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
        </div>

        {selectedIsExpired && (
          <p className="text-sm text-red-600">วัตถุดิบนี้หมดอายุแล้ว ไม่สามารถเบิกได้</p>
        )}
      </form>
    </div>
  );
};

/* ---------- Main DisbursePage ---------- */
export default function DisbursePage() {
  const router = useRouter();

  const createNewItem = () => ({
    id: Date.now() + Math.random(),
    itemName: '',
    ingredient_id: null,
    quantity: '',
    unit: '',
    unit_id: null,
  });

  const [items, setItems] = useState([createNewItem()]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingRes, unitRes] = await Promise.all([fetch('/api/ingredients'), fetch('/api/units')]);
        if (!ingRes.ok || !unitRes.ok) throw new Error('Failed to fetch initial data');
        setAvailableIngredients(await ingRes.json());
        setUnits(await unitRes.json());
      } catch (error) {
        console.error('FETCH_ERROR', error);
        toast.error('ไม่สามารถโหลดข้อมูลวัตถุดิบได้');
      }
    };
    fetchData();
  }, []);

  // 🔒 ล็อกสกรีนเมื่อเปิดโมดัล (กัน scroll พื้นหลัง)
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isModalOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  const handleAddItem = () => setItems((prev) => [...prev, createNewItem()]);
  const handleRemoveItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  const handleUpdateItem = (id, updated) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
  const handleClearAll = () => setItems((prev) => prev.map((i) => ({ ...createNewItem(), id: i.id })));

  // ✅ ตรวจว่ามีรายการหมดอายุใน selection ไหม
  const hasExpiredInSelection = () =>
    items.some((it) => {
      const ing = availableIngredients.find((a) => a.ingredient_id === it.ingredient_id);
      return isExpired(ing);
    });

  const handleSubmit = () => {
    const isInvalid = items.some((i) => !i.ingredient_id || !i.quantity || Number(i.quantity) <= 0 || !i.unit_id);
    if (isInvalid) return toast.error('การเบิกจ่ายวัตถุดิบไม่สำเร็จ กรุณากรอกข้อมูลให้ครบถ้วน');

    if (hasExpiredInSelection()) {
      return toast.error('มีวัตถุดิบที่หมดอายุในรายการ ไม่สามารถเบิกได้');
    }

    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    // กันอีกชั้น (ป้องกันความผิดพลาดจาก state)
    if (hasExpiredInSelection()) {
      setIsModalOpen(false);
      return toast.error('มีวัตถุดิบที่หมดอายุในรายการ ไม่สามารถเบิกได้');
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('กำลังบันทึกข้อมูล...');

    try {
      const payload = {
        description: `Stock-out on ${new Date().toLocaleDateString()}`,
        items: items.map((item) => ({
          ingredient_id: item.ingredient_id,
          quantity: parseFloat(item.quantity),
          unit_id: item.unit_id,
        })),
      };

      const res = await fetch('/api/stockout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Something went wrong');

      toast.success('การเบิกจ่ายวัตถุดิบสำเร็จ!', { id: loadingToast });
      setIsModalOpen(false);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('DISBURSE_ERROR', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-black text-3xl font-bold">เบิกจ่ายวัตถุดิบ</h1>
            <p className="text-[#979999]">เพิ่มข้อมูลการเบิกจ่ายวัตถุดิบในแต่ละล็อต</p>
          </div>
          <button
            onClick={handleAddItem}
            className="w-full sm:w-auto justify-center px-4 py-2 text-sm rounded-lg border border-[#3FA170] bg-[#3FA170] text-white font-medium flex items-center gap-2 hover:bg-[#1E7957] transition-colors"
          >
            <Plus size={16} /> เพิ่มรายการวัตถุดิบ
          </button>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <DisburseFormRow
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
              availableIngredients={availableIngredients}
              units={units}
              showDeleteButton={items.length > 1} // ✅ แสดงปุ่มลบเฉพาะเมื่อมีมากกว่า 1 รายการ
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ล้างข้อมูล
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2 text-sm text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957]"
          >
            ยืนยันข้อมูล
          </button>
        </div>
      </main>

      {/* ✅ ใช้ ConfirmationModal ที่แชร์กับหน้า stockin */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        formType="stock-out"
      />
    </>
  );
}