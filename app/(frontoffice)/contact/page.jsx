"use client";
import React, { useState, useEffect, forwardRef } from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, X } from 'lucide-react'; // Import icons for toast

// ========= ToastNotification Component =========
const ToastNotification = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const IconComponent = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-lg border-l-4 shadow-lg ${bgColor} ${borderColor} animate-fade-in-right`}>
            <IconComponent className={textColor} />
            <div className={`ml-3 text-sm font-medium ${textColor}`}>
                {message}
            </div>
            <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex h-8 w-8 ${textColor} hover:bg-opacity-20`}>
                <X size={20} />
            </button>
        </div>
    );
};

export default function ContactPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        address: '',
        provinceId: '',
        districtId: '',
        subdistrictId: '',
        zipcode: ''
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // State for address dropdowns
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch('/api/provinces');
                if (!res.ok) throw new Error('Failed to fetch provinces');
                const data = await res.json();
                setProvinces(data.provinces || []);
            } catch (err) {
                console.error(err);
                showToast('ไม่สามารถโหลดข้อมูลจังหวัดได้', 'error');
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (!formData.provinceId) {
            setDistricts([]);
            setSubdistricts([]);
            setFormData(prev => ({ ...prev, districtId: '', subdistrictId: '', zipcode: '' }));
            return;
        }
        const fetchDistricts = async () => {
            try {
                const res = await fetch(`/api/districts?provinceId=${formData.provinceId}`);
                if (!res.ok) throw new Error('Failed to fetch districts');
                const data = await res.json();
                setDistricts(data.districts || []);
            } catch (err) {
                console.error(err);
                showToast('ไม่สามารถโหลดข้อมูลอำเภอได้', 'error');
            }
        };
        fetchDistricts();
    }, [formData.provinceId]);

    // Fetch subdistricts when district changes
    useEffect(() => {
        if (!formData.districtId) {
            setSubdistricts([]);
            setFormData(prev => ({ ...prev, subdistrictId: '', zipcode: '' }));
            return;
        }
        const fetchSubdistricts = async () => {
            try {
                const res = await fetch(`/api/subdistricts?districtId=${formData.districtId}`);
                if (!res.ok) throw new Error('Failed to fetch subdistricts');
                const data = await res.json();
                setSubdistricts(data.subdistricts || []);
            } catch (err) {
                console.error(err);
                showToast('ไม่สามารถโหลดข้อมูลตำบลได้', 'error');
            }
        };
        fetchSubdistricts();
    }, [formData.districtId]);
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (id === 'subdistrictId') {
            const selectedSubdistrict = subdistricts.find(s => s.id === parseInt(value));
            if (selectedSubdistrict) {
                setFormData(prev => ({ ...prev, zipcode: selectedSubdistrict.zipcode || '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!termsAccepted) {
            showToast('กรุณายอมรับข้อตกลงและเงื่อนไข', 'error');
            return;
        }
        
        setIsLoading(true);

        try {
            const res = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    provinceId: formData.provinceId ? parseInt(formData.provinceId) : null,
                    districtId: formData.districtId ? parseInt(formData.districtId) : null,
                    subdistrictId: formData.subdistrictId ? parseInt(formData.subdistrictId) : null,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            setIsSubmitted(true); // Show success message screen

        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-[#0F2B46]">
            <Navbar />
            <main className="min-h-screen bg-white text-[#0F2B46] py-12 flex flex-col items-center bg-gradient-to-t from-[#3FA170] to-[#F7FAFC] text-white">
                <h1 className="text-black text-3xl font-bold text-center mb-8">ติดต่อฝ่ายขาย</h1>
                <div className="w-full max-w-4xl rounded-lg shadow-lg p-8 md:p-12 text-gray-800 bg-white">
                    {isSubmitted ? (
                        <div className="text-center py-10">
                            <Icon icon="mdi:check-circle-outline" className="text-[#3FA170] w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">ส่งข้อมูลสำเร็จ</h2>
                            <p className="text-gray-600 mt-2">ขอบคุณสำหรับข้อมูลของท่าน เจ้าหน้าที่จะติดต่อกลับไปโดยเร็วที่สุด</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="companyName" className="block text-gray-700 mb-1">ชื่อร้านค้า (Company Name) <span className="text-red-500">*</span></label>
                                    <input type="text" id="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="กรอกชื่อร้านค้าของคุณ" required className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-gray-700 mb-1">อีเมล (Email) <span className="text-red-500">*</span></label>
                                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" required className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]"/>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} placeholder="08xxxxxxxx" className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]"/>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label htmlFor="address" className="block text-gray-700 mb-1">ที่อยู่ (Address)</label>
                                    <input type="text" id="address" value={formData.address} onChange={handleInputChange} placeholder="บ้านเลขที่, หมู่, ถนน" className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]"/>
                                </div>
                                <div>
                                    <label htmlFor="provinceId" className="block text-gray-700 mb-1">จังหวัด</label>
                                    <select id="provinceId" value={formData.provinceId} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]">
                                        <option value="">เลือกจังหวัด</option>
                                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="districtId" className="block text-gray-700 mb-1">อำเภอ</label>
                                    <select id="districtId" value={formData.districtId} onChange={handleInputChange} disabled={!formData.provinceId} className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170] disabled:bg-gray-200">
                                        <option value="">เลือกอำเภอ</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name_th}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="subdistrictId" className="block text-gray-700 mb-1">ตำบล</label>
                                    <select id="subdistrictId" value={formData.subdistrictId} onChange={handleInputChange} disabled={!formData.districtId} className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170] disabled:bg-gray-200">
                                        <option value="">เลือกตำบล</option>
                                        {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name_th}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="zipcode" className="block text-gray-700 mb-1">รหัสไปรษณีย์</label>
                                    <input type="text" id="zipcode" value={formData.zipcode} readOnly className="w-full p-3 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:border-[#3FA170]"/>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox h-4 w-4 text-green-600 rounded"/>
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    ฉันยอมรับข้อตกลงในการใช้งานและ <a href="#" className="text-green-600 hover:underline">นโยบายความเป็นส่วนตัว</a>
                                </label>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#3FA170] text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
                            >
                                {isLoading ? 'กำลังส่งข้อมูล...' : 'ให้เจ้าหน้าที่ติดต่อกลับ'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            <Footer />

            {toast.show && (
                <ToastNotification 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ show: false, message: '', type: '' })} 
                />
            )}
        </div>
    );
}

