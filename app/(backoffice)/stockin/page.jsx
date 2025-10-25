'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import CustomDropdown from '@/components/CustomDropdown';
import AddCategoryModal from '@/components/AddCategoryModal';
import AddUnitModal from '@/components/AddUnitModal';
import dynamic from 'next/dynamic';
const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal'), { ssr: false });

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

/* ---------- helpers ป้องกันการกรอกค่าที่ไม่ถูกต้อง ---------- */
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

/* ---------- date helpers ---------- */
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const isFutureDate = (d) => startOfDay(d) > startOfDay(new Date());

/* ---------- CustomDateInput ---------- */
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      readOnly
      className="bg-white w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 text-black cursor-pointer"
    />
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

/* ---------- IngredientFormRow ---------- */
const IngredientFormRow = ({
  item, onUpdate, onRemove,
  availableCategories, onAddNewCategoryClick,
  quantityUnits, onAddNewQuantityUnitClick,
  shelfLifeUnits,
}) => {
  const handleInputChange = (field, value) => onUpdate(item.id, { [field]: value });

  const handleDateChange = (date) => {
    if (!date) return;
    if (isFutureDate(date)) {
      toast.error('ห้ามเลือกวันที่ในอนาคต');
      return;
    }
    handleInputChange('received_date', date);
  };

  return (
    <div className="bg-[#F6F8FA] p-9 rounded-lg border border-[#E5E5E5] relative">
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่รับวัตถุดิบ <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={item.received_date}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            wrapperClassName="w-full"
            customInput={<CustomDateInput placeholder="วว/ดด/ปปปป" />}
            popperClassName="z-20"
            maxDate={new Date()}
            filterDate={(d) => !isFutureDate(d)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อวัตถุดิบ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="เช่น เนื้อหมูสันนอก, ผักกาดขาว"
            value={item.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ประเภทของวัตถุดิบ <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            categories={availableCategories}
            selectedCategory={item.category_name}
            onSelectCategory={(selectedType) => handleInputChange('category_name', selectedType)}
            placeholder="เลือกหรือเพิ่มหมวดหมู่ของวัตถุดิบ"
            onAddNewClick={onAddNewCategoryClick}
            addNewText="เพิ่มหมวดหมู่"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            จำนวนนำเข้า <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={item.quantity}
            onChange={(e) =>
              handleInputChange(
                'quantity',
                setPositiveNumber(e.target.value, { float: true, min: 0 })
              )
            }
            onKeyDown={blockInvalidKey}
            onPaste={blockInvalidPaste}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="ระบุค่าตัวเลข เช่น 2.5, 10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            หน่วยนับ <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            categories={quantityUnits}
            selectedCategory={item.unit_name}
            onSelectCategory={(unit) => handleInputChange('unit_name', unit)}
            placeholder="เลือกหรือเพิ่มหน่วยนับ"
            onAddNewClick={onAddNewQuantityUnitClick}
            addNewText="เพิ่มหน่วยนับ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            อายุการเก็บรักษา <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={item.shelflife_value}
            onChange={(e) =>
              handleInputChange(
                'shelflife_value',
                setPositiveNumber(e.target.value, { float: false, min: 1 })
              )
            }
            onKeyDown={blockInvalidKey}
            onPaste={blockInvalidPaste}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="ระบุค่าตัวเลข เช่น 7, 30"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3FA170] focus:ring-2 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            หน่วยเวลา <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            categories={shelfLifeUnits}
            selectedCategory={item.shelflife_unit_name}
            onSelectCategory={(unit) => handleInputChange('shelflife_unit_name', unit)}
            placeholder="เลือกหน่วยเวลา"
          />
        </div>
      </div>
    </div>
  );
};

/* ---------- Main: StockInPage ---------- */
export default function StockInPage() {
  const router = useRouter();

  const createNewItem = () => ({
    id: Date.now() + Math.random(),
    received_date: new Date(),
    name: '',
    category_name: '',
    quantity: '',
    unit_name: '',
    shelflife_value: '',
    shelflife_unit_name: '',
  });

  const [items, setItems] = useState([createNewItem()]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [availableTimeUnits, setAvailableTimeUnits] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [isAddUnitModalOpen, setAddUnitModalOpen] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [catRes, unitRes, timeUnitRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/units'),
        fetch('/api/time_units')
      ]);
      const categories = await catRes.json();
      const units = await unitRes.json();
      const timeUnits = await timeUnitRes.json();

      setAvailableCategories(categories.map(c => ({ name: c.category_name })));
      setAvailableUnits(units.map(u => ({ name: u.unit_name })));
      setAvailableTimeUnits(timeUnits.map(tu => ({ name: tu.unit_name })));
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลพื้นฐานได้');
      console.error('Failed to fetch dropdown data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDropdownData(); }, []);

  useEffect(() => {
    const anyOpen = isConfirmModalOpen || isAddCategoryModalOpen || isAddUnitModalOpen;
    document.body.classList.toggle('overflow-hidden', anyOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isConfirmModalOpen, isAddCategoryModalOpen, isAddUnitModalOpen]);

  const handleUpdateItem = (id, updatedValues) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updatedValues } : item));
  };
  const handleAddItem = () => setItems([...items, createNewItem()]);
  const handleRemoveItem = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
  const handleClearAll = () => { setItems([createNewItem()]); };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasFuture = items.some(it => !it.received_date || isFutureDate(it.received_date));
    if (hasFuture) {
      toast.error('ห้ามนำเข้าด้วยวันที่ในอนาคต กรุณาเลือกวันที่วันนี้หรือย้อนหลัง');
      return;
    }

    const isInvalid = items.some(item =>
      !item.received_date || !item.name || !item.category_name ||
      !item.quantity || Number(item.quantity) <= 0 || !item.unit_name ||
      !item.shelflife_value || Number(item.shelflife_value) <= 0 || !item.shelflife_unit_name
    );

    if (isInvalid) {
      toast.error('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน');
    } else {
      setAddCategoryModalOpen(false);
      setAddUnitModalOpen(false);
      setConfirmModalOpen(true);
    }
  };

  const handleAddCategory = async ({ name }) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: name })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add category');

      toast.success('เพิ่มหมวดหมู่ใหม่สำเร็จ!');
      fetchDropdownData();
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleAddUnit = async ({ name }) => {
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_name: name })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add unit');

      toast.success('เพิ่มหน่วยนับใหม่สำเร็จ!');
      fetchDropdownData();
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading('กำลังบันทึกข้อมูล...');
    
    const payload = {
      items: items.map(item => ({
        name: item.name,
        category_name: item.category_name,
        unit_name: item.unit_name,
        shelflife_value: parseInt(item.shelflife_value, 10),
        shelflife_unit_name: item.shelflife_unit_name,
        quantity: parseFloat(item.quantity),
        received_date: item.received_date,
      })),
    };

    try {
      const res = await fetch('/api/stockin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong');

      toast.success('บันทึกข้อมูลการนำเข้าสำเร็จ!', { id: loadingToast });
      setTimeout(() => { router.push('/dashboard'); }, 1500);
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">นำเข้าวัตถุดิบ</h1>
              <p className="text-[#979999]">เพิ่มข้อมูลการนำเข้าของวัตถุดิบในแต่ละล็อต</p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3FA170] bg-[#3FA170] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E7957] sm:w-auto"
            >
              <Plus size={16} /> เพิ่มรายการวัตถุดิบ
            </button>
          </div>

          <div className="space-y-6">
            {items.map(item => (
              <IngredientFormRow
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={items.length > 1 ? handleRemoveItem : null}
                availableCategories={availableCategories}
                onAddNewCategoryClick={() => setAddCategoryModalOpen(true)}
                quantityUnits={availableUnits}
                onAddNewQuantityUnitClick={() => setAddUnitModalOpen(true)}
                shelfLifeUnits={availableTimeUnits}
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
              type="submit"
              className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957]"
            >
              ยืนยันข้อมูล
            </button>
          </div>
        </form>
      </main>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        formType="stock-in"
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={availableCategories.map(c => ({ name: c.name }))}
      />

      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setAddUnitModalOpen(false)}
        onAddUnit={handleAddUnit}
        existingUnits={availableUnits.map(u => ({ name: u.name }))}
      />
    </>
  );
}