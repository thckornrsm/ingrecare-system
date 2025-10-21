// app/(backoffice)/settings/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../session-provider';
import AddCategoryModal from '@/components/AddCategoryModal';
import AddUnitModal from '@/components/AddUnitModal';
import DeletedModal from '@/components/DeletedModal';
import { X, PencilLine, Trash2, Plus } from 'lucide-react';
import { safeFetchJSON } from '@/utils/safeFetchJSON';
import toast, { Toaster } from 'react-hot-toast';

/* ========== Reusable display field ========== */
const DataDisplayField = ({ label, value, span, type }) => (
  <div className={span}>
    <p className="mb-1 text-xs tracking-wider text-gray-500">{label}</p>
    <div className="flex items-center">
      <p
        className={`break-words font-medium text-gray-800 ${
          type === 'h1' ? 'text-2xl text-[#3FA170]' : 'text-base'
        }`}
      >
        {value ?? '-'}
      </p>
    </div>
  </div>
);

/* ========== Tab: บัญชีร้านค้า ========== */
const AboutStore = () => {
  const me = useSession();

  if (!me) return <p className="text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</p>;
  if (!me.store) return <p className="text-red-600">ไม่พบข้อมูลร้านที่ผูกกับบัญชีผู้ใช้</p>;

  const store = me.store;

  const storeInfo = [
    { label: 'ชื่อร้านค้า', value: store.name, span: 'md:col-span-2', type: 'h1' },
    { label: 'ที่อยู่', value: store.address || '-', span: 'md:col-span-2' },
    { label: 'จังหวัด', value: store.province_name_th || '-' },
    { label: 'อำเภอ', value: store.district_name_th || '-' },
    { label: 'ตำบล', value: store.subdistrict_name_th || '-' },
    { label: 'รหัสไปรษณีย์', value: store.zipcode || '-' },
  ];

  const contactInfo = [
    { label: 'บทบาท', value: (me.role || '').toString() },
    { label: 'อีเมล', value: me.email || '-' },
  ];

  return (
    <div className="mx-auto">
      <section className="mb-10">
        <h2 className="mb-6 border-l-4 border-[#3FA170] pl-3 text-xl font-semibold text-gray-800">
          รายละเอียดร้านค้า
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            {storeInfo.map((item, i) => (
              <DataDisplayField key={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 border-l-4 border-[#3FA170] pl-3 text-xl font-semibold text-gray-800">
          ข้อมูลติดต่อบัญชี
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            {contactInfo.map((item, i) => (
              <DataDisplayField key={i} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ========== Modal: แก้ชื่อรายการ (หมวด/หน่วย) ========== */
function EditCategoryModal({ isOpen, onClose, onSave, category, label = 'ชื่อใหม่' }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setError(false);
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleSave = async () => {
    if (!name.trim()) return setError(true);
    setSubmitting(true);
    try {
      await onSave({ id: category.id, name: name.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <h3 className="text-lg font-semibold text-gray-800">แก้ไข</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className={`w-full rounded-md border px-4 py-2 outline-none transition focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3FA170]'
            }`}
          />
          {error && <p className="text-sm text-red-500">กรุณากรอกชื่อ</p>}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            disabled={submitting}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-[#3FA170] px-6 py-2 text-sm font-medium text-white hover:bg-[#2F7A5E]"
            disabled={submitting}
          >
            {submitting ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== ตารางรายการ (หมวด/หน่วย) ========== */
const CategorySection = ({ title, items, onAddClick, onEditClick, onDeleteClick }) => (
  <div>
    <div className="mb-6 flex flex-wrap items-center justify-between">
      <h3 className="border-l-4 border-[#3FA170] pl-3 text-xl font-semibold text-gray-800">{title}</h3>
      <button
        onClick={onAddClick}
        className="flex items-center space-x-2 text-[#3FA170] transition-colors hover:text-[#2F7A5E]"
      >
        <Plus size={20} />
        <span>เพิ่ม</span>
      </button>
    </div>

    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="border-b border-gray-200 bg-gray-100 text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3 font-normal">ชื่อ</th>
              <th className="w-[8rem] px-4 py-3 text-center font-normal">จำนวนวัตถุดิบ</th>
              <th className="w-[6rem] px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={`${item.id}-${item.name}`}
                  className="border-b border-gray-200 bg-white last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-center">{item.count ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEditClick(item)}
                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(item)}
                        className="rounded-md p-1.5 text-[#E15050] transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ========== Tab: จัดการหมวดหมู่/หน่วยนับ (นับจำนวนวัตถุดิบให้ด้วย) ========== */
const ManageCategories = () => {
  const [materialCategories, setMaterialCategories] = useState([]);
  const [unitCategories, setUnitCategories] = useState([]);

  // แยกโมดัล “เพิ่มหมวดหมู่” และ “เพิ่มหน่วยนับ”
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  // แก้ไข/ลบ
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalContext, setModalContext] = useState(''); // 'material' | 'unit'
  const [error, setError] = useState('');

  // รวม count ที่ client เป็น fallback ถ้า API ไม่ส่งมา
  const buildCountsFromIngredients = (ingredients) => {
    const byCat = new Map();
    const byUnit = new Map();
    for (const ing of ingredients || []) {
      if (ing.category_id != null) {
        byCat.set(ing.category_id, (byCat.get(ing.category_id) || 0) + 1);
      }
      if (ing.unit_id != null) {
        byUnit.set(ing.unit_id, (byUnit.get(ing.unit_id) || 0) + 1);
      }
    }
    return { byCat, byUnit };
  };

  const refreshAll = async () => {
    try {
      setError('');

      const [cats, units] = await Promise.all([
        safeFetchJSON('/api/categories?withCount=1'),
        safeFetchJSON('/api/units?withCount=1'),
      ]);

      const catHasCount = Array.isArray(cats) && cats.some((c) => c._count?.ingredients != null || c.count != null);
      const unitHasCount = Array.isArray(units) && units.some((u) => u._count?.ingredients != null || u.count != null);

      let counts = { byCat: new Map(), byUnit: new Map() };
      if (!catHasCount || !unitHasCount) {
        try {
          const ings = await safeFetchJSON('/api/ingredients');
          counts = buildCountsFromIngredients(ings);
        } catch {
          // ignore
        }
      }

      setMaterialCategories(
        (cats || []).map((c) => ({
          id: c.category_id,
          name: c.category_name,
          count: c._count?.ingredients ?? c.count ?? counts.byCat.get(c.category_id) ?? 0,
        })),
      );

      setUnitCategories(
        (units || []).map((u) => ({
          id: u.unit_id,
          name: u.unit_name,
          count: u._count?.ingredients ?? u.count ?? counts.byUnit.get(u.unit_id) ?? 0,
        })),
      );
    } catch (e) {
      console.error('REFRESH_ERROR', e);
      setError(e.message || 'โหลดข้อมูลหมวดหมู่/หน่วยนับไม่สำเร็จ');
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // เปิดโมดัลตามส่วน
  const handleOpenAddCategory = () => setIsAddCategoryOpen(true);
  const handleOpenAddUnit = () => setIsAddUnitOpen(true);

  // แก้ไข/ลบ
  const handleOpenEdit = (item, type) => {
    setModalContext(type);
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };
  const handleOpenDelete = (item, type) => {
    setModalContext(type);
    setSelectedItem(item);
    setIsDeletedModalOpen(true);
  };

  // สร้างใหม่
  const handleCreateCategory = async ({ name }) => {
    try {
      await safeFetchJSON('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: name }),
      });
      setIsAddCategoryOpen(false);
      await refreshAll();
      toast.success('เพิ่มหมวดหมู่สำเร็จ');
    } catch (e) {
      toast.error(e.message || 'เพิ่มหมวดหมู่ไม่สำเร็จ');
    }
  };
  const handleCreateUnit = async ({ name }) => {
    try {
      await safeFetchJSON('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_name: name }),
      });
      setIsAddUnitOpen(false);
      await refreshAll();
      toast.success('เพิ่มหน่วยนับสำเร็จ');
    } catch (e) {
      toast.error(e.message || 'เพิ่มหน่วยนับไม่สำเร็จ');
    }
  };

  // อัปเดต (PUT ใช้ { name } ตาม API ที่คุณให้มา) — มี toast เฉพาะตอนจบ
  const handleConfirmEdit = async ({ id, name }) => {
    const url = modalContext === 'material' ? `/api/categories/${id}` : `/api/units/${id}`;
    try {
      await safeFetchJSON(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setIsEditModalOpen(false);
      await refreshAll();
      toast.success('บันทึกการแก้ไขสำเร็จ');
    } catch (e) {
      toast.error(e.message || 'บันทึกการแก้ไขไม่สำเร็จ');
    }
  };

  // ลบ — มี toast เฉพาะตอนจบ
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    const url =
      modalContext === 'material'
        ? `/api/categories/${selectedItem.id}`
        : `/api/units/${selectedItem.id}`;
    try {
      await safeFetchJSON(url, { method: 'DELETE' });
      setIsDeletedModalOpen(false);
      await refreshAll();
      toast.success('ลบข้อมูลสำเร็จ');
    } catch (e) {
      toast.error(e.message || 'ลบข้อมูลไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-10">
      {/* Toaster แสดงเฉพาะตอนอยู่แท็บนี้ */}
      <Toaster position="top-right" />

      {error && <p className="text-red-600">{error}</p>}

      <CategorySection
        title="หมวดหมู่วัตถุดิบ"
        items={materialCategories}
        onAddClick={handleOpenAddCategory}
        onEditClick={(item) => handleOpenEdit(item, 'material')}
        onDeleteClick={(item) => handleOpenDelete(item, 'material')}
      />

      <CategorySection
        title="หมวดหมู่หน่วยนับ"
        items={unitCategories}
        onAddClick={handleOpenAddUnit}
        onEditClick={(item) => handleOpenEdit(item, 'unit')}
        onDeleteClick={(item) => handleOpenDelete(item, 'unit')}
      />

      {/* โมดัลเพิ่ม “หมวดหมู่” */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleCreateCategory}
        existingCategories={materialCategories.map((c) => ({ name: c.name }))}
      />

      {/* โมดัลเพิ่ม “หน่วยนับ” */}
      <AddUnitModal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        onAddUnit={handleCreateUnit}
        existingUnits={unitCategories.map((u) => ({ name: u.name }))}
      />

      {/* แก้ไข */}
      {selectedItem && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleConfirmEdit}
          category={selectedItem}
          label={modalContext === 'material' ? 'ชื่อหมวดหมู่ใหม่' : 'ชื่อหน่วยนับใหม่'}
        />
      )}

      {/* ลบ */}
      {selectedItem && (
        <DeletedModal
          isOpen={isDeletedModalOpen}
          onClose={() => setIsDeletedModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemToDelete={selectedItem}
        />
      )}
    </div>
  );
};

/* ========== Settings Page ========== */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('about');
  const tabs = [
    { id: 'about', label: 'บัญชีร้านค้า' },
    { id: 'categories', label: 'จัดการหมวดหมู่' },
  ];

  return (
    <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">การตั้งค่า</h1>
        <p className="text-[#979999]">จัดการข้อมูลบัญชีร้านค้าและหมวดหมู่ได้ที่นี่</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'border-[#3FA170] text-[#3FA170]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'about' && <AboutStore />}
        {activeTab === 'categories' && <ManageCategories />}
      </div>
    </main>
  );
}
