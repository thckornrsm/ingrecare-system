"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
 
// Input field with label and error handling
const InputField = forwardRef(({ label, isError, errorMessage, className = "", ...props }, ref) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
    <input
      ref={ref}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition 
        ${isError ? "border-1 border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#3FA170]"}
      `}
      {...props}
    />
    {isError && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
  </div>
));
InputField.displayName = "InputField";

// Readonly field Hook
const ReadonlyField = ({ label, value }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
    <input
      value={value ?? ""}
      readOnly
      className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3FA170]"
    />
  </div>
);

function EditModal({
  isOpen,
  onClose,
  onSave,
  ingredient,
  categories = [],
  units = [],
  formType = "default",
}) {
  const [formData, setFormData] = useState({});
  const [nameError, setNameError] = useState(false);
  const [shelflifeError, setShelflifeError] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const nameInputRef = useRef(null);

  // focus ชื่อวัตถุดิบเฉพาะตอนเปิดโมดัล
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // sync ค่าเริ่มต้นจาก ingredient
  useEffect(() => {
    if (ingredient) {
      const [outDate, outTime] = ingredient.out_datetime
        ? ingredient.out_datetime.split("T")
        : ["", ""];
      setFormData({
        name: ingredient.name || "",
        quantity: ingredient.quantity ?? "",
        unit_type: ingredient.unit_type || ingredient.unit || "",
        category_id: ingredient.category_id || ingredient.category || "",
        shelflife_day:
          ingredient.shelflife_day === 0 || ingredient.shelflife_day
            ? String(ingredient.shelflife_day)
            : "",
        received_date: ingredient.received_date || "",
        out_date: outDate,
        out_time: outTime,
      });
      setNameError(false);
      setShelflifeError(false);
      setQuantityError(false);
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const sanitized = value.replace(/[^0-9.]/g, "");
      if ((sanitized.match(/\./g) || []).length <= 1) {
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
        
        if (formType === "stock-out") {
          const numValue = parseFloat(sanitized);
          if (sanitized === "0" || numValue === 0) {
            setQuantityError(true);
          } else {
            setQuantityError(false);
          }
        }
      }
    } else if (name === "shelflife_day") {
      const sanitized = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      
      if (formType === "stock-in") {
        if (sanitized === "0") {
          setShelflifeError(true);
        } else {
          setShelflifeError(false);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "name" && value.trim()) setNameError(false);
  };

  const handleDropdownChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = () => {
    if (!formData.name || formData.name.trim() === "") {
      setNameError(true);
      return;
    }
    
    if (formType === "stock-in") {
      if (formData.shelflife_day === "0" || formData.shelflife_day === "") {
        setShelflifeError(true);
        return;
      }
    }
    
    if (formType === "stock-out") {
      const numValue = parseFloat(formData.quantity);
      if (formData.quantity === "0" || numValue === 0 || !formData.quantity) {
        setQuantityError(true);
        return;
      }
    }
    
    setNameError(false);
    setShelflifeError(false);
    setQuantityError(false);

    const updatedIngredient = {
      ...ingredient,
      ...formData,
      quantity:
        formData.quantity === "" || formData.quantity === null
          ? undefined
          : Number(formData.quantity),
      shelflife_day:
        formData.shelflife_day === "" || formData.shelflife_day === null
          ? undefined
          : Number(formData.shelflife_day),
      out_datetime: formData.out_date
        ? `${formData.out_date}T${formData.out_time || "00:00"}`
        : undefined,
    };

    onSave(updatedIngredient);
  };

  const handleSaveOnEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  const handleGeneralKeyDown = (event) => {
    if (event.key === "Enter") event.preventDefault();
  };

  const isNameError = nameError && (!formData.name || formData.name.trim() === "");
  const isShelflifeError = shelflifeError && (formData.shelflife_day === "0" || formData.shelflife_day === "");
  const isQuantityError = quantityError && (formData.quantity === "0" || parseFloat(formData.quantity) === 0 || !formData.quantity);

  const renderFormContent = () => {
    switch (formType) {
      case "all-ingredients":
        return (
          <>
            <InputField
              ref={nameInputRef}
              label="ชื่อวัตถุดิบ"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSave())}
              isError={isNameError}
              errorMessage="ชื่อวัตถุดิบห้ามเว้นว่าง"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่</label>
                <CustomDropdown
                  placeholder="เลือกหมวดหมู่"
                  categories={categories}
                  selectedCategory={formData.category_id}
                  onSelectCategory={(val) => handleDropdownChange("category_id", val)}
                />
              </div>

              <ReadonlyField label="อายุ (วัน)" value={formData.shelflife_day} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadonlyField label="จำนวนในคลัง" value={formData.quantity} />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">หน่วยนับ</label>
                <CustomDropdown
                  placeholder="เลือกหน่วยนับ"
                  categories={units}
                  selectedCategory={formData.unit_type}
                  onSelectCategory={(val) => handleDropdownChange("unit_type", val)}
                />
              </div>
            </div>
          </>
        );

      case "stock-in":
        return (
          <>
            <ReadonlyField label="ชื่อวัตถุดิบ" value={formData.name} />

            <div className="grid grid-cols-1 gap-4">
              <ReadonlyField label="หมวดหมู่" value={formData.category_id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="วันที่นำเข้า"
                name="received_date"
                type="date"
                value={formData.received_date || ""}
                onChange={handleChange}
              />
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="อายุ (วัน)"
                name="shelflife_day"
                type="text"
                inputMode="numeric"
                min={1}
                value={formData.shelflife_day || ""}
                onChange={handleChange}
                isError={isShelflifeError}
                errorMessage="อายุต้องมากกว่า 0 วัน"
              />
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="จำนวน"
                name="quantity"
                type="text"
                inputMode="decimal"
                min={0}
                value={formData.quantity || ""}
                onChange={handleChange}
              />
              <ReadonlyField label="หน่วยนับ" value={formData.unit_type} />
              <div />
            </div>
          </>
        );

      case "stock-out":
        return ( 
          <>
            <ReadonlyField label="ชื่อวัตถุดิบ" value={formData.name} />
        
            <div className="grid grid-cols-1 gap-4">
              <ReadonlyField label="หมวดหมู่" value={formData.category_id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="วันเบิกจ่าย"
                name="out_date"
                type="date"
                value={formData.out_date || ""}
                onChange={handleChange}
              />
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="เวลาเบิกจ่าย"
                name="out_time"
                type="time"
                value={formData.out_time || ""}
                onChange={handleChange}
              />
              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="จำนวน"
                name="quantity"
                type="text"
                inputMode="decimal"
                min={0}
                value={formData.quantity || ""}
                onChange={handleChange}
                isError={isQuantityError}
                errorMessage="จำนวนต้องมากกว่า 0"
              />
              <ReadonlyField label="หน่วยนับ" value={formData.unit_type} />
              <div />
            </div>
          </>
        );

      default:
        return (
          <>
            <InputField
              ref={nameInputRef}
              label="ชื่อวัตถุดิบ"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              onKeyDown={handleSaveOnEnter}
              isError={isNameError}
              errorMessage="ชื่อวัตถุดิบห้ามเว้นว่าง"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">หมวดหมู่</label>
                <CustomDropdown
                  placeholder="เลือกหมวดหมู่"
                  categories={categories}
                  selectedCategory={formData.category_id}
                  onSelectCategory={(val) => handleDropdownChange("category_id", val)}
                />
              </div>

              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="อายุ (วัน)"
                name="shelflife_day"
                type="text"
                inputMode="numeric"
                min={0}
                value={formData.shelflife_day || ""}
                onChange={handleChange}
              />

              <InputField
                onKeyDown={handleGeneralKeyDown}
                label="จำนวนในคลัง"
                name="quantity"
                type="text"
                inputMode="decimal"
                min={0}
                value={formData.quantity || ""}
                onChange={handleChange}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">หน่วยนับ</label>
                <CustomDropdown
                  placeholder="เลือกหน่วยนับ"
                  categories={units}
                  selectedCategory={formData.unit_type}
                  onSelectCategory={(val) => handleDropdownChange("unit_type", val)}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-gray-800">แก้ไข ID #{ingredient.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">{renderFormContent()}</div>

        <div className="flex flex-wrap justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            type="button"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#2F7A5E] transition-colors"
            type="button"
          >
            แก้ไขข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;