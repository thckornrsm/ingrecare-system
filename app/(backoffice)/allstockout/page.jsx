"use client";

import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import EditModal from "@/components/EditModal";
import DeletedModal from "@/components/DeletedModal";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Trash2, PencilLine } from "lucide-react";

/* ========= helpers ========= */
const pad2 = (n) => String(n).padStart(2, "0");
const toInputDate = (d) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toInputTime = (d) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const isNumericLike = (v) => /^-?\d+(\.\d+)?$/.test(String(v ?? ""));

// ✅ util เล็กๆ สำหรับ broadcast ไปหน้าอื่น
const broadcastInventoryChange = (type, ingredient_id, inventory_total) => {
  try {
    localStorage.setItem(
      "inv-broadcast",
      JSON.stringify({
        type,
        ingredient_id,
        inventory_total,
        at: Date.now(),
      })
    );
  } catch {}
};

/* ========= หน้าประวัติการเบิกจ่าย ========= */
export default function AllStockout() {
  // Data states
  const [stockoutHistory, setStockoutHistory] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]); // [{id, name}]
  const [unitOptions, setUnitOptions] = useState([]); // [{id, name}]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [category, setCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "descending" });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit/Delete modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  /* ---------------- Fetch data ---------------- */
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stockoutRes, categoriesRes, unitsRes] = await Promise.all([
        fetch("/api/stockout", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/units", { cache: "no-store" }).catch(() => null),
      ]);

      if (!stockoutRes.ok) throw new Error("ไม่สามารถดึงข้อมูลการเบิกจ่ายได้");
      if (!categoriesRes.ok) throw new Error("ไม่สามารถดึงข้อมูลหมวดหมู่ได้");

      const stockoutData = await stockoutRes.json();

      // รองรับ out_date (ตาม schema) และ fallback อื่นๆ
      const formattedHistory = stockoutData.map((item) => {
        const raw = item.out_date || item.out_datetime || item.out_at;
        const rawDate = raw ? new Date(raw) : null;

        return {
          id: item.stockout_id,
          ingredient_id: item.ingredient_id,
          name: item.ingredient?.name ?? item.name ?? "",
          category_id: item.ingredient?.category?.category_name ?? item.category_name ?? "-",
          unit_type: item.unit?.unit_name ?? item.unit_name ?? "",
          quantity: Number(item.quantity ?? 0),
          out_datetime_display: rawDate
            ? `${rawDate.toLocaleDateString("th-TH", { dateStyle: "short" })} ${rawDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`
            : "-",
          _out_datetime_raw: rawDate || new Date(0),
        };
      });
      setStockoutHistory(formattedHistory);

      const dbCategories = await categoriesRes.json();
      setCategoryOptions([
        { id: null, name: "ทั้งหมด" },
        ...dbCategories.map((c) => ({ id: c.category_id, name: c.category_name })),
      ]);

      if (unitsRes && unitsRes.ok) {
        const dbUnits = await unitsRes.json();
        setUnitOptions(dbUnits.map((u) => ({ id: u.unit_id, name: u.unit_name })));
      } else {
        setUnitOptions([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- Filters / Sort / Paging ---------------- */
  const filteredItems = stockoutHistory
    .filter((item) => category === "ทั้งหมด" || item.category_id === category)
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedAndPaginatedItems = useMemo(() => {
    let sortedData = [...filteredItems];
    const key = sortConfig.key;
    if (key) {
      sortedData.sort((a, b) => {
        if (a[key] < b[key]) return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[key] > b[key]) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, sortConfig, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  /* ---------------- Edit / Delete handlers ---------------- */
  const openEdit = (row) => {
    const d = toInputDate(row._out_datetime_raw);
    const t = toInputTime(row._out_datetime_raw);

    // out_datetime string เพื่อ prefill ให้ EditModal (แม้ API ใช้ out_date ตอน save)
    const out_datetime = d && t ? `${d}T${t}` : undefined;

    setEditingItem({
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      unit_type: row.unit_type,
      quantity: row.quantity,
      out_date: d,
      out_time: t,
      out_datetime,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    const loadingToast = toast.loading("กำลังบันทึก...");
    try {
      const res = await fetch(`/api/stockout/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: Number(updated.quantity),
          // ยังส่ง out_datetime ได้ (API จะ map เป็น out_date)
          out_datetime: updated.out_date
            ? `${updated.out_date}T${updated.out_time || "00:00"}`
            : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "อัปเดตไม่สำเร็จ");
      }

      // API คืน { updatedItem, ingredient_id, inventory_total }
      const payload = await res.json();
      const updatedItem = payload.updatedItem;

      const rawDateSrc = updatedItem.out_date || updatedItem.out_datetime || updatedItem.out_at;
      const rawDate = rawDateSrc ? new Date(rawDateSrc) : null;

      const formattedUpdatedItem = {
        id: updatedItem.stockout_id,
        ingredient_id: updatedItem.ingredient_id,
        name: updatedItem.ingredient?.name ?? "",
        category_id: updatedItem.ingredient?.category?.category_name ?? "-",
        unit_type: updatedItem.unit?.unit_name ?? "",
        quantity: Number(updatedItem.quantity ?? 0),
        out_datetime_display: rawDate
          ? `${rawDate.toLocaleDateString("th-TH", { dateStyle: "short" })} ${rawDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`
          : "-",
        _out_datetime_raw: rawDate || new Date(0),
      };

      setStockoutHistory((prev) =>
        prev.map((item) => (item.id === formattedUpdatedItem.id ? formattedUpdatedItem : item))
      );

      broadcastInventoryChange("stockout-updated", payload.ingredient_id, payload.inventory_total);

      toast.success("บันทึกสำเร็จ!", { id: loadingToast });
      setIsEditOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
    }
  };

  const openDelete = (row) => {
    setDeletingItem({ ...row, count: 0 });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const loadingToast = toast.loading("กำลังลบ...");
    try {
      const res = await fetch(`/api/stockout/${deletingItem.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "ลบไม่สำเร็จ");
      }

      const payload = await res.json();

      setStockoutHistory((prev) => prev.filter((item) => item.id !== deletingItem.id));
      broadcastInventoryChange("stockout-deleted", payload.ingredient_id, payload.inventory_total);

      toast.success("ลบรายการสำเร็จ!", { id: loadingToast });
      setIsDeleteOpen(false);
      setDeletingItem(null);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
    }
  };

  const SortIndicator = ({ direction, isActive }) => {
    if (!isActive)
      return (
        <ChevronsUpDown
          size={14}
          className="text-gray-400 opacity-50 group-hover:opacity-100"
        />
      );
    if (direction === "ascending") return <ChevronUp size={16} className="text-gray-800" />;
    return <ChevronDown size={16} className="text-gray-800" />;
  };

  const SortableHeader = ({ label, columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <th scope="col" className="py-3 px-4 font-medium select-none">
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
    <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
      <Toaster position="top-right" />
      <DeletedModal
        isOpen={isDeleteOpen}
        onConfirm={handleConfirmDelete}
        itemToDelete={deletingItem}
        onClose={() => { setIsDeleteOpen(false); setDeletingItem(null); }}
      />
      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        ingredient={editingItem}
        categories={categoryOptions.filter((c) => c.name !== "ทั้งหมด").map((c) => c.name)}
        units={unitOptions.map((u) => u.name)}
        formType="stock-out"
      />

        <div className="mb-8">
          <h1 className="text-black text-3xl font-bold">ประวัติการเบิกจ่าย</h1>
          <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับการเบิกจ่ายวัตถุดิบทั้งหมดในระบบ</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <CustomDropdown
            label="หมวดหมู่"
            categories={categoryOptions.map((c) => ({ name: c.name }))}
            selectedCategory={category}
            onSelectCategory={(selected) => { setCategory(selected); setCurrentPage(1); }}
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
                  <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                  <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                  <SortableHeader label="วันและเวลาที่เบิกจ่าย" columnKey="_out_datetime_raw" />
                  <SortableHeader label="จำนวน" columnKey="quantity" />
                  <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="text-center p-8 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                ) : error ? (
                  <tr><td colSpan="7" className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</td></tr>
                ) : sortedAndPaginatedItems.length > 0 ? (
                  sortedAndPaginatedItems.map((item) => (
                    <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{item.id}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.category_id}</td>
                      <td className="py-3 px-4">{item.out_datetime_display}</td>
                      <td className="py-3 px-4">{Number(item.quantity).toFixed(2)}</td>
                      <td className="py-3 px-4">{item.unit_type}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(item)}
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
                    <td colSpan="7" className="text-center p-8 text-gray-500">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && !error && filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(Number(val));
              setCurrentPage(1);
            }}
            totalItems={filteredItems.length}
          />
        )}
    </main>
  );
}
