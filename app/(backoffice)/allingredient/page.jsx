// app/(backoffice)/allingredient/page.jsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import EditModal from "@/components/EditModal";
import DeletedModal from "@/components/DeletedModal";
import toast, { Toaster } from "react-hot-toast";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Trash2, PencilLine } from "lucide-react";

// ExpiryStatus component
const ExpiryStatus = ({ date, days }) => {
  if (!date || days === Infinity) return <span className="text-gray-500">N/A</span>;
  const formattedDate = new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  if (days <= 0) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">{formattedDate}</span>
        <span className="inline-block w-fit text-xs text-red-500 bg-red-50 rounded-md px-2">หมดอายุแล้ว</span>
      </div>
    );
  }
  if (days <= 3) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">{formattedDate}</span>
        <span className="inline-block w-fit text-xs text-amber-500 bg-[#FBBF24]/10 rounded-md px-2">เหลือ {days} วัน</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="font-medium">{formattedDate}</span>
      <span className="inline-block w-fit text-xs text-[#3FA170] bg-[#3FA170]/10 rounded-md px-2">เหลือ {days} วัน</span>
    </div>
  );
};

const broadcastChange = (type, payload = {}) => {
  try {
    localStorage.setItem(
      "inv-broadcast",
      JSON.stringify({ type, at: Date.now(), ...payload })
    );
  } catch {}
};

