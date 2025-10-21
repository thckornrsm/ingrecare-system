'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CustomDropdown from '@/components/CustomDropdown';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Archive,
  CalendarDays,
  Trophy,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ---------------- helpers ---------------- */
const convertThaiMonthToNumber = (monthName) => {
  const months = {
    'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
    'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
    'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
  };
  return months[monthName] || 0;
};

const CATEGORY_COLORS = {
  'ทะเล': { color: 'bg-sky-400' },
  'ผัก': { color: 'bg-green-400' },
  'เครื่องปรุง': { color: 'bg-yellow-400' },
  'เนื้อสัตว์': { color: 'bg-red-400' },
  'อื่นๆ': { color: 'bg-gray-400' }
};

/* ---------------- small cards ---------------- */
const StatCard = ({ icon, title, value, unit, context }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[164px]">
    <div className="flex items-center gap-3 text-gray-600">
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
      <div className="flex items-center gap-3 text-gray-600">
        <Trophy size={20} className="text-gray-600" />
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

/* ---------------- charts ---------------- */
const DonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
        ไม่มีข้อมูลสัดส่วน
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-6 p-6 min-h-[300px]">
      <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Chart</p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-sm ${CATEGORY_COLORS[item.name]?.color || 'bg-gray-400'}`} />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(item.value).toFixed(1)}%</span>
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
    <div className="p-6 space-y-4 min-h-[300px]">
      <h3 className="font-semibold text-gray-800">
        วัตถุดิบที่ใช้บ่อยในหมวด “{categoryName}”
      </h3>
      {sortedData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm">
          <span className="w-32 text-right text-gray-600 truncate">{item.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-7">
            <div
              className="bg-sky-500 h-7 rounded-full flex items-center justify-end px-2 text-white font-medium"
              style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
            >
              {item.value.toLocaleString()} หน่วย
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

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
          <Line type="monotone" dataKey="นำเข้า" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 2 }} />
          <Line type="monotone" dataKey="เบิกจ่าย" stroke="#f97316" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ---------------- stock-left card (unit filter) ---------------- */
const StockByUnitCard = ({ list, selectedUnit, combinedTotal }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[164px]">
      <div className="flex items-center gap-3 text-gray-600">
        <Archive size={20} />
        <span>คงเหลือในสต็อก</span>
      </div>

      <div className="mt-4">
        {selectedUnit === 'ทั้งหมด' ? (
          <div className="flex items-center justify-between text-gray-800">
            <span className="text-gray-600">ทั้งหมด (รวมทุกหน่วย)</span>
            <span className="font-semibold">
              {combinedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          (!list || list.length === 0 ? (
            <p className="text-sm text-gray-400">ไม่มีข้อมูลคงเหลือ</p>
          ) : (
            <ul className="space-y-2">
              {list.map((row) => (
                <li key={row.unit || '—'} className="flex items-center justify-between text-gray-800">
                  <span className="text-gray-600">{row.unit || '—'}</span>
                  <span className="font-semibold">
                    {row.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          ))
        )}
      </div>
    </div>
  );
};

/* ===================== page ===================== */
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

  // สำหรับการ์ดคงเหลือตามหน่วย
  const [stockByUnitAll, setStockByUnitAll] = useState([]);

  /* ---------- โหลดตัวกรอง (เดือน / หมวดหมู่ / หน่วยนับ) ---------- */
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

  /* ---------- โหลดข้อมูลคงเหลือรวม (ปัจจุบัน) สำหรับการ์ดคงเหลือตามหน่วย ---------- */
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
            ...(CATEGORY_COLORS[d.name] || CATEGORY_COLORS['อื่นๆ']),
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

  /* ---------- insight เล็กๆ ---------- */
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

    // (ถ้าต้องการ กรอง history ตามหมวดหมู่ได้ที่นี่)
    // const filteredIn = selectedCategory === 'ทั้งหมด' ? currentData.historyStockIn : currentData.historyStockIn.filter(i => i.categoryName === selectedCategory);
    // const filteredOut = selectedCategory === 'ทั้งหมด' ? currentData.historyStockOut : currentData.historyStockOut.filter(i => i.categoryName === selectedCategory);

    return (
      <>
        {/* cards summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ArrowDownToLine size={20} />}
            title="ปริมาณนำเข้า (lot)"
            value={(currentData.summary?.import ?? 0).toLocaleString()}
            context={`ข้อมูลเดือน ${selectedMonth}`}
          />
          <StatCard
            icon={<ArrowUpFromLine size={20} />}
            title="ปริมาณเบิกจ่าย (lot)"
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

        {/* charts */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200">
            <h2 className="p-4 font-semibold border-b text-gray-800">
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
              <h2 className="p-4 font-semibold border-b text-gray-800">
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
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 md:py-9 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-black text-2xl sm:text-3xl font-bold">สถิติและประวัติ</h1>
        <p className="text-gray-500">ภาพรวมสต็อกวัตถุดิบเพื่อการวางแผนและจัดการ</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CustomDropdown
          label="หมวดหมู่"
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          placeholder="เลือกหมวดหมู่"
        />
        <CustomDropdown
          label="เลือกเดือน"
          categories={monthOptions}
          selectedCategory={selectedMonth}
          onSelectCategory={setSelectedMonth}
          placeholder="เลือกเดือน"
        />
        <CustomDropdown
          label="หน่วยนับ"
          categories={unitOptions}
          selectedCategory={selectedUnit}
          onSelectCategory={setSelectedUnit}
          placeholder="เลือกหน่วยนับ"
        />
      </div>

      {renderContent()}
    </main>
  );
}
