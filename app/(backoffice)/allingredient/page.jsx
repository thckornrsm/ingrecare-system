"use client";
import React, { useState, useMemo, useEffect } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import Pagination from "@/components/Pagination";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { Search, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

/* โมดัลที่ใช้ร่วมกัน */
import EditModal from "@/components/EditModal";
import DeletedModal from "@/components/DeletedModal";

/* ============= Helpers ============= */
const ExpiryStatus = ({ date, days }) => {
  if (!date || days === Infinity) return <span className="text-gray-500">N/A</span>;
  const formattedDate = new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  if (days < 1) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-red-600">{formattedDate}</span>
        <span className="text-xs text-red-500">หมดอายุแล้ว</span>
      </div>
    );
  }
  if (days <= 7) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-amber-600">{formattedDate}</span>
        <span className="text-xs text-amber-500">เหลือ {days} วัน</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-700">{formattedDate}</span>
      <span className="text-xs text-gray-500">เหลือ {days} วัน</span>
    </div>
  );
};

// แจ้งหน้าอื่นๆ (เช่น stockin/stockout) ให้รีเฟรชเมื่อ ingredient เปลี่ยน
const broadcastChange = (type, payload = {}) => {
  try {
    localStorage.setItem(
      "inv-broadcast",
      JSON.stringify({ type, at: Date.now(), ...payload })
    );
  } catch {}
};

export default function AllIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "descending",
  });
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // state สำหรับโมดัล
  const [editItem, setEditItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  /* ====== โหลดข้อมูล + คำนวณ shelf life จากล็อตล่าสุด ====== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⭐️ เพิ่ม /api/units เพื่อดึง “หน่วยนับทั้งหมด”
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

        // 1) หา “ล็อตล่าสุด” ต่อวัตถุดิบ
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
            const diff = Math.ceil((expiry - received) / (1000 * 60 * 60 * 24));
            return [id, diff];
          })
        );

        // 3) วันหมดอายุล่าสุด
        const latestExpiryMap = allStockins.reduce((map, s) => {
          if (!s.ingredient?.ingredient_id) return map;
          const id = s.ingredient.ingredient_id;
          const expiry = new Date(s.expiry_date);
          if (!map[id] || expiry > map[id]) map[id] = expiry;
          return map;
        }, {});
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 4) จัดรูปข้อมูล
        const formatted = inventoryData
          .map((row) => {
            if (!row.ingredient?.category || !row.unit) return null;
            const id = row.ingredient.ingredient_id;
            const latestEx = latestExpiryMap[id];
            let daysLeft = Infinity;
            if (latestEx) {
              const diffTime = latestEx - today;
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            return {
              id,
              name: row.ingredient.name,
              expiryDate: latestEx || null,
              daysLeft,
              category_id: row.ingredient.category.category_name,
              quantity: row.quantity,
              unit_type: row.unit.unit_name,
              shelflife_day: row.ingredient.shelflife_day ?? shelfLifeMap[id] ?? "",
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
    <main className="flex-1 overflow-y-auto py-9 px-6 sm:px-8 lg:px-10">
      <Toaster position="top-right" />

      {/* ลบ */}
      <DeletedModal
        isOpen={!!itemToDelete}
        onConfirm={handleConfirmDelete}
        itemToDelete={itemToDelete}
        onClose={() => setItemToDelete(null)}
      />

      {/* แก้ไข: ตอนนี้ units คือ “ทุกหน่วยทั้งหมด” จาก /api/units */}
      <EditModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSave={saveEdit}
        ingredient={editItem}
        categories={categoryOptions.filter((c) => c.name !== "ทั้งหมด").map((c) => c.name)}
        units={unitOptions}
        formType="all-ingredients"
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">วัตถุดิบทั้งหมดในสต็อก</h1>
          <p className="text-gray-500">ตารางข้อมูลเกี่ยวกับวัตถุดิบทั้งหมดในสต็อก</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <CustomDropdown
            label="หมวดหมู่"
            categories={categoryOptions}
            selectedCategory={category}
            onSelectCategory={(val) => {
              setCategory(val);
              setCurrentPage(1);
            }}
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
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="border-b border-gray-200 bg-gray-50 text-sm text-gray-500 uppercase">
                <tr>
                  <SortableHeader label="ID" columnKey="id" />
                  <SortableHeader label="ชื่อวัตถุดิบ" columnKey="name" />
                  <SortableHeader label="วันหมดอายุล่าสุด" columnKey="daysLeft" />
                  <SortableHeader label="หมวดหมู่" columnKey="category_id" />
                  <SortableHeader label="จำนวนคงเหลือ" columnKey="quantity" />
                  <SortableHeader label="หน่วยนับ" columnKey="unit_type" />
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {error}</td>
                  </tr>
                ) : sortedAndPaginatedIngredients.length > 0 ? (
                  sortedAndPaginatedIngredients.map((ing) => (
                    <tr key={ing.id} className="border-b border-gray-200 bg-white last:border-b-0 transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{ing.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{ing.name}</td>
                      <td className="px-4 py-2">
                        <ExpiryStatus date={ing.expiryDate} days={ing.daysLeft} />
                      </td>
                      <td className="px-4 py-3">{ing.category_id}</td>
                      <td className="px-4 py-3">{Number(ing.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3">{ing.unit_type}</td>
                      <td className="py-3">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => setEditItem(ing)}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
                            title="แก้ไข"
                          >
                            <Icon icon="mynaui:edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete(ing)}
                            className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-100"
                            title="ลบ"
                          >
                            <Icon icon="fluent:delete-20-regular" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">ไม่พบข้อมูลวัตถุดิบในสต็อก</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
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
      </div>
    </main>
  );
}
