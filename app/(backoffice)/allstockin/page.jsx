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

// Sample data from the target code
const initialIngredientsData = [
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

// Pre-process data to add date fields for sorting and display
const ingredients = initialIngredientsData.map((ingredient, index) => ({
    ...ingredient,
    received_date: `2024-06-0${(index % 9) + 1}`,
    expiry_date: `2024-06-${(index % 9) + 8}`,
}));

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

export default function AllStockin() {
  const [category, setCategory] = useState('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const filteredIngredients = useMemo(() => {
    let processData = [...ingredients];
    if (searchTerm) {
      processData = processData.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category !== 'ทั้งหมด') {
      processData = processData.filter(
        (ingredient) => ingredient.category_id === category
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
      setCurrentPage(1); // Reset to page 1 when changing items per page
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
              <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
              <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
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
                      <SortableHeader label="ID" columnKey="id" className="pr-2" />
                      <SortableHeader label="ชื่อ" columnKey="name" />
                      <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                      <SortableHeader label="วันหมดอายุ" columnKey="expiry_date" />
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
                        <td className="py-3 px-2">{ingredient.received_date}</td>
                        <td className="py-3 px-2">{ingredient.expiry_date}</td>
                        <td className="py-3 px-2">{ingredient.category_id}</td>
                        <td className="py-3 px-2">{ingredient.quantity.toFixed(2)}</td>
                        <td className="py-3 px-2">{ingredient.unit_type}</td>
                        <td className="py-3 px-2">
                          <div className="flex justify-start space-x-2">
                            <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                              <Icon icon="mynaui:edit" className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                              <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center p-8 text-gray-500">
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