// app/(frontoffice)/contact/page.jsx
"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { Icon } from '@iconify/react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Toast Notification Component
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

// Terms Popup Component
const TermsPopup = ({ isOpen, onAccept, onDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#3FA170] to-[#48A78D] rounded-full flex items-center justify-center">
                            <Icon icon="mdi:file-document-outline" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">ข้อกำหนดและเงื่อนไขการใช้บริการ</h2>
                            <p className="text-sm text-gray-500">กรุณาอ่านข้อกำหนดก่อนดำเนินการต่อ</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-700">
					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">1. การเข้าถึงและการใช้บริการ (IngreCare System)</h3>
						<p className="text-sm leading-relaxed">
							ท่านตกลงที่จะใช้ระบบ IngreCare System เพื่อวัตถุประสงค์ในการจัดการวัตถุดิบหลังบ้าน
							การตรวจสอบวันหมดอายุ การบันทึกการนำเข้าวัตถุดิบ และการเบิกจ่ายวัตถุดิบเท่านั้น
							ท่านจะต้องรับผิดชอบในการรักษาความลับของชื่อผู้ใช้งานและรหัสผ่านของท่าน
							และกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน
						</p>
					</section>

					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">2. กรรมสิทธิ์และลิขสิทธิ์</h3>
						<p className="text-sm leading-relaxed">
							ลิขสิทธิ์และสิทธิในทรัพย์สินทางปัญญาในระบบ IngreCare System รวมถึงโค้ด ฟังก์ชันการทำงาน
							และส่วนประกอบทั้งหมด เป็นของทีมผู้พัฒนาแต่เพียงผู้เดียว
							การทำซ้ำ ดัดแปลง เผยแพร่ หรือจำหน่ายจ่ายโอนระบบนี้โดยไม่ได้รับอนุญาตถือเป็นการละเมิดข้อตกลงและเงื่อนไขในการใช้บริการนี้
						</p>
						<ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
							<li>ข้อมูลที่ท่านนำเข้าสู่ระบบ (เช่น ข้อมูลวัตถุดิบ) ถือเป็นกรรมสิทธิ์ของท่าน</li>
							<li>สถิติการใช้งานและรายงานวิเคราะห์ที่สร้างโดยระบบถือเป็นผลผลิตของระบบ</li>
						</ul>
					</section>

					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">3. ความถูกต้องของข้อมูลและการรับประกัน</h3>
						<p className="text-sm leading-relaxed">
							ระบบมีวัตถุประสงค์เพื่อเป็นเครื่องมือช่วยในการจัดการและรายงานผล
							ไม่รับประกันว่าการทำงานของระบบจะปราศจากข้อผิดพลาดโดยสิ้นเชิง
							และความรับผิดชอบในการนำเข้าและตรวจสอบความถูกต้องของข้อมูลวัตถุดิบ (เช่น วันหมดอายุ)
							ขึ้นอยู่กับผู้ใช้งานแต่เพียงผู้เดียว
						</p>
					</section>

					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">4. การระงับและการยกเลิกบริการ</h3>
						<p className="text-sm leading-relaxed">
							ขอสงวนสิทธิ์ในการระงับหรือยกเลิกการให้บริการแก่ท่านได้ทันที
							หากพบว่าท่านละเมิดข้อตกลงและเงื่อนไขที่กำหนดไว้ รวมถึงการใช้งานที่ไม่ชอบด้วยกฎหมาย
							หรือการกระทำใด ๆ ที่ส่งผลกระทบต่อความมั่นคงของระบบ
						</p>
					</section>

					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">5. การจำกัดความรับผิด</h3>
						<p className="text-sm leading-relaxed">
							ภายใต้ขอบเขตสูงสุดที่กฎหมายอนุญาต ทีมผู้พัฒนาจะไม่รับผิดชอบต่อความเสียหายใด ๆ
							ที่เกิดขึ้นจากการใช้หรือไม่สามารถใช้ระบบ IngreCare System ได้
							รวมถึงความเสียหายทางอ้อม ความเสียหายอันเป็นผลสืบเนื่อง หรือการสูญเสียผลกำไร
							อันเนื่องมาจากข้อผิดพลาดของข้อมูลหรือความบกพร่องของระบบ
						</p>
					</section>

					<section>
						<h3 className="font-bold text-lg text-gray-900 mb-2">6. การแก้ไขข้อตกลงและเงื่อนไข</h3>
						<p className="text-sm leading-relaxed">
							ทีมผู้พัฒนาขอสงวนสิทธิ์ในการแก้ไขหรือปรับปรุงข้อตกลงและเงื่อนไขการใช้บริการนี้ได้ตลอดเวลา
							โดยการแก้ไขดังกล่าวจะมีผลบังคับใช้ทันทีเมื่อมีการเผยแพร่บนเว็บไซต์หรือแจ้งให้ท่านทราบผ่านช่องทางอื่น ๆ
							ที่เหมาะสม การใช้บริการอย่างต่อเนื่องของท่านถือเป็นการยอมรับข้อตกลงที่แก้ไขแล้ว
						</p>
					</section>

					<div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl mt-6">
						<p className="text-sm text-gray-800">
							<strong>หมายเหตุ:</strong> เมื่อท่านยอมรับข้อตกลง จะถือว่าท่านได้อ่านและยอมรับข้อกำหนดและเงื่อนไขการใช้บริการนี้ทั้งหมดโดยสมบูรณ์
						</p>
					</div>
				</div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all cursor-pointer"
                    >
                        ไม่ยอมรับ
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3FA170] to-[#48A78D] text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    >
                        ยอมรับข้อตกลง
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Page
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
    const [showTermsPopup, setShowTermsPopup] = useState(false);

    // Validation errors
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    // State for address dropdowns
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|th|net|org|co\.th|ac\.th|go\.th)$/i;
        return emailRegex.test(email);
    };

    // Phone validation (10 digits only)
    const validatePhone = (phone) => {
        const cleanedPhone = phone.replace(/[^0-9]/g, '');
        return /^[0-9]{10}$/.test(cleanedPhone);
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

        // Phone validation - only numbers, max 10 digits, auto-format with dashes
        if (id === 'phone') {
            const cleaned = value.replace(/[^0-9]/g, '').slice(0, 10);
            
            // Auto-format with dashes when 10 digits are entered
            let formatted = cleaned;
            if (cleaned.length === 10) {
                formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
            }
            
            setFormData(prev => ({ ...prev, [id]: formatted }));
            
            if (cleaned.length > 0 && cleaned.length !== 10) {
                setPhoneError('เบอร์โทรศัพท์ต้องมี 10 หลัก');
            } else {
                setPhoneError('');
            }
            return;
        }
        
        // Email validation
        if (id === 'email') {
            setFormData(prev => ({ ...prev, [id]: value }));
            if (value && !validateEmail(value)) {
                setEmailError('อีเมลต้องจบด้วย .com, .th, .net, .org, .co.th, .ac.th หรือ .go.th');
            } else {
                setEmailError('');
            }
            return;
        }

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

        const companyName = formData.companyName.trim();
        const address = formData.address.trim();

        if (!companyName) {
            showToast('กรุณากรอกชื่อร้านค้า', 'error');
            return;
        }

        // Validation before submit
        if (!validateEmail(formData.email)) {
            showToast('กรุณากรอกอีเมลให้ถูกต้อง', 'error');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            showToast('เบอร์โทรศัพท์ต้องมี 10 หลัก', 'error');
            return;
        }

        if (!address) {
            showToast('กรุณากรอกที่อยู่', 'error');
            return;
        }

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
                    phone: formData.phone.replace(/[^0-9]/g, ''),
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

            setIsSubmitted(true);

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
            <main className="min-h-screen item-center flex-1 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="contact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="1.5" fill="#10b981" opacity="0.3"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#contact-grid)"/>
                        </svg>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 hover:shadow-md transition-shadow">
                            <Icon icon="line-md:email-alt-twotone" className="w-4 h-4 text-[#3FA170] animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">พร้อมให้บริการ</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            ติดต่อ<span className="bg-gradient-to-r from-[#3FA170] to-[#48A78D] bg-clip-text text-transparent">ฝ่ายขาย</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            กรอกข้อมูลด้านล่าง แล้วทีมงานของเราจะติดต่อกลับไปโดยเร็วที่สุด
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {isSubmitted ? (
                                <div className="text-center py-20 px-8">
                                    <div className="w-20 h-20 bg-gradient-to-r from-[#3FA170] to-[#48A78D] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                        <Icon icon="mdi:check-bold" className="text-white w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">ส่งข้อมูลสำเร็จ!</h2>
                                    <p className="text-lg text-gray-600 mb-8">
                                        ขอบคุณสำหรับข้อมูลของท่าน<br/>
                                        เราจะติดต่อกลับไปโดยเร็วที่สุด
                                    </p>
                                    <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:clock-outline" className="w-5 h-5" />
                                            <span>ภายใน 24 ชั่วโมง</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:email-outline" className="w-5 h-5" />
                                            <span>ทาง Email</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 md:p-12">
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-1 md:col-span-2">
                                                <label htmlFor="companyName" className="block text-gray-700 mb-1">ชื่อร้านค้า (Company Name) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Icon icon="mdi:store" className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input type="text" id="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="กรอกชื่อร้านค้าของคุณ" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-gray-700 mb-1">อีเมล (Email) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <div className="absolute pl-4 pt-4 z-10 pointer-events-none">
                                                        <Icon icon="mdi:email" className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="email" id="email" value={formData.email} 
                                                        onChange={handleInputChange} placeholder="Example@example.com" required 
                                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                                                            emailError  ? 'focus:ring-red-500' 
                                                                        : 'focus:ring-[#3FA170]'
                                                        }`} />
                                                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="block text-gray-700 mb-1">เบอร์โทรศัพท์ (Telephone) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <div className="absolute pl-4 pt-4 z-10 pointer-events-none">
                                                        <Icon icon="mdi:phone" className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input type="tel" id="phone" value={formData.phone} 
                                                    onChange={handleInputChange} placeholder="08X-XXX-XXXX" required
                                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all ${
                                                            phoneError  ? 'focus:ring-red-500' 
                                                                        : 'focus:ring-[#3FA170]'
                                                        }`} />
                                                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                                                </div>
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <label htmlFor="address" className="block text-gray-700 mb-1">ที่อยู่ (Address) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <div className="absolute pl-4 pt-4 z-10 pointer-events-none">
                                                        <Icon icon="mdi:map-marker" className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <input type="text" id="address" value={formData.address} onChange={handleInputChange} placeholder="บ้านเลขที่, หมู่, ถนน" className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="provinceId" className="block text-gray-700 mb-1">จังหวัด (Province) <span className="text-red-500">*</span></label>
                                                <select id="provinceId" value={formData.provinceId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all appearance-none cursor-pointer" >
                                                    <option value="" disabled>เลือกจังหวัด</option>
                                                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="districtId" className="block text-gray-700 mb-1">อำเภอ (District) <span className="text-red-500">*</span></label>
                                                <select id="districtId" value={formData.districtId} onChange={handleInputChange} disabled={!formData.provinceId} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all appearance-none cursor-pointer disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed" >
                                                    <option value="" disabled>{formData.provinceId ? (districts.length > 0 ? "เลือกอำเภอ" : "กำลังโหลด...") : "กรุณาเลือกจังหวัด"}</option>
                                                    {districts.map(d => <option key={d.id} value={d.id}>{d.name_th}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="subdistrictId" className="block text-gray-700 mb-1">ตำบล (Subdistrict) <span className="text-red-500">*</span></label>
                                                <select id="subdistrictId" value={formData.subdistrictId} onChange={handleInputChange} disabled={!formData.districtId} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] focus:bg-white transition-all appearance-none cursor-pointer disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed" >
                                                    <option value="" disabled>{formData.districtId ? (subdistricts.length > 0 ? "เลือกตำบล" : "กำลังโหลด...") : "กรุณาเลือกอำเภอ"}</option>
                                                    {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name_th}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="zipcode" className="block text-gray-700 mb-1">รหัสไปรษณีย์ (Zip Code) <span className="text-red-500">*</span></label>
                                                <input type="text" id="zipcode" value={formData.zipcode} readOnly placeholder="รหัสไปรษณีย์จะแสดงอัตโนมัติ" className="w-full px-4 py-3 bg-gray-100 text-gray-600 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA170] transition-all appearance-none cursor-not-allowed" />
                                            </div>
                                        </div>

                                        {/* Terms and Submit */}
                                        <div className="flex items-center gap-3 py-2">
                                            <input type="checkbox" id="terms" checked={termsAccepted} 
                                            onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox text-[#3FA170] rounded cursor-pointer w-5 h-5 border-2 border-gray-300 " />
                                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                                ฉันยอมรับ <span onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowTermsPopup(true);
                                                }} className="text-green-600 hover:underline cursor-pointer">ข้อกำหนดและเงื่อนไขในการใช้บริการ</span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || !termsAccepted || emailError || phoneError}
                                            className="group w-full bg-gradient-to-r from-[#3FA170] to-[#48A78D] text-white py-4 rounded-xl font-medium text-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 curs"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
                                                    <span>กำลังส่งข้อมูล...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>ให้เจ้าหน้าที่ติดต่อกลับ</span>
                                                    <Icon icon="mdi:arrow-right" className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <style jsx>
                {`
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.3s ease-out;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }`}
            </style>
            <Footer />
            {toast.show && (
                <ToastNotification 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ show: false, message: '', type: '' })} 
                />
            )}

            <TermsPopup 
                isOpen={showTermsPopup}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowTermsPopup(false);
                }}
                onDecline={() => {
                    setTermsAccepted(false);
                    setShowTermsPopup(false);
                }}
            />
        </div>
    );
}