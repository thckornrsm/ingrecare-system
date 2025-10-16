'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CustomDropdown from '@/components/CustomDropdown';
import {
    Utensils, Leaf, Beef, MoreHorizontal,
    ArrowDownToLine, ArrowUpFromLine, Archive, CalendarDays, Trophy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// --- ฟังก์ชันตัวช่วย ---
const convertThaiMonthToNumber = (monthName) => {
    const months = {
        'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
        'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
        'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
    };
    return months[monthName] || 0;
};


// --- ฐานข้อมูลจำลอง (Mock Database) ---
const allStatsData = {
    'ตุลาคม 2568': {
        summary: { import: 125, dispense: 88, stock: 210 },
        donut: [
            { name: 'ทะเล', value: 30, color: 'bg-sky-400', strokeColor: 'text-sky-400' },
            { name: 'ผัก', value: 15, color: 'bg-green-400', strokeColor: 'text-green-400' },
            { name: 'เครื่องปรุง', value: 20, color: 'bg-yellow-400', strokeColor: 'text-yellow-400' },
            { name: 'เนื้อสัตว์', value: 14, color: 'bg-red-400', strokeColor: 'text-red-400' },
            { name: 'อื่นๆ', value: 8, color: 'bg-gray-400', strokeColor: 'text-gray-400' },
        ],
        bar: {
            'ผัก': [{ name: 'ผักกาด', value: 35 }, { name: 'แครอท', value: 28 }, { name: 'กะหล่ำปลี', value: 78 }],
            'เนื้อสัตว์': [{ name: 'เนื้อวัว', value: 85 }, { name: 'เนื้อหมู', value: 90 }, { name: 'ไก่', value: 70 }],
        },
        trend: [
            { date: '1 ต.ค.', 'นำเข้า': 40, 'เบิกจ่าย': 24 }, { date: '2 ต.ค.', 'นำเข้า': 30, 'เบิกจ่าย': 13 },
            { date: '3 ต.ค.', 'นำเข้า': 20, 'เบิกจ่าย': 68 }, { date: '4 ต.ค.', 'นำเข้า': 27, 'เบิกจ่าย': 39 },
        ]
    },
    'กันยายน 2568': {
        summary: { import: 110, dispense: 95, stock: 173 },
        donut: [
            { name: 'ทะเล', value: 25, color: 'bg-sky-400', strokeColor: 'text-sky-400' },
            { name: 'ผัก', value: 20, color: 'bg-green-400', strokeColor: 'text-green-400' },
            { name: 'เครื่องปรุง', value: 25, color: 'bg-yellow-400', strokeColor: 'text-yellow-400' },
            { name: 'เนื้อสัตว์', value: 15, color: 'bg-red-400', strokeColor: 'text-red-400' },
        ],
        bar: {
            'ผัก': [{ name: 'ผักกาด', value: 42 }, { name: 'แครอท', value: 33 }, { name: 'กะหล่ำปลี', value: 65 }],
            'เนื้อสัตว์': [{ name: 'เนื้อวัว', value: 70 }, { name: 'เนื้อหมู', value: 82 }, { name: 'ไก่', value: 75 }],
        },
        trend: [
            { date: '1 ก.ย.', 'นำเข้า': 35, 'เบิกจ่าย': 20 }, { date: '2 ก.ย.', 'นำเข้า': 45, 'เบิกจ่าย': 33 },
            { date: '3 ก.ย.', 'นำเข้า': 15, 'เบิกจ่าย': 50 }, { date: '4 ก.ย.', 'นำเข้า': 33, 'เบิกจ่าย': 32 },
        ]
    }
};


// --- Components ย่อย ---

const StatCard = ({ icon, title, value, unit, context }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
        <div className="flex items-center gap-3 text-gray-600">
            {icon}
            <span>{title}</span>
        </div>
        <div>
            <p className="text-4xl font-semibold text-black mt-4">
                {value} <span className="text-2xl font-medium text-gray-500">{unit}</span>
            </p>
            <p className="text-sm text-gray-400">{context}</p>
        </div>
    </div>
);

const DonutChart = ({ data }) => {
    const [hovered, setHovered] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 p-8 h-60 flex items-center justify-center">ไม่มีข้อมูล</div>;
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    const handleMouseMove = (e) => {
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-6 p-4 min-h-[300px]">
            {tooltipData && (
                <div
                    className="fixed z-50 p-2 text-sm text-white bg-black rounded-md shadow-lg pointer-events-none"
                    style={{
                        top: tooltipPosition.y,
                        left: tooltipPosition.x + 15,
                    }}
                >
                    {tooltipData.name}: {tooltipData.value}%
                </div>
            )}
            <div className="relative w-56 h-56 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {data.map((item, index) => {
                        const percentage = (item.value / totalValue) * 100;
                        const dashArray = `${percentage} ${100 - percentage}`;
                        const dashOffset = -cumulativePercentage;
                        cumulativePercentage += percentage;
                        return (
                            <circle
                                key={index}
                                cx="18" cy="18" r="14"
                                className={`stroke-current ${item.strokeColor} cursor-pointer transition-opacity duration-300`}
                                strokeWidth="8"
                                fill="none" pathLength="100"
                                strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="butt"
                                onMouseEnter={() => {
                                    setHovered(item.name);
                                    setTooltipData(item);
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => {
                                    setHovered(null);
                                    setTooltipData(null);
                                }}
                                style={{ opacity: hovered && hovered !== item.name ? 0.4 : 1 }}
                            />
                        );
                    })}
                </svg>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[200px]">
                {data.map(item => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-3 text-sm p-2 rounded-md transition-colors duration-200 ${hovered === item.name ? 'bg-gray-100' : 'bg-transparent'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-sm ${item.color}`}></div>
                        <span className={`text-gray-700 ${hovered === item.name ? 'font-bold' : ''}`}>
                            {item.name}
                        </span>
                        <span className={`font-semibold ml-auto ${hovered === item.name ? 'text-black' : 'text-gray-800'}`}>
                            {item.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HorizontalBarChart = ({ data, unit = '' }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 p-8 min-h-[300px] flex items-center justify-center">ไม่มีข้อมูล</div>;
    }
    const barColors = ['bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400', 'bg-red-400', 'bg-pink-400', 'bg-indigo-400'];
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = Math.max(...sortedData.map(item => item.value), 0);

    return (
        <div className="space-y-4 p-4 min-h-[300px]">
            {sortedData.map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                    <span className="w-28 text-right text-gray-600 truncate">{item.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                            className={`${barColors[index % barColors.length]} rounded-full h-6 flex items-center justify-end px-2 text-white font-semibold`}
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                            {item.value}{unit}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 p-8 h-80 flex items-center justify-center">ไม่มีข้อมูล</div>;
    }
    return (
        <div className="w-full h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line type="monotone" dataKey="นำเข้า" stroke="#34d399" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="เบิกจ่าย" stroke="#fb923c" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// ================== โค้ดที่แก้ไข ==================
const KeyInsightCard = ({ insight }) => {
    // กรณีไม่มีข้อมูล
    if (!insight || !insight.name) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-center items-center text-gray-400 min-h-[164px]">
                <Trophy size={24} className="mb-2" />
                <span className="text-sm text-center">ไม่มีข้อมูลไฮไลท์</span>
            </div>
        );
    }
    // การ์ดปกติที่มีข้อมูล
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
            {/* ส่วนบน: ไอคอนและหัวข้อ */}
            <div className="flex items-center gap-3 text-gray-600">
                <Trophy size={20} className="text-gray-600" />
                <span>{insight.title}</span>
            </div>
            {/* ส่วนล่าง: ข้อมูลไฮไลท์ */}
            <div>
                <p className="text-3xl font-bold text-[#3FA170] mt-4 truncate" title={insight.name}>
                    {insight.name}
                </p>
                <p className="text-sm text-gray-400 mt-1">{insight.value}</p>
            </div>
        </div>
    );
};
// ================== สิ้นสุดโค้ดที่แก้ไข ==================


/* ================= Main Statistics Page ================= */
export default function StatisticsPage() {
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [selectedMonth, setSelectedMonth] = useState('ตุลาคม 2568');
    const [currentData, setCurrentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = [{ name: 'ทั้งหมด' }, { name: 'เนื้อสัตว์' }, { name: 'ผัก' },];
    const monthOptions = [{ name: 'ตุลาคม 2568' }, { name: 'กันยายน 2568' },];

    useEffect(() => {
        const fetchData = () => {
            setIsLoading(true);
            setError(null);
            setTimeout(() => {
                const mockData = allStatsData[selectedMonth];
                if (mockData) {
                    setCurrentData(mockData);
                } else {
                    setError('ไม่พบข้อมูลสำหรับเดือนที่เลือก');
                    setCurrentData(null);
                }
                setIsLoading(false);
            }, 500);
        };
        fetchData();
    }, [selectedMonth]);

    let keyInsight = { title: '', name: '', value: '' };
    if (currentData) {
        if (selectedCategory === 'ทั้งหมด' && currentData.donut?.length > 0) {
            const topCategory = [...currentData.donut].sort((a, b) => b.value - a.value)[0];
            keyInsight = { title: 'หมวดหมู่ใช้เยอะที่สุด', name: topCategory.name, value: `คิดเป็น ${topCategory.value}%` };
        } else if (selectedCategory !== 'ทั้งหมด' && currentData.bar?.[selectedCategory]?.length > 0) {
            const topIngredient = [...currentData.bar[selectedCategory]].sort((a, b) => b.value - a.value)[0];
            keyInsight = { title: `ท็อปในหมวด ${selectedCategory}`, name: topIngredient.name, value: `จำนวน ${topIngredient.value} กก.` };
        }
    }

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-10 text-gray-500">กำลังโหลดข้อมูล...</div>;
        if (error) return <div className="text-center p-10 text-red-500">เกิดข้อผิดพลาด: {error}</div>;
        if (!currentData) return <div className="text-center p-10 text-gray-500">ไม่พบข้อมูล</div>;

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<ArrowDownToLine size={20} />} title="ปริมาณการนำเข้า" value={currentData.summary?.import || 'N/A'} context={`ข้อมูลเดือน ${selectedMonth}`} />
                    <StatCard icon={<ArrowUpFromLine size={20} />} title="ปริมาณที่ถูกเบิกจ่าย" value={currentData.summary?.dispense || 'N/A'} context={`ข้อมูลเดือน ${selectedMonth}`} />
                    <StatCard icon={<Archive size={20} />} title="คงเหลือในสต็อก" value={currentData.summary?.stock || 'N/A'} context="อัปเดตล่าสุด" />
                    <KeyInsightCard insight={keyInsight} />
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-800">
                                {selectedCategory === 'ทั้งหมด' ? 'สัดส่วนการใช้วัตถุดิบทั้งหมด' : `วัตถุดิบที่ใช้บ่อยในหมวด "${selectedCategory}"`}
                            </h2>
                        </div>
                        <div className="p-2">
                            {selectedCategory === 'ทั้งหมด' ? (
                                <DonutChart data={currentData.donut} />
                            ) : (
                                <HorizontalBarChart data={currentData.bar?.[selectedCategory] || []} unit=" กก." />
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-800">แนวโน้มการนำเข้า-เบิกจ่าย ({selectedMonth})</h2>
                        </div>
                        <div>
                            <TrendChart data={currentData.trend} />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="flex h-full bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">สถิติการใช้งาน</h1>
                        <p className="text-gray-500">ภาพรวมสต็อกวัตถุดิบเพื่อการวางแผนและจัดการ</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <CustomDropdown label="หมวดหมู่" categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                        <CustomDropdown label="เลือกเดือน" icon={<CalendarDays size={16} />} categories={monthOptions} selectedCategory={selectedMonth} onSelectCategory={setSelectedMonth} />
                    </div>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}