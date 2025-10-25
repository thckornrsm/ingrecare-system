// app/(backoffice)/statistics/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CustomDropdown from '@/components/CustomDropdown';
import { ArrowDownToLine, ArrowUpFromLine, Archive, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const convertThaiMonthToNumber = (monthName) => {
  const months = {
    'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
    'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
    'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
  };
  return months[monthName] || 0;
};

const category_colors = {
  'ทะเล': { color: 'bg-sky-400' },
  'ผัก': { color: 'bg-green-400' },
  'เครื่องปรุง': { color: 'bg-yellow-400' },
  'เนื้อสัตว์': { color: 'bg-red-400' },
  'อื่นๆ': { color: 'bg-gray-400' }
};

const category_colors_hex = {
  'ทะเล': '#38bdf8',       // bg-sky-400
  'ผัก': '#4ade80',         // bg-green-400
  'เครื่องปรุง': '#facc15', // bg-yellow-400
  'เนื้อสัตว์': '#f87171',   // bg-red-400
  'อื่นๆ': '#9ca3af',        // bg-gray-400
};

// Card 1,2: Stat Summary
const StatCard = ({ icon, title, value, unit, context }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[164px]">
    <div className="flex items-center gap-4 text-gray-600">
      {icon}
      <span>{title}</span>
    </div>
    <div>
      <p className="text-3xl lg:text-4xl font-semibold text-black mt-4">
        {value} <span className="text-xl lg:text-2xl font-medium text-gray-500">{unit}</span>
      </p>
      <p className="text-sm text-gray-400">{context}</p>
    </div>
  </div>
);

// Card 3: Stock By Unit (รอแก้ต่อ)
const StockByUnitCard = ({ list, selectedUnit, combinedTotal }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[164px]">
      <div className="flex items-center gap-3 text-gray-600">
        <Archive size={20} />
        <span>คงเหลือในสต็อก</span>
      </div>

      <div>
        <p className="text-3xl lg:text-4xl font-semibold text-black mt-4">
          {selectedUnit === 'ทั้งหมด' ? combinedTotal : list.find(item => item.unit === selectedUnit)?.qty || 0}
        </p>

        <div>
          {selectedUnit === 'ทั้งหมด' ? (
            <span className="text-sm text-gray-400">ทั้งหมด (รวมทุกหน่วยนับ)</span>
          ) : (
            (!list || list.length === 0) ? (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลคงเหลือ</p>
            ) : (
              <ul>
                {list.map((row) => (
                  <li key={row.unit || '—'} className="">
                    <span className="text-sm text-gray-400">{row.unit || '—'}</span>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Card 4: Key Insight
const KeyInsightCard = ({ insight }) => {
  if (!insight || !insight.name) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-center items-center text-gray-400 min-h-[164px]">
        <Trophy size={24} className="mb-2" />
        <span className="text-sm text-center">ไม่มีข้อมูลไฮไลท์</span>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[164px]">
      <div className="flex items-center gap-4 text-[#B8B8B8]">
        <Trophy size={20} className="text-[#B8B8B8]" />
        <span>{insight.title}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-[#3FA170] mt-4 truncate" title={insight.name}>
          {insight.name}
        </p>
        <p className="text-sm text-gray-400 mt-1">{insight.value}</p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md text-sm">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-gray-600">สัดส่วน: <span className="font-bold text-black">{Number(data.value).toFixed(1)}%</span></p>
      </div>
    );
  }
  return null;
};



// Chart Components
const DonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
        ไม่มีข้อมูลสัดส่วน
      </div>
    );
  }
  const [activeIndex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const COLORS = data.map((d) => {
    // ดึงรหัสสี (เช่น #ef4444 จาก bg-red-400)
    const twColorClass = category_colors[d.name]?.color || 'bg-gray-400';
    // 💡 หากคุณใช้ Tailwind CSS และต้องการสี Hex, คุณอาจต้องสร้าง Map สีเพิ่ม
    // แต่เพื่อความง่ายในตอนนี้ เราจะใช้สีในรูปแบบ string ตามที่คุณกำหนดไว้ใน category_colors
    // **หมายเหตุ:** Recharts ต้องการค่าสีที่เป็น string (เช่น 'red', '#ff0000', 'rgb(255, 0, 0)') 
    // ถ้าคุณต้องการใช้สีจาก Tailwind คุณต้องแปลงมันเป็น Hex Code หรือชื่อสีที่ Recharts เข้าใจ
    // ในตัวอย่างนี้ ผมจะใช้สีพื้นฐานชั่วคราว หรือคุณสามารถปรับ category_colors เป็น Hex Code ได้
    return twColorClass
      .replace('bg-sky-400', '#38bdf8') // light blue
      .replace('bg-green-400', '#4ade80') // light green
      .replace('bg-yellow-400', '#facc15') // yellow
      .replace('bg-red-400', '#f87171') // red
      .replace('bg-gray-400', '#9ca3af'); // gray
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-6 p-6 min-h-[300px]">
      
      {/* 🟢 ส่วนกราฟ Donut Chart พร้อม Tooltip และ Highlight */}
      <div className="w-full max-w-[200px] h-[200px] flex items-center justify-center">
        {/* ใช้ ResponsiveContainer ที่ครอบ PieChart */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80} // ฐาน
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              isAnimationActive={true}
              // 2. 💡 กำหนด Event Handlers สำหรับ Tooltip/Highlight
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={category_colors_hex[entry.name] || category_colors_hex['อื่นๆ']} 
                  // 3. 💡 เงื่อนไขสำหรับ Highlight: ถ้า activeIndex ตรงกับ index ให้เพิ่ม outerRadius
                  outerRadius={index === activeIndex ? 90 : 80}
                  // 4. (ไม่บังคับ แต่ดี) ใช้ stroke เพื่อเพิ่มขอบเวลาไฮไลท์
                  stroke={index === activeIndex ? '#333' : 'none'}
                  strokeWidth={index === activeIndex ? 2 : 0}
                  style={{ transition: 'all 0.3s ease-out' }} // เพิ่มความสวยงาม
                />
              ))}
            </Pie>
            {/* 💡 Tooltip จะทำงานเสถียรขึ้นเมื่อ PieChart ถูกควบคุมด้วย onMouseEnter/onMouseLeave */}
            <Tooltip content={<CustomTooltip />} /> 
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* 🟢 ส่วน Legend ด้านข้าง พร้อม hover:bg-gray-100 */}
      <div className="flex flex-col gap-1 w-full max-w-xs">
        {data.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex items-center justify-between text-sm p-2 rounded-md transition-colors cursor-default
              ${index === activeIndex ? 'bg-gray-200' : 'hover:bg-gray-100'} 
              // 💡 เพิ่ม focus:outline-none ที่นี่
              focus:outline-none
            `} 
            // 💡 เพิ่ม tabindex=0 เพื่อให้มันเป็นองค์ประกอบที่สามารถโฟกัสได้
            tabIndex={0} 
            onMouseEnter={() => onPieEnter(null, index)}
            onMouseLeave={onPieLeave}
            onFocus={() => onPieEnter(null, index)} // เพิ่มสำหรับ Keyboard Focus
            onBlur={onPieLeave} // เพิ่มสำหรับ Keyboard Blur
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-sm ${category_colors[item.name]?.color || 'bg-gray-400'}`} />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-medium text-black">{Number(item.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data, categoryName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
        ไม่มีข้อมูลในหมวดนี้
      </div>
    );
  }
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map((d) => d.value), 0);
  return (
    <div className="p-6 space-y-4 min-h-auto">
      <h3 className="font-semibold text-gray-800">
        วัตถุดิบที่ใช้บ่อยในหมวด “{categoryName}”
      </h3>
      {sortedData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-right text-gray-600 truncate">{item.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-7">
            <div
              className="bg-sky-500 h-7 rounded-full flex items-center justify-end px-2 text-white font-medium"
              style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
            >
              {item.value.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// รอแก้
const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 h-80 flex items-center justify-center">
        ไม่มีข้อมูลแนวโน้ม
      </div>
    );
  }
  return (
    <div className="w-full h-80 pt-4 pr-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="นำเข้า" stroke="#3FA170" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 2 }} />
          <Line type="monotone" dataKey="เบิกจ่าย" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Page
export default function StatisticsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ทั้งหมด');

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([{ name: 'ทั้งหมด' }]);

  const [stockByUnitAll, setStockByUnitAll] = useState([]);

  // โหลดตัวกรอง (เดือน, หมวดหมู่, หน่วยนับ)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [monthRes, categoryRes] = await Promise.all([
          fetch('/api/statistics/filters'),
          fetch('/api/categories'),
        ]);
        if (!monthRes.ok || !categoryRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลตัวกรองได้');

        const monthData = await monthRes.json(); // { availableMonths, unitOptions? }
        const rawCategoryData = await categoryRes.json();

        const formattedCategories = [
          { name: 'ทั้งหมด' },
          ...rawCategoryData.map((c) => ({ name: c.category_name || c.name })),
        ];

        setCategories(formattedCategories);
        setMonthOptions(monthData.availableMonths || []);
        if ((monthData.unitOptions || []).length) {
          setUnitOptions([{ name: 'ทั้งหมด' }, ...monthData.unitOptions.map((u) => ({ name: u.name }))]);
        }

        if ((monthData.availableMonths || []).length > 0) {
          setSelectedMonth(monthData.availableMonths[0].name);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchFilters();
  }, []);

  // Card 3: โหลดข้อมูลคงเหลือตามหน่วย
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const invRes = await fetch('/api/inventory');
        if (!invRes.ok) throw new Error('โหลดข้อมูลคงเหลือไม่สำเร็จ');
        const inv = await invRes.json();

        // สรุปยอดตามหน่วย
        const byUnit = Object.values(
          inv.reduce((acc, row) => {
            const unitName = row.unit?.unit_name || row.unit_name || '—';
            const qty = Number(row.quantity || 0);
            if (!acc[unitName]) acc[unitName] = { unit: unitName, qty: 0 };
            acc[unitName].qty += qty;
            return acc;
          }, {})
        ).sort((a, b) => a.unit.localeCompare(b.unit, 'th'));

        setStockByUnitAll(byUnit);

        // ถ้า unitOptions ยังไม่มี (กรณี API filters ไม่ส่งมา) → เติมจาก inventory
        setUnitOptions((old) => {
          if (old.length > 1) return old;
          return [{ name: 'ทั้งหมด' }, ...byUnit.map((x) => ({ name: x.unit }))];
        });
      } catch (e) {
        // ไม่ต้องฟ้อง error ที่นี่ ถ้าล้มเหลวก็แค่การ์ดคงเหลือแสดง “ไม่มีข้อมูล”
      }
    };
    fetchInventory();
  }, []);

  /* ---------- โหลดข้อมูลสถิติรายเดือน ---------- */
  useEffect(() => {
    if (!selectedMonth) return;
    const [monthName, yearStr] = selectedMonth.split(' ');
    const month = convertThaiMonthToNumber(monthName);
    const year = parseInt(yearStr, 10) - 543;
    if (!month || !year) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/statistics?month=${month}&year=${year}`);
        if (!res.ok) throw new Error((await res.json()).error || 'เกิดข้อผิดพลาด');
        const data = await res.json();

        const formatted = {
          summary: {
            import: data.summary.importTotal,       // รวม “จำนวน” ที่นำเข้า (จะอ่านว่า lot ก็ได้ถ้า backend นับเป็นจำนวนล็อต)
            dispense: data.summary.dispenseTotal,   // รวม “จำนวน” ที่เบิกจ่าย (หรือจำนวนล็อต)
            stock: data.summary.stockTotal,         // ถ้ามีใช้ส่วนอื่นต่อได้
          },
          donut: (data.donut || []).map((d) => ({
            ...d,
            ...(category_colors[d.name] || category_colors['อื่นๆ']),
          })),
          bar: data.bar || {},
          trend: data.trend || [],
          historyStockIn: data.historyStockIn || [],
          historyStockOut: data.historyStockOut || [],
        };

        setCurrentData(formatted);
      } catch (err) {
        setError(err.message);
        setCurrentData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  // Card 4: Key Insight
  const keyInsight = useMemo(() => {
    if (!currentData) return { title: '', name: '', value: '' };
    if (selectedCategory === 'ทั้งหมด' && currentData.donut?.length > 0) {
      const top = [...currentData.donut].sort((a, b) => b.value - a.value)[0];
      return { title: 'หมวดหมู่ใช้เยอะที่สุด', name: top.name, value: `คิดเป็น ${Number(top.value).toFixed(1)}%` };
    }
    if (selectedCategory !== 'ทั้งหมด' && currentData.bar?.[selectedCategory]?.length > 0) {
      const topIng = [...currentData.bar[selectedCategory]].sort((a, b) => b.value - a.value)[0];
      return { title: `ท็อปในหมวด ${selectedCategory}`, name: topIng.name, value: `จำนวน ${topIng.value.toLocaleString()} หน่วย` };
    }
    return { title: '', name: '', value: '' };
  }, [currentData, selectedCategory]);

  /* ---------- สรุปคงเหลือตามหน่วย + ยอดรวมทุกหน่วย ---------- */
  const combinedTotal = useMemo(
    () => stockByUnitAll.reduce((sum, r) => sum + (Number(r.qty) || 0), 0),
    [stockByUnitAll]
  );

  const stockByUnitList = useMemo(() => {
    if (selectedUnit === 'ทั้งหมด') return stockByUnitAll; // จะไม่ถูกแสดงเป็น list ในการ์ด แต่ปล่อยไว้ได้
    const match = stockByUnitAll.find((x) => x.unit === selectedUnit);
    return match ? [match] : [];
  }, [selectedUnit, stockByUnitAll]);

  /* ---------- UI ---------- */
  const renderContent = () => {
    if (isLoading) return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="p-10 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;
    if (!currentData) return <div className="p-10 text-center text-gray-500">ไม่พบข้อมูล</div>;

    /* (ถ้าต้องการ กรอง history ตามหมวดหมู่ได้ที่นี่)
    const filteredIn = selectedCategory === 'ทั้งหมด' ? currentData.historyStockIn : currentData.historyStockIn.filter(i => i.categoryName === selectedCategory);
    const filteredOut = selectedCategory === 'ทั้งหมด' ? currentData.historyStockOut : currentData.historyStockOut.filter(i => i.categoryName === selectedCategory);
    */

    return (
      <>
        {/* cards summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ArrowDownToLine size={20} />}
            title="ปริมาณนำเข้า (Lot)"
            value={(currentData.summary?.import ?? 0).toLocaleString()}
            context={`ข้อมูลเดือน ${selectedMonth}`}
          />
          <StatCard
            icon={<ArrowUpFromLine size={20} />}
            title="ปริมาณเบิกจ่าย (Lot)"
            value={(currentData.summary?.dispense ?? 0).toLocaleString()}
            context={`ข้อมูลเดือน ${selectedMonth}`}
          />
          <StockByUnitCard
            list={stockByUnitList}
            selectedUnit={selectedUnit}
            combinedTotal={combinedTotal}
          />
          <KeyInsightCard insight={keyInsight} />
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200">
            <h2 className="py-3 px-4 bg-gray-100 text-sm text-gray-500 rounded-t-lg border-b border-gray-200">
              {selectedCategory === 'ทั้งหมด'
                ? 'สัดส่วนการใช้วัตถุดิบทั้งหมด'
                : `วัตถุดิบที่ใช้บ่อยในหมวด “${selectedCategory}”`}
            </h2>
            {selectedCategory === 'ทั้งหมด' ? (
              <DonutChart data={currentData.donut} />
            ) : (
              <HorizontalBarChart
                data={currentData.bar?.[selectedCategory] || []}
                categoryName={selectedCategory}
              />
            )}
          </div>

          {selectedCategory === 'ทั้งหมด' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <h2 className="py-3 px-4 bg-gray-100 text-sm text-gray-500 rounded-t-lg border-b border-gray-200">
                แนวโน้มการนำเข้า-เบิกจ่าย ({selectedMonth})
              </h2>
              <TrendChart data={currentData.trend} />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto py-9 px-4 sm:px-8 lg:px-16 xl:px-25">
      <div className="mb-8">
        <h1 className="text-black text-2xl sm:text-3xl font-bold">สถิติและประวัติ</h1>
        <p className="text-[#979999]">ภาพรวมสต็อกวัตถุดิบเพื่อการวางแผนและจัดการ</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CustomDropdown
          label="หมวดหมู่"
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          placeholder="เลือกหมวดหมู่"
          className="md:col-span-1"
        />
        <CustomDropdown
          label="หน่วยนับ"
          categories={unitOptions}
          selectedCategory={selectedUnit}
          onSelectCategory={setSelectedUnit}
          placeholder="เลือกหน่วยนับ"
          className="md:col-span-1"
        />
        <CustomDropdown
          label="เลือกเดือน"
          categories={monthOptions}
          selectedCategory={selectedMonth}
          onSelectCategory={setSelectedMonth}
          placeholder="เลือกเดือน"
          className="md:col-span-2"
        />
      </div>
      {renderContent()}
    </main>
  );
}
