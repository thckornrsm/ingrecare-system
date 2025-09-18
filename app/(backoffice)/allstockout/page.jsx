"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Icon } from '@iconify/react';

export default function AllStockout() {
    const [stockoutHistory, setStockoutHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch data from the stock-out API
                const res = await fetch('/api/stockout'); 
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
                }
                const data = await res.json();

                // 2. Format the data for the table
                const formattedHistory = data.map(item => ({
                    id: item.stockout_id,
                    name: item.ingredient.name,
                    out_date: new Date(item.out_date).toLocaleString('th-TH'),
                    category: item.ingredient.category.category_name,
                    quantity: item.quantity,
                    unit: item.unit.unit_name,
                }));
                
                setStockoutHistory(formattedHistory);

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
        if (stockoutHistory.length === 0) {
            return (
                <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">ไม่พบประวัติการเบิกจ่ายวัตถุดิบ</td>
                </tr>
            );
        }
        return stockoutHistory.map((item) => (
            <tr key={item.id} className="last:border-b-1 border-[#979999]">
                <td className="py-3 pr-2 font-medium">{item.id}</td>
                <td className="py-3 px-2">{item.name}</td>
                <td className="py-3 px-2">{item.out_date}</td>
                <td className="py-3 px-2">{item.category}</td>
                <td className="py-3 px-2">{item.quantity.toFixed(2)}</td>
                <td className="py-3 px-2">{item.unit}</td>
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
                        <h1 className="text-black text-3xl font-bold">ประวัติการเบิกจ่าย</h1>
                        <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการเบิกจ่ายวัตถุดิบในระบบ</p>
                    </div>
                    {/* Table */}
                    <div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                            <thead className="text-base text-[#979999] lowercase">
                                <tr className="border-b border-[#979999]">
                                    <th scope="col" className="py-3 pr-2 font-normal">Stockout ID</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Name</th>
                                    <th scope="col" className="py-3 px-2 font-normal">Out Date</th>
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
                            Total Stock Out: <span>{stockoutHistory.length}</span>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
