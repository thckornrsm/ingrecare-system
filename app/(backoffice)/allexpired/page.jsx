// app/(backoffice)/expired/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Icon } from '@iconify/react';

// Main Expired Ingredients Page
export default function ExpiredPage() {
    const [expiredItems, setExpiredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/stockin');
                if (!res.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลได้');
                }
                const batches = await res.json();
                
                const processedAndExpired = batches.flatMap(batch => 
                    batch.stockins.map(stockin => {
                        const expiryDate = new Date(stockin.expiry_date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return {
                            id: `${batch.batch_id}-${stockin.ingredient.name}`, // Unique key
                            batch_id: batch.batch_id,
                            name: stockin.ingredient.name,
                            expiry_date: expiryDate.toLocaleDateString('th-TH'),
                            daysLeft: diffDays,
                            category: stockin.ingredient.category.category_name,
                            quantity: stockin.quantity,
                            unit: stockin.unit.unit_name,
                        };
                    })
                ).filter(item => item.daysLeft <= 0); // กรองเฉพาะรายการที่หมดอายุ

                setExpiredItems(processedAndExpired);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                </tr>
            );
        }
        if (error) {
            return (
                <tr>
                    <td colSpan="7" className="py-4 text-center text-red-500">เกิดข้อผิดพลาด: {error}</td>
                </tr>
            );
        }
        if (expiredItems.length === 0) {
            return (
                <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">ไม่พบรายการวัตถุดิบที่หมดอายุ</td>
                </tr>
            );
        }
        return expiredItems.map((ingredient) => (
            <tr key={ingredient.id} className="last:border-b-1 border-[#979999]">
                <td className="py-3 pr-2 font-medium">{ingredient.batch_id}</td>
                <td className="py-3 px-2">{ingredient.name}</td>
                <td className="py-3 px-2">{ingredient.expiry_date}</td>
                <td className="py-3 px-2">{ingredient.category}</td>
                <td className="py-3 px-2">{ingredient.quantity.toFixed(2)}</td>
                <td className="py-3 px-2">{ingredient.unit}</td>
                <td className="py-3 pl-2">
                    <div className="flex justify-start space-x-2">
                        <button className="py-1 px-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                            <Icon icon="mynaui:edit" className="w-4 h-4" />
                        </button>
                        <button className="py-1 px-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                            <Icon icon="fluent:delete-20-regular" className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-10 md:px-24">
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">วัตถุดิบหมดอายุ</h1>
                        <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับวัตถุดิบที่หมดอายุแล้ว</p>
                    </div>
                    {/* Table */}
                    <div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                            <thead className="text-base text-[#979999] lowercase">
                                <tr className="border-b border-[#979999]">
                                    <th scope="col" className="py-3 pr-2 font-normal">Batch ID</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Name</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Expiry Date</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Category</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Quantity</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Unit</th>
                                    <th scope="col" className="py-3 pl-2 font-normal">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-3">
                        <p className="text-base font-medium text-black">
                            Total Expired Items: <span>{expiredItems.length}</span>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}