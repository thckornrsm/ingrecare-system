'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AddCategoryModal from '@/components/AddCategoryModal';
import DeletedModal from '@/components/DeletedModal';
import { X, PencilLine, Trash2, Plus, EyeOff, Eye } from 'lucide-react';

const DataDisplayField = ({ label, value, span, type, isPassword, showPassword, setShowPassword }) => (
    <div className={span}>
        {/* Label: smaller, uppercase, gray */}
        <p className="text-xs text-gray-500 tracking-wider mb-1">{label}</p>
        
        {/* Value container: handles password toggle */}
        <div className={`flex items-center ${isPassword ? 'justify-between' : ''}`}>
            <p 
                className={`font-medium text-gray-800 break-words ${
                    type === 'h1' ? "text-2xl text-[#3FA170]" : 'text-base'
                }`}
            >
                {/* Logic for password visibility */}
                {isPassword 
                    ? (showPassword ? value : '•••••••••') 
                    : value
                }
            </p>
            {/* Password Toggle Button */}
            {isPassword && (
                <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    </div>
);
// บัญชีร้านค้า
const AboutStore = () => {
    const [showPassword, setShowPassword] = useState(false);
    
    // ข้อมูลร้านค้า
    const storeInfo = [
        { label: 'ชื่อร้านค้า', value: 'สุกี้ตี๋ใหญ่', span: 'md:col-span-2', type: 'h1' },
        { label: 'ที่อยู่', value: '42 ถนนมาลัยแมน', span: 'md:col-span-2' },
        { label: 'จังหวัด', value: 'นครปฐม' },
        { label: 'อำเภอ', value: 'กำแพงแสน' },
        { label: 'ตำบล', value: 'กำแพงแสน' },
        { label: 'รหัสไปรษณีย์', value: '73140' },
    ];

    // ข้อมูลติดต่อ
    const contactInfo = [
        { label: 'บทบาท', value: 'ผู้ดูแลระบบ' },
        { label: 'อีเมล', value: 'example@example.com' },
        { 
            label: 'รหัสผ่าน', 
            value: '1111111', 
            isPassword: true
        },
    ];

    return (
        <div className="mx-auto">
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-l-4 border-[#3FA170] pl-3">รายละเอียดร้านค้า</h2>
                
                {/* Content Card */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                        {storeInfo.map((item, index) => (
                            <DataDisplayField key={index} {...item} />
                        ))}
                    </div>
                </div>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-l-4 border-[#3FA170] pl-3">ข้อมูลติดต่อบัญชี</h2>
                
                {/* Content Card */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                        {contactInfo.map((item, index) => (
                            <DataDisplayField 
                                key={index} 
                                {...item}
                                isPassword={item.isPassword} 
                                showPassword={showPassword} 
                                setShowPassword={setShowPassword}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

function EditCategoryModal({ isOpen, onClose, onSave, category }) {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState(false); 

    useEffect(() => {
        if (category) {
            setCategoryName(category.name || '');
            setError(false); 
        }
    }, [category, isOpen]);

    if (!isOpen || !category) {
        return null;
    }

    const handleChange = (e) => {
        const value = e.target.value;
        setCategoryName(value);
        if (value.trim()) {
            setError(false);
        }
    };

    const handleSave = () => {
        if (categoryName.trim()) {
            setError(false);
            const updatedCategory = {
                id: category.id,
                name: categoryName.trim(),
            };
            onSave(updatedCategory); 
        } else {
            setError(true); 
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSave();
        }
    };

    const InputField = ({ label, isError, errorMessage, ...props }) => (
        <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
            <input
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition 
                    ${isError 
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#3FA170]'
                    }`
                }
                {...props}
            />
            {isError && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E5E5]">
                    <h3 className="text-lg font-semibold text-gray-800">แก้ไขหมวดหมู่</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                    <InputField
                        label="ชื่อหมวดหมู่ใหม่"
                        name="name"
                        type="text"
                        value={categoryName}
                        onChange={handleChange}
                        autoFocus
                        isError={error}
                        errorMessage="กรุณากรอกชื่อหมวดหมู่"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        ยกเลิก
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#2F7A5E]">
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
}
// จัดการหมวดหมู่
const CategorySection = ({ title, items, onAddClick, onEditClick, onDeleteClick }) => (
    <div>
        <div className="flex flex-wrap justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-[#3FA170] pl-3">{title}</h3>
            <button
                onClick={onAddClick}
                className="flex items-center space-x-2 text-[#3FA170] hover:text-[#2F7A5E] transition-colors"
            >
                <Plus size={20} />
                <span>เพิ่มหมวดหมู่</span>
            </button>
        </div>
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-sm text-gray-500 capitalize bg-gray-100 border-b border-gray-200">
                <tr>
                    <th scope="col" className="py-3 px-4 font-normal">ชื่อประเภท</th>
                    <th scope="col" className="py-3 px-4 font-normal text-center w-[8rem]">จำนวนวัตถุดิบ</th>
                    <th scope="col" className="py-3 px-4 w-[6rem]"></th>
                </tr>
            </thead>
            <tbody>
                {items.length > 0 ? items.map(item => (
                    <tr key={item.id} className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-center">{item.count}</td>
                        <td className="py-3 px-4">
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => onEditClick(item)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors">
                                    <PencilLine size={16} />
                                </button>
                                <button onClick={() => onDeleteClick(item)} className="p-1.5 rounded-md text-[#E15050] hover:bg-red-100 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="3" className="text-center py-8 text-gray-500">
                            ไม่มีหมวดหมู่
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
    </div>
);

const ManageCategories = () => {
    const [materialCategories, setMaterialCategories] = useState([
        { id: 1, name: 'ผัก', count: 10, iconName: 'LeafyGreen' },
        { id: 2, name: 'ผลไม้', count: 0, iconName: 'Apple' }, 
        { id: 3, name: 'เนื้อสัตว์', count: 5, iconName: 'Beef' },
    ]);
    const [unitCategories, setUnitCategories] = useState([
        { id: 4, name: 'กิโลกรัม', count: 15, iconName: 'Utensils' },
        { id: 5, name: 'ขวด', count: 0, iconName: 'Wine' }, 
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [modalContext, setModalContext] = useState('');

    const handleOpenAddModal = (type) => {
        setModalContext(type);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (item, type) => {
        setModalContext(type);
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleOpenDeletedModal = (item, type) => {
        setModalContext(type);
        setSelectedItem(item);
        setIsDeletedModalOpen(true);
    };

    const handleConfirmAdd = ({ name, iconName }) => {
        const newItem = { id: Date.now(), name, iconName, count: 0 };
        if (modalContext === 'material') {
            setMaterialCategories(prev => [...prev, newItem]);
        } else if (modalContext === 'unit') {
            setUnitCategories(prev => [...prev, newItem]);
        }
    };

    const handleConfirmEdit = (updatedCategory) => {
        const updateFunction = (items) => items.map(item =>
            item.id === updatedCategory.id ? { ...item, name: updatedCategory.name } : item
        );
        
        if (modalContext === 'material') {
            setMaterialCategories(updateFunction);
        } else if (modalContext === 'unit') {
            setUnitCategories(updateFunction);
        }
        setIsEditModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedItem && selectedItem.count === 0) {
            const filterFunction = (items) => items.filter(item => item.id !== selectedItem.id);
            if (modalContext === 'material') {
                setMaterialCategories(filterFunction);
            } else if (modalContext === 'unit') {
                setUnitCategories(filterFunction);
            }
        }
        setIsDeletedModalOpen(false);
    };

    return (
        <div className="space-y-10">
            <CategorySection
                title="หมวดหมู่วัตถุดิบ"
                items={materialCategories}
                onAddClick={() => handleOpenAddModal('material')}
                onEditClick={(item) => handleOpenEditModal(item, 'material')}
                onDeleteClick={(item) => handleOpenDeletedModal(item, 'material')}
            />
            <CategorySection
                title="หมวดหมู่หน่วยนับ"
                items={unitCategories}
                onAddClick={() => handleOpenAddModal('unit')}
                onEditClick={(item) => handleOpenEditModal(item, 'unit')}
                onDeleteClick={(item) => handleOpenDeletedModal(item, 'unit')}
            />
            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddCategory={handleConfirmAdd}
                existingCategories={modalContext === 'material' ? materialCategories : unitCategories}
            />
            {selectedItem && (
                <>
                    <EditCategoryModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleConfirmEdit}
                        category={selectedItem}
                    />
                    <DeletedModal
                        isOpen={isDeletedModalOpen}
                        onClose={() => setIsDeletedModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        itemToDelete={selectedItem}
                    />
                </>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('about');
    const tabs = [
        { id: 'about', label: 'บัญชีร้านค้า' },
        { id: 'categories', label: 'จัดการหมวดหมู่' },
    ];

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">การตั้งค่า</h1>
                        <p className="text-[#979999]">จัดการข้อมูลบัญชีร้านค้าและหมวดหมู่ได้ที่นี่</p>
                    </div>
                    <div className="border-b border-gray-300">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-[#3FA170] text-[#3FA170]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8">
                        {activeTab === 'about' && <AboutStore />}
                        {activeTab === 'categories' && <ManageCategories />}
                    </div>
                </main>
            </div>
        </div>
    );
}