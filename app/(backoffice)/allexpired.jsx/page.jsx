"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import { Icon } from '@iconify/react';

// Sample data
const ingredients = [
  {
    id: 100001,
    name: "เนื้อวากิวพรีเมียม",
    expiry_day: 7,
    category_id: "เนื้อสัตว์",
    quantity: 10.00,
    unit_type: "kg.",
  },
  {
    id: 100002,
    name: "ผักกาดขาว",
    expiry_day: 10,
    category_id: "ผัก",
    quantity: 2.50,
    unit_type: "kg.",
  },
  {
    id: 100003,
    name: "เนื้อหมูสับ",
    expiry_day: 7,
    category_id: "เนื้อสัตว์",
    quantity: 5.00,
    unit_type: "kg.",
  },
  {
    id: 100004,
    name: "ปลาคอลลี่",
    expiry_day: 10,
    category_id: "ทะเล",
    quantity: 5,
    unit_type: "pack",
  },
  {
    id: 100005,
    name: "ปลาหมึก",
    expiry_day: 10,
    category_id: "ทะเล",
    quantity: 3.00,
    unit_type: "kg.",
  },
  {
    id: 100006,
    name: "ซีอิ๊วขาว",
    expiry_day: 30,
    category_id: "เครื่องปรุง",
    quantity: 7,
    unit_type: "bottle",
  },
  {
    id: 100007,
    name: "พริกไทยดำป่น",
    expiry_day: 30,
    category_id: "เครื่องปรุง",
    quantity: 4,
    unit_type: "bottle",
  },
  {
    id: 100008,
    name: "น้ำซุป",
    expiry_day: 15,
    category_id: "อื่นๆ",
    quantity: 12,
    unit_type: "kg.",
  },
  {
    id: 100009,
    name: "แตงโม",
    expiry_day: 10,
    category_id: "ผลไม้",
    quantity: 8,
    unit_type: "kg.",
  },
];

export default function AllExpired() {
  return (
    <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto py-9 px-25">
                <div className="mb-8">
                  <h1 className="text-black text-3xl font-bold">วัตถุดิบหมดอายุ</h1>
                  <p className="text-[#979999]">ตารางข้อมูลเกี่ยวกับวัตถุดิบที่หมดอายุแล้ว</p>
                </div>
                {/* Table */}
                <div>
                    <table className="w-full text-sm text-left rtl:text-right text-gray-800">
                        <thead className="text-base text-[#979999] lowercase">
                            <tr className="border-b-1 border-[#979999]">
                                <th scope="col" className="py-3 pr-2 font-normal">batch_id</th>
                                <th scope="col" className="py-3 px-2 font-normal">name</th>
                                <th scope="col" className="py-3 px-2 font-normal">expiry_day</th>
                                <th scope="col" className="py-3 px-2 font-normal">category_id</th>
                                <th scope="col" className="py-3 px-2 font-normal">quantity</th>
                                <th scope="col" className="py-3 px-2 font-normal">type</th>
                                <th scope="col" className="py-3 pl-2 font-normal">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ingredients.map((ingredient, index) => (
                                <tr key={ingredient.id} className="last:border-b-1 border-[#979999]">
                                    <td className="py-3 pr-2">{ingredient.id}</td>
                                    <td className="py-3 px-2">{ingredient.name}</td>
                                    <td className="py-3 px-2">{ingredient.expiry_day}</td>
                                    <td className="py-3 px-2">{ingredient.category_id}</td>
                                    <td className="py-3 px-2">{ingredient.quantity.toFixed(2)}</td>
                                    <td className="py-3 px-2">{ingredient.unit_type}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
                    
                <div className="mt-3">
                    <p className="text-base text-medium text-black">
                        Total Ingredients: <span>{ingredients.length}</span>
                    </p>
                </div>
            </main>
        </div>
    </div>
  );
}