"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Icon } from '@iconify/react';

export default function AllStockin() {
    const [stockinHistory, setStockinHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/stockin');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
                }
                const batches = await res.json();

                const formattedHistory = batches.flatMap(batch =>
                    batch.stockins.map(stockin => ({
                        id: stockin.stockin_id,
                        name: stockin.ingredient.name,
                        received_date: new Date(stockin.received_date).toLocaleDateString('th-TH'), // Assuming you want the date formatted
                        expiry_date: new Date(stockin.expiry_date).toLocaleDateString('th-TH'), // Assuming you want the date formatted
                        category: stockin.ingredient.category.category_name,
                        quantity: stockin.quantity,
                        unit: stockin.unit.unit_name,
                    }))
                );
                
                setStockinHistory(formattedHistory);

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
                    <td colSpan="8" className="py-4 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                </tr>
            );
        }
        if (error) {
            return (
                <tr>
                    <td colSpan="8" className="py-4 text-center text-red-500">เกิดข้อผิดพลาด: {error}</td>
                </tr>
            );
        }
        if (stockinHistory.length === 0) {
            return (
                <tr>
                    <td colSpan="8" className="py-4 text-center text-gray-500">ไม่พบประวัติการนำเข้าวัตถุดิบ</td>
                </tr>
            );
        }
        return stockinHistory.map((item) => (
            // Applied styling from your sample UI
            <tr key={item.id} className="last:border-b-1 border-[#979999]">
                <td className="py-3 pr-2">{item.id}</td>
                <td className="py-3 px-2">{item.name}</td>
                <td className="py-3 px-2">{item.received_date}</td>
                <td className="py-3 px-2">{item.expiry_date}</td>
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
                <main className="flex-1 overflow-y-auto py-9 px-25"> 
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">ประวัติการนำเข้า</h1>
                        <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับการนำเข้าวัตถุดิบในระบบ</p>
                    </div>
                    {/* Table */}
                    <div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                            <thead className="text-base text-[#979999] lowercase">
                                <tr className="border-b border-[#979999]">
                                    <th scope="col" className="py-3 pr-2 font-normal">stockin_id</th>
                                    <th scope="col" className="py-3 px-2 font-normal">name</th>
                                    <th scope="col" className="py-3 px-2 font-normal">received_date</th>
                                    <th scope="col" className="py-3 px-2 font-normal">expiry_date</th>
                                    <th scope="col" className="py-3 px-2 font-normal">category</th>
                                    <th scope="col" className="py-3 px-2 font-normal">quantity</th>
                                    <th scope="col" className="py-3 px-2 font-normal">unit</th>
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
                            Total Stock In: <span>{stockinHistory.length}</span>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}