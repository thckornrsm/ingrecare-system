"use client";
import React, { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import { Icon } from '@iconify/react';
import { 
    LayoutDashboard, BarChart2, Archive, ClipboardList, FileText, 
    Search, ChevronsUpDown, ChevronUp, ChevronDown, Plus,
    Utensils, Leaf, Beef, Fish, Apple, SprayCan, MoreHorizontal, Pizza, 
    ChefHat, Refrigerator, CookingPot, Soup, Shrimp, Egg, Ham, Drumstick, Hamburger, Salad, 
    Bean, Carrot, Cherry, Wheat, LeafyGreen, Vegan, Dessert, CakeSlice, Candy, Lolipop, 
    IceCreamCone, Coffee, Beer, Martini, Wine, CupSoda, Ellipsis
} from 'lucide-react';

// Sample data
const ingredients = [
  { id: 100001, name: "เนื้อวากิวพรีเมียม", shelflife_day: 7, category_id: "เนื้อสัตว์", quantity: 10.00, unit_type: "kg.", },
  { id: 100002, name: "ผักกาดขาว", shelflife_day: 10, category_id: "ผัก", quantity: 2.50, unit_type: "kg.", },
  { id: 100003, name: "เนื้อหมูสับ", shelflife_day: 7, category_id: "เนื้อสัตว์", quantity: 5.00, unit_type: "kg.", },
  { id: 100004, name: "ปลาคอลลี่", shelflife_day: 10, category_id: "ทะเล", quantity: 5, unit_type: "pack.", },
  { id: 100005, name: "ปลาหมึก", shelflife_day: 10, category_id: "ทะเล", quantity: 3.00, unit_type: "kg.", },
  { id: 100006, name: "ซีอิ๊วขาว", shelflife_day: 30, category_id: "เครื่องปรุง", quantity: 7, unit_type: "bottle.", },
  { id: 100007, name: "พริกไทยดำป่น", shelflife_day: 30, category_id: "เครื่องปรุง", quantity: 4, unit_type: "bottle.", },
  { id: 100008, name: "น้ำซุป", shelflife_day: 15, category_id: "อื่นๆ", quantity: 12, unit_type: "kg.", },
  { id: 100009, name: "แตงโม", shelflife_day: 10, category_id: "ผลไม้", quantity: 8, unit_type: "kg.", },
  { id: 100010, name: "สับปะรด", shelflife_day: 10, category_id: "ผลไม้", quantity: 6, unit_type: "kg.", },
  { id: 100011, name: "น้ำมันมะกอก", shelflife_day: 60, category_id: "เครื่องปรุง", quantity: 5, unit_type: "bottle.", },
  { id: 100012, name: "น้ำตาลทราย", shelflife_day: 90, category_id: "เครื่องปรุง", quantity: 20, unit_type: "kg.", },
  { id: 100013, name: "เกลือป่น", shelflife_day: 90, category_id: "เครื่องปรุง", quantity: 15, unit_type: "kg.", },
  { id: 100014, name: "พริกขี้หนูสวน", shelflife_day: 7, category_id: "ผัก", quantity: 1.00, unit_type: "kg.", },
  { id: 100015, name: "กระเทียม", shelflife_day: 30, category_id: "ผัก", quantity: 3.00, unit_type: "kg.", },
  { id: 100016, name: "หอมแดง", shelflife_day: 30, category_id: "ผัก", quantity: 4.00, unit_type: "kg.", },
  { id: 100017, name: "ขิง", shelflife_day: 30, category_id: "ผัก", quantity: 2.00, unit_type: "kg.", },
  { id: 100018, name: "ตะไคร้", shelflife_day: 15, category_id: "ผัก", quantity: 3.00, unit_type: "kg.", },
  { id: 100019, name: "ใบมะกรูด", shelflife_day: 7, category_id: "ผัก", quantity: 0.50, unit_type: "kg.", },
  { id: 100020, name: "น้ำปลา", shelflife_day: 60, category_id: "เครื่องปรุง", quantity: 10, unit_type: "bottle.", },
  { id: 100021, name: "เต้าหู้ขาว", shelflife_day: 5, category_id: "อื่นๆ", quantity: 20, unit_type: "pack.", },
  { id: 100022, name: "ไข่ไก่", shelflife_day: 14, category_id: "อื่นๆ", quantity: 30, unit_type: "pack.", },
  { id: 100023, name: "แป้งสาลี", shelflife_day: 180, category_id: "เครื่องปรุง", quantity: 25, unit_type: "kg.", },
  { id: 100024, name: "แป้งข้าวเจ้า", shelflife_day: 180, category_id: "เครื่องปรุง", quantity: 20, unit_type: "kg.", },
  { id: 100025, name: "ข้าวสารหอมมะลิ", shelflife_day: 365, category_id: "เครื่องปรุง", quantity: 50, unit_type: "kg.", },
];
const categories = ["ทั้งหมด", ...new Set(ingredients.map(item => item.category_id))];

// Icon Options for Categories
const iconOptions = [
    { name: 'Utensils', icon: Utensils }, { name: 'ChefHat', icon: ChefHat }, { name: 'Refrigerator', icon: Refrigerator }, { name: 'CookingPot', icon: CookingPot }, { name: 'Soup', icon: Soup },
    { name: 'Fish', icon: Fish }, { name: 'Shrimp', icon: Shrimp },
    { name: 'Egg', icon: Egg }, { name: 'Beef', icon: Beef }, { name: 'Ham', icon: Ham }, { name: 'Drumstick', icon: Drumstick }, { name: 'Pizza', icon: Pizza }, { name: 'Hamburger', icon: Hamburger },
    { name: 'Salad', icon: Salad }, { name: 'Apple', icon: Apple }, { name: 'Bean', icon: Bean }, { name: 'Carrot', icon: Carrot }, { name: 'Cherry', icon: Cherry }, { name: 'Wheat', icon: Wheat }, { name: 'LeafyGreen', icon: LeafyGreen }, { name: 'Vegan', icon: Vegan },
    { name: 'Dessert', icon: Dessert }, { name: 'CakeSlice', icon: CakeSlice }, { name: 'Candy', icon: Candy }, { name: 'Lolipop', icon: Lolipop }, { name: 'IceCreamCone', icon: IceCreamCone },
    { name: 'Coffee', icon: Coffee }, { name: 'Beer', icon: Beer }, { name: 'Martini', icon: Martini }, { name: 'Wine', icon: Wine }, { name: 'CupSoda', icon: CupSoda },
    { name: 'Ellipsis', icon: Ellipsis }
];
const iconMap = Object.fromEntries(iconOptions.map(opt => [opt.name, opt.icon]));

export default function IngredientList() {
  const [category, setCategory] = useState('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [itemsPerPage, setItemsPerPage] = useState(20); //หน้าละ 20 รายการ
  
  const initialCategories = [
      { name: 'ทั้งหมด', icon: <Utensils size={16} className="text-gray-500"/> }, { name: 'เนื้อสัตว์', icon: <Beef size={16} className="text-gray-500"/> },
      { name: 'ผัก', icon: <Leaf size={16} className="text-gray-500"/> }, { name: 'ทะเล', icon: <Fish size={16} className="text-gray-500"/> },
      { name: 'ผลไม้', icon: <Apple size={16} className="text-gray-500"/> }, { name: 'เครื่องปรุง', icon: <SprayCan size={16} className="text-gray-500"/> },
      { name: 'อื่นๆ', icon: <MoreHorizontal size={16} className="text-gray-500"/> },
  ];
  const [categories, setCategories] = useState(initialCategories);

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
            <h1 className="text-black text-3xl font-bold">วัตถุดิบทั้งหมด</h1>
            <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับวัตถุดิบทั้งหมดในปัจจุบัน</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            
              <div className="relative"> 
                <CustomDropdown label="หมวดหมู่ " categories={categories} selectedCategory={category}
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
                    <SortableHeader label="ID" columnKey="id" />
                    <SortableHeader label="ชื่อ" columnKey="name" />
                    <SortableHeader label="อายุ (วัน)" columnKey="shelflife_day" />
                    <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                    <SortableHeader label="จำนวน" columnKey="quantity" />
                    <SortableHeader label="หน่วย" columnKey="unit_type" />
                    <th scope="col" className="py-3 px-4 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndPaginatedIngredients.length > 0 ? (sortedAndPaginatedIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{ingredient.id}</td>
                      <td className="py-3 px-4">{ingredient.name}</td>
                      <td className="py-3 px-4">{ingredient.shelflife_day}</td>
                      <td className="py-3 px-4">{ingredient.category_id}</td>
                      <td className="py-3 px-4">{ingredient.quantity.toFixed(2)}</td>
                      <td className="py-3 px-4">{ingredient.unit_type}</td>
                      <td className="py-3 px-4">
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