// Main Page
export default function AllIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "descending" });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // state สำหรับโมดัล
  const [editItem, setEditItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  /* ====== โหลดข้อมูล + คำนวณ shelf life จากล็อตล่าสุด ====== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⭐️ เพิ่ม /api/units เพื่อดึง "หน่วยนับทั้งหมด"
        const [inventoryRes, stockinRes, categoriesRes, unitsRes] = await Promise.all([
          fetch("/api/inventory", { cache: "no-store" }),
          fetch("/api/stockin", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/units", { cache: "no-store" }),
        ]);

        if (!inventoryRes.ok) throw new Error("ไม่สามารถดึงข้อมูลสต็อกปัจจุบันได้");
        if (!stockinRes.ok) throw new Error("ไม่สามารถดึงข้อมูลวันหมดอายุได้");
        if (!categoriesRes.ok) throw new Error("ไม่สามารถดึงข้อมูลหมวดหมู่ได้");
        if (!unitsRes.ok) throw new Error("ไม่สามารถดึงข้อมูลหน่วยนับได้");

        const inventoryData = await inventoryRes.json();
        const stockinBatches = await stockinRes.json();
        const dbCategories = await categoriesRes.json();
        const dbUnits = await unitsRes.json();

        const allStockins = stockinBatches.flatMap((b) => b.stockins);

        // 1) หา "ล็อตล่าสุด" ต่อวัตถุดิบ
        const latestBatchByIng = allStockins.reduce((acc, s) => {
          if (!s.ingredient?.ingredient_id) return acc;
          const id = s.ingredient.ingredient_id;
          const received = new Date(s.received_date);
          const current = acc[id];
          if (!current || received > current.received) {
            acc[id] = { received, expiry: new Date(s.expiry_date) };
          }
          return acc;
        }, {});

        // 2) shelflife (วัน) จากล็อตล่าสุด
        const shelfLifeMap = Object.fromEntries(
          Object.entries(latestBatchByIng).map(([id, { received, expiry }]) => {
            const diff = Math.floor((expiry - received) / (1000 * 60 * 60 * 24));
            return [id, diff];
          })
        );

        // 3) วันหมดอายุล่าสุด
        // 3) วันหมดอายุตามล็อต (batch)
const expiryByBatchMap = allStockins.reduce((map, s) => {
  const batchId = s.batch_id;
  if (!batchId) return map;
  map[batchId] = new Date(s.expiry_date);
  return map;
}, {});
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 4) จัดรูปข้อมูล
        const formatted = inventoryData
  .map((row) => {
    if (!row.ingredient?.category || !row.unit) return null;

    const ingredientId = row.ingredient.ingredient_id;
    const inventoryId = row.inventory_id ?? null;
    const batchId = row.batch_id ?? null;

    const expiryDate = batchId ? expiryByBatchMap[batchId] : null;

    let daysLeft = Infinity;
    if (expiryDate) {
      const diffTime = expiryDate - today;
      daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      id: inventoryId ?? ingredientId,
      ingredient_id: ingredientId,
      inventory_id: inventoryId,
      batch_id: batchId,
      name: row.ingredient.name,
      expiryDate: expiryDate || null,
      daysLeft,
      category_id: row.ingredient.category.category_name,
      quantity: row.quantity,
      unit_type: row.unit.unit_name,
      shelflife_day: row.ingredient.shelflife_day ?? shelfLifeMap[ingredientId] ?? "",
    };
  })
  .filter(Boolean);

        setIngredients(formatted);

        // หมวดหมู่ (เพิ่ม "ทั้งหมด")
        const cats = [{ name: "ทั้งหมด" }, ...dbCategories.map((c) => ({ name: c.category_name }))];
        setCategoryOptions(cats);

        // ⭐️ หน่วยนับทั้งหมดจาก DB (ถ้าไม่มีจริง ๆ ค่อย fallback)
        const allUnitNames = (Array.isArray(dbUnits) ? dbUnits : []).map((u) => u.unit_name).filter(Boolean);
        if (allUnitNames.length) {
          setUnitOptions(allUnitNames);
        } else {
          const uniqUnits = [...new Set(formatted.map((x) => x.unit_type))].filter(Boolean);
          setUnitOptions(uniqUnits.length ? uniqUnits : ["หน่วย"]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Fetch Data Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ====== ฟิลเตอร์/เรียง/แบ่งหน้า ====== */
  const filteredIngredients = useMemo(() => {
    return ingredients
      .filter((it) => category === "ทั้งหมด" || it.category_id === category)
      .filter((it) => it.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ingredients, category, searchTerm]);

  const sortedAndPaginatedIngredients = useMemo(() => {
    let out = [...filteredIngredients];
    if (sortConfig.key) {
      out.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    const start = (currentPage - 1) * itemsPerPage;
    return out.slice(start, start + itemsPerPage);
  }, [filteredIngredients, sortConfig, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
    setSortConfig({ key, direction });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const SortIndicator = ({ direction, isActive }) => {
    if (!isActive) {
      return <ChevronsUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100" />;
    }
    if (direction === "ascending") return <ChevronUp size={16} className="text-gray-800" />;
    return <ChevronDown size={16} className="text-gray-800" />;
  };

  const SortableHeader = ({ label, columnKey, className }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <th scope="col" className={`py-3 px-4 font-medium select-none ${className || ""}`}>
        <button onClick={() => requestSort(columnKey)} className="group flex w-full items-center gap-2 text-left">
          <span>{label}</span>
          <SortIndicator direction={sortConfig.direction} isActive={isActive} />
        </button>
      </th>
    );
  };

  /* ====== Modal handlers ====== */
  const openEdit = (row) => setEditItem(row);

  const saveEdit = async (updated) => {
    const loading = toast.loading("กำลังบันทึก...");
    try {
      const res = await fetch(`/api/ingredients/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          name: updated.name,
          category_name: updated.category_id, // ส่งเป็นชื่อหมวดหมู่
          unit_name: updated.unit_type,       // ส่งเป็นชื่อหน่วย
          cascadeUnit: true,                  // ให้ไปอัปเดตหน่วยในทุกที่
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "อัปเดตไม่สำเร็จ");
      }

      const { ingredient } = await res.json(); // { id, name, category, unit }

      setIngredients((prev) =>
        prev.map((x) =>
          x.id === ingredient.id
            ? {
                ...x,
                name: ingredient.name ?? updated.name,
                category_id: ingredient.category ?? updated.category_id,
                unit_type: ingredient.unit ?? updated.unit_type,
              }
            : x
        )
      );

      broadcastChange("ingredient-updated", { ingredient_id: ingredient.id });

      toast.success("บันทึกสำเร็จ!", { id: loading });
      setEditItem(null);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loading });
    }
  };

  const openDelete = (row) => {
    setItemToDelete({ ...row, count: 0 });
  };

  /* ====== ลบ (อาศัย backend ตรวจว่ามีประวัติการเบิกหรือไม่) ====== */
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const loadingToast = toast.loading("กำลังลบข้อมูล...");
    try {
      const res = await fetch(`/api/ingredients/${itemToDelete.id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(data?.error || "ลบไม่ได้: วัตถุดิบมีประวัติการเบิกแล้ว");
        }
        throw new Error(data?.error || "ลบไม่สำเร็จ");
      }

      setIngredients((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      broadcastChange("ingredient-deleted", { ingredient_id: itemToDelete.id });

      toast.success("ลบข้อมูลสำเร็จ!", { id: loadingToast });
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { id: loadingToast });
    } finally {
      setItemToDelete(null);
    }
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
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSave={saveEdit}
        ingredient={editItem}
        categories={categoryOptions.filter((c) => c.name !== "ทั้งหมด").map((c) => c.name)}
        units={unitOptions}
        formType="all-ingredients"
      />

        <div className="mb-8">
          <h1 className="text-black text-3xl font-bold">วัตถุดิบคงเหลือทั้งหมด</h1>
          <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับวัตถุดิบทั้งหมดที่คงเหลือในสต็อก</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <CustomDropdown
            label="หมวดหมู่"
            categories={categoryOptions}
            selectedCategory={category}
            onSelectCategory={(val) => { setCategory(val); setCurrentPage(1); }}
          />
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหาจากชื่อวัตถุดิบ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                    <SortableHeader label="วันหมดอายุ" columnKey="daysLeft" />
                    <SortableHeader label="จำนวนคงเหลือ" columnKey="quantity" />
                    <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                    <th scope="col" className="px-4 py-3" />
                  </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500"><span className="loading loading-spinner loading-xl"></span></td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {error}</td>
                  </tr>
                ) : sortedAndPaginatedIngredients.length > 0 ? (
                  sortedAndPaginatedIngredients.map((ing) => (
                    <tr key={ing.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">{ing.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{ing.name}</td>
                      <td className="py-3 px-4">{ing.category_id}</td>
                      <td className="py-2 px-4"><ExpiryStatus date={ing.expiryDate} days={ing.daysLeft} /></td>
                      <td className="py-3 px-4">{Number(ing.quantity).toFixed(2)}</td>
                      <td className="py-3 px-4">{ing.unit_type}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => openEdit(ing)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <PencilLine size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(ing)}
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

        {(() => {
          const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
          return totalPages > 0 && !isLoading && !error ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
              totalItems={filteredIngredients.length}
            />
          ) : null;
        })()}
    </main>
  );
}