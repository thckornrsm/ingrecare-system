"use client";

import React, { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import DeletedModal from "@/components/DeletedModal";
import EditModal from "@/components/EditModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Trash2, PencilLine } from "lucide-react";

// Main Page
export default function AllStockin() {
  const [stockinHistory, setStockinHistory] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // <-- State ใหม่สำหรับเก็บหมวดหมู่ทั้งหมด
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "descending" });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [stockinRes, categoriesRes] = await Promise.all([
            fetch("/api/stockin"),
            fetch("/api/categories")
        ]);

        if (!stockinRes.ok) throw new Error((await stockinRes.json()).error || "ไม่สามารถดึงข้อมูลประวัติได้");
        if (!categoriesRes.ok) throw new Error("ไม่สามารถดึงข้อมูลหมวดหมู่ได้");
        
        const batches = await stockinRes.json();
        const dbCategories = await categoriesRes.json();

        const formattedHistory = batches.flatMap((batch) =>
          batch.stockins.map((s) => ({
            id: s.stockin_id,
            name: s.ingredient.name,
            received_date: s.received_date,
            expiry_date: s.expiry_date,
            category: s.ingredient.category.category_name,
            quantity: s.quantity,
            unit: s.unit.unit_name,
          }))
        );
        setStockinHistory(formattedHistory);
        setAllCategories(dbCategories); // <-- บันทึกข้อมูลหมวดหมู่ทั้งหมด

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryOptions = useMemo(() => {
    const options = allCategories.map(cat => ({ name: cat.category_name }));
    return [{ name: "ทั้งหมด" }, ...options];
  }, [allCategories]);

  const unitOptions = useMemo(() => {
    if (stockinHistory.length === 0) return [{ name: "—" }];
    const unique = [...new Set(stockinHistory.map((i) => i.unit))];
    return unique.map((u) => ({ name: u }));
  }, [stockinHistory]);

  const filteredIngredients = useMemo(() => {
    return stockinHistory.filter(
      (item) =>
        (category === "ทั้งหมด" || item.category === category) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockinHistory, category, searchTerm]);

  const sortedAndPaginatedIngredients = useMemo(() => {
    let sorted = [...filteredIngredients];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
    setSortConfig({ key, direction });
  };

  const handleEditClick = (item) => {
    const received = new Date(item.received_date);
    const expiry = new Date(item.expiry_date);
    const diffDays = Math.ceil(Math.abs(expiry - received) / (1000 * 60 * 60 * 24));
    
    setItemToEdit({
      ...item,
      category_id: item.category,
      unit_type: item.unit,
      shelflife_day: diffDays,
      received_date: received.toISOString().split("T")[0],
    });
  };
  
  const handleDeleteClick = (item) => {
    setItemToDelete({
        ...item,
        count: 0,
    });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const loadingToast = toast.loading("กำลังลบข้อมูล...");
    try {
      const res = await fetch(`/api/stockin/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "ไม่สามารถลบข้อมูลได้");
      }
      setStockinHistory((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      toast.success("ลบข้อมูลสำเร็จ!", { id: loadingToast });
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = async (formData) => {
    const loadingToast = toast.loading("กำลังบันทึกการแก้ไข...");
    try {
      const receivedDate = new Date(formData.received_date);
      receivedDate.setUTCHours(0, 0, 0, 0);
      const shelflifeDays = parseInt(formData.shelflife_day, 10) || 0;
      const newExpiryDate = new Date(receivedDate.getTime());
      newExpiryDate.setUTCDate(receivedDate.getUTCDate() + shelflifeDays);

      const payload = {
        id: formData.id,
        name: formData.name,
        category: formData.category_id,
        quantity: Number(formData.quantity),
        unit: formData.unit_type,
        received_date: receivedDate.toISOString(),
        expiry_date: newExpiryDate.toISOString(),
      };

      const res = await fetch(`/api/stockin/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "ไม่สามารถบันทึกได้");
      }

      const { updatedItem } = await res.json();

      setStockinHistory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      toast.success("บันทึกการแก้ไขสำเร็จ!", { id: loadingToast });
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
    } finally {
      setItemToEdit(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" });

  const SortIndicator = ({ direction, isActive }) => {
    if (!isActive) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100" />;
    if (direction === "ascending") return <ChevronUp size={16} className="text-gray-800" />;
    return <ChevronDown size={16} className="text-gray-800" />;
  };

  const SortableHeader = ({ label, columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <th scope="col" className="py-3 px-4 font-medium select-none">
        <button onClick={() => requestSort(columnKey)} className="flex items-center gap-2 group w-full text-left">
          <span>{label}</span>
          <SortIndicator direction={sortConfig.direction} isActive={isActive} />
        </button>
      </th>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
      <Toaster position="top-right" />
      <DeletedModal
        isOpen={!!itemToDelete}
        onConfirm={handleConfirmDelete}
        itemToDelete={itemToDelete}
        onClose={() => setItemToDelete(null)}
      />
      <EditModal
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        onSave={handleSaveEdit}
        ingredient={itemToEdit}
        categories={categoryOptions.filter((c) => c.name !== "ทั้งหมด")}
        units={unitOptions}
        formType="stock-in"
      />

      <div className="mb-8">
        <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
        <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
      </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <CustomDropdown
            label="หมวดหมู่"
            categories={categoryOptions}
            selectedCategory={category}
            onSelectCategory={(cat) => { setCategory(cat); setCurrentPage(1); }}
          />
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหาจากชื่อวัตถุดิบ..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#3FA170]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-sm text-gray-500 capitalize bg-gray-100 border-b border-gray-200">
                <tr>
                  <SortableHeader label="ID" columnKey="id" />
                  <SortableHeader label="ชื่อ" columnKey="name" />
                  <SortableHeader label="หมวดหมู่" columnKey="category" />
                  <SortableHeader label="วันที่นำเข้า" columnKey="received_date" />
                  <SortableHeader label="วันหมดอายุ" columnKey="expiry_date" />
                  <SortableHeader label="จำนวน" columnKey="quantity" />
                  <SortableHeader label="หน่วยนับ" columnKey="unit" />
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                ) : error ? (
                  <tr><td colSpan="7" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                ) : sortedAndPaginatedIngredients.length > 0 ? (
                  sortedAndPaginatedIngredients.map((item) => (
                    <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{item.id}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">{formatDate(item.received_date)}</td>
                      <td className="py-3 px-4">{formatDate(item.expiry_date)}</td>
                      <td className="py-3 px-4">{Number(item.quantity).toFixed(2)}</td>
                      <td className="py-3 px-4">{item.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-1">
                          <button 
                            onClick={() => handleEditClick(item)} 
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item)} 
                            className="p-1.5 rounded-md text-[#E15050] hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && !error && filteredIngredients.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { 
              setItemsPerPage(Number(val));
              setCurrentPage(1);
            }}
            totalItems={filteredIngredients.length}
          />
        )}
    </main>
  );
}
