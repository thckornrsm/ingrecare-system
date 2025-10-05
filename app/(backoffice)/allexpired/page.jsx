"use client";
import React, { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import { Icon } from '@iconify/react';
import { 
    Search, ChevronsUpDown, ChevronUp, ChevronDown,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal
} from 'lucide-react';
import Swal from 'sweetalert2';

// Sample data from the target code
const ingredients = [
    { id: 100001, name: "เนื้อวากิวพรีเมียม", expiry_day: 7, category_id: "เนื้อสัตว์", quantity: 10.00, unit_type: "kg.", },
    { id: 100002, name: "ผักกาดขาว", expiry_day: 10, category_id: "ผัก", quantity: 2.50, unit_type: "kg.", },
    { id: 100003, name: "เนื้อหมูสับ", expiry_day: 7, category_id: "เนื้อสัตว์", quantity: 5.00, unit_type: "kg.", },
    { id: 100004, name: "ปลาคอลลี่", expiry_day: 10, category_id: "ทะเล", quantity: 5, unit_type: "pack", },
    { id: 100005, name: "ปลาหมึก", expiry_day: 10, category_id: "ทะเล", quantity: 3.00, unit_type: "kg.", },
    { id: 100006, name: "ซีอิ๊วขาว", expiry_day: 30, category_id: "เครื่องปรุง", quantity: 7, unit_type: "bottle", },
    { id: 100007, name: "พริกไทยดำป่น", expiry_day: 30, category_id: "เครื่องปรุง", quantity: 4, unit_type: "bottle", },
    { id: 100008, name: "น้ำซุป", expiry_day: 15, category_id: "อื่นๆ", quantity: 12, unit_type: "kg.", },
    { id: 100009, name: "แตงโม", expiry_day: 10, category_id: "ผลไม้", quantity: 8, unit_type: "kg.", },
];

// Dynamically generate category options with icons for the dropdown
const categoryIconMap = {
    'เนื้อสัตว์': <Beef size={16} className="text-gray-500"/>,
    'ผัก': <Leaf size={16} className="text-gray-500"/>,
    'ทะเล': <Fish size={16} className="text-gray-500"/>,
    'ผลไม้': <Apple size={16} className="text-gray-500"/>,
    'เครื่องปรุง': <SprayCan size={16} className="text-gray-500"/>,
    'อื่นๆ': <MoreHorizontal size={16} className="text-gray-500"/>,
    'ทั้งหมด': <Utensils size={16} className="text-gray-500"/>
};
const uniqueCategoryNames = ["ทั้งหมด", ...new Set(ingredients.map(item => item.category_id))];
const categoryOptions = uniqueCategoryNames.map(name => ({
    name: name,
    icon: categoryIconMap[name] || <MoreHorizontal size={16} className="text-gray-500"/>
}));

export default function AllExpired() {
  const [category, setCategory] = useState('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // SweetAlert2 edit handler
  const handleEdit = (ingredient) => {
    Swal.fire({
      title: `แก้ไข: ${ingredient.name}`,
      html: `
        <div class="p-2 space-y-4 text-left">
          <div>
            <label for="swal-name" class="block mb-1 text-sm font-medium text-gray-700">ชื่อวัตถุดิบ</label>
            <input id="swal-name" class="swal2-input m-0 w-full" value="${ingredient.name}">
          </div>
          <div>
            <label for="swal-quantity" class="block mb-1 text-sm font-medium text-gray-700">จำนวน</label>
            <input id="swal-quantity" type="number" step="0.01" class="swal2-input m-0 w-full" value="${ingredient.quantity}">
          </div>
          <div>
            <label for="swal-expiry" class="block mb-1 text-sm font-medium text-gray-700">อายุ (วัน)</label>
            <input id="swal-expiry" type="number" class="swal2-input m-0 w-full" value="${ingredient.expiry_day}">
          </div>
        </div>
      `,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      showCancelButton: true,
      focusConfirm: false,
      customClass: {
        confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mx-2 transition-colors",
        cancelButton: "bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mx-2 transition-colors"
      },
      buttonsStyling: false,
      preConfirm: () => {
        // ดึงข้อมูลจากฟอร์มก่อนยืนยัน
        return {
          name: document.getElementById('swal-name').value,
          quantity: parseFloat(document.getElementById('swal-quantity').value),
          expiry_day: parseInt(document.getElementById('swal-expiry').value)
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // ในแอปจริง เราจะนำข้อมูล `result.value` ไปอัปเดต State หรือส่ง API
        console.log("Updated data:", result.value); 
        Swal.fire(
          'บันทึกแล้ว!',
          'ข้อมูลวัตถุดิบถูกอัปเดตแล้ว',
          'success'
        )
      }
    });
  };

  // SweetAlert2 delete handler
  const handleDelete = (ingredient) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mx-2 transition-colors",
        cancelButton: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mx-2 transition-colors"
      },
      buttonsStyling: false
    });
    
    swalWithTailwindButtons.fire({
      text: `คุณต้องการลบ "${ingredient.name}" ใช่ไหม?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ไม่, ยกเลิก",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithTailwindButtons.fire({
          title: "ลบสำเร็จ!",
          text: `วัตถุดิบ "${ingredient.name}" ถูกลบแล้ว`,
          icon: "success"
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwindButtons.fire({
          title: "ยกเลิก",
          text: "ข้อมูลวัตถุดิบของคุณปลอดภัยดี",
          icon: "error"
        });
      }
    });
  };

  const filteredIngredients = useMemo(() => {
    let processData = [...ingredients];
    if (searchTerm) {
      processData = processData.filter((ing) =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category !== 'ทั้งหมด') {
      processData = processData.filter(
        (ing) => ing.category_id === category
      );
    }
    return processData;
  }, [searchTerm, category]);

  const sortedAndPaginatedIngredients = useMemo(() => {
      let sortedData = [...filteredIngredients];
      if (sortConfig.key) {
          sortedData.sort((a, b) => {
              if (a[sortConfig.key] < b[sortConfig.key]) {
                  return sortConfig.direction === 'ascending' ? -1 : 1;
              }
              if (a[sortConfig.key] > b[sortConfig.key]) {
                  return sortConfig.direction === 'ascending' ? 1 : -1;
              }
              return 0;
          });
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

  const requestSort = (key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (value) => {
      setItemsPerPage(Number(value));
      setCurrentPage(1);
  };
  
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const SortIndicator = ({ direction, isActive }) => {
      if (!isActive) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50" />;
      if (direction === 'ascending') return <ChevronUp size={16} className="text-gray-800" />;
      return <ChevronDown size={16} className="text-gray-800" />;
  };
  
  const SortableHeader = ({ label, columnKey, className }) => {
      const isActive = sortConfig.key === columnKey;
      return (
          <th scope="col" className={`py-3 px-4 font-normal select-none ${className}`}>
              <button
                  onClick={() => requestSort(columnKey)}
                  className="flex items-center gap-2 group w-full text-left"
              >
                  <span>{label}</span>
                  <SortIndicator direction={sortConfig.direction} isActive={isActive} />
              </button>
          </th>
      );
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto py-9 px-25">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-black text-3xl font-bold">วัตถุดิบหมดอายุ</h1>
              <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับวัตถุดิบที่หมดอายุแล้ว</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative"> 
                  <CustomDropdown label="หมวดหมู่ " categories={categoryOptions} selectedCategory={category}
                    onSelectCategory={(selectedCat) => {
                      setCategory(selectedCat);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="relative w-full">
                  <input type="text" placeholder="ค้นหาจากชื่อวัตถุดิบ..." value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#3FA170]" />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-sm text-gray-500 capitalize bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortableHeader label="ID" columnKey="id" className="pr-4" />
                      <SortableHeader label="ชื่อ" columnKey="name" />
                      <SortableHeader label="อายุ (วัน)" columnKey="expiry_day" />
                      <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                      <SortableHeader label="จำนวน" columnKey="quantity" />
                      <SortableHeader label="หน่วย" columnKey="unit_type" />
                      <th scope="col" className="py-3 px-2 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndPaginatedIngredients.length > 0 ? (sortedAndPaginatedIngredients.map((ingredient) => (
                      <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2">{ingredient.id}</td>
                        <td className="py-3 px-2">{ingredient.name}</td>
                        <td className="py-3 px-2">{ingredient.expiry_day}</td>
                        <td className="py-3 px-2">{ingredient.category_id}</td>
                        <td className="py-3 px-2">{ingredient.quantity.toFixed(2)}</td>
                        <td className="py-3 px-2">{ingredient.unit_type}</td>
                        <td className="py-3 px-2">
                          <div className="flex justify-start space-x-2">
                            <button 
                              onClick={() => handleEdit(ingredient)}
                              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                              <Icon icon="mynaui:edit" className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(ingredient)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                              <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center p-8 text-gray-500">
                          ไม่พบข้อมูลวัตถุดิบ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={filteredIngredients.length}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}