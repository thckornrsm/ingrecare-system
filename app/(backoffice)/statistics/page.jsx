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
      <p className="text-sm text-gray-400 mt-1">{context}</p>
    </div>
  </div>
);

// Card 3: Stock By Unit
const StockByUnitCard = ({ list, selectedUnit, combinedTotal, selectedCategory }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[164px]">
      <div className="flex items-center gap-4 text-gray-600">
        <Archive size={20} />
        <span>คงเหลือในสต็อก</span>
      </div>

      <div>
        {selectedUnit === 'ทั้งหมด' ? (
          <>
            <p className="text-3xl lg:text-4xl font-semibold text-black mt-4">
              {combinedTotal}
              <span className="text-xl lg:text-2xl font-medium text-gray-500 ml-2"> </span>
            </p>
            <span className="text-sm text-gray-400">
              {selectedCategory === 'ทั้งหมด' ? 'ทั้งหมด (รวมทุกหน่วยนับ)' : `${selectedCategory} (รวมทุกหน่วยนับ)`}
            </span>
          </>
        ) : (
          <>
            <p className="text-3xl lg:text-4xl font-semibold text-black mt-4">
              {list.find(item => item.unit === selectedUnit)?.qty || 0}
              <span className="text-xl lg:text-2xl font-medium text-gray-500 ml-2">{selectedUnit}</span>
            </p>
            <span className="text-sm text-gray-400">
              {selectedCategory === 'ทั้งหมด' ? 'ทั้งหมด (รวมทุกหมวดหมู่)' : `ในหมวด ${selectedCategory}`}
            </span>
          </>
        )}
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
      <div className="flex items-center gap-4 text-gray-600">
        <Trophy size={20} className="text-gray-600" />
        <span>{insight.title}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-black mt-4" title={insight.name}>
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
      <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm">
        <p className="text-gray-800 text-base">{data.name}</p>
        <p className="text-gray-600 text-sm">สัดส่วน : <span className="text-black font-medium">{Number(data.value).toFixed(2)}%</span></p>
      </div>
    );
  }
  return null;
};

const getRandomColor = () => {
  const hue = 130 + Math.floor(Math.random() * 80); // 130-210 (เขียว-ฟ้า)
  const saturation = 40 + Math.floor(Math.random() * 30); // 40-70%
  const lightness = 50 + Math.floor(Math.random() * 30); // 50-80%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Chart Components
const DonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
        ไม่พบข้อมูล
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

  const [randomColorsMap] = useState(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = getRandomColor();
      }
      return acc;
    }, {});
  });

  const COLORS = data.map(d => randomColorsMap[d.name]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-6 p-6 min-h-[300px]">
      <div className="w-full max-w-[200px] h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              isAnimationActive={true}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]} 
                  style={{ 
                    transition: 'all 0.3s ease-out',
                    filter: index === activeIndex ? 'brightness(0.7)' : 'none',
                    outline: 'none'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} /> 
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col gap-1 w-full max-w-xs">
        {data.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex items-center justify-between text-sm p-2 rounded-md transition-colors cursor-default outline-none
              ${index === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-100'}
            `} 
            tabIndex={0} 
            onMouseEnter={() => onPieEnter(null, index)}
            onMouseLeave={onPieLeave}
            onFocus={() => onPieEnter(null, index)}
            onBlur={onPieLeave}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: COLORS[index] }} 
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <span className="font-medium text-black">{Number(item.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data, categoryName, selectedUnit }) => {
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
    <div className="pl-6 pr-10 py-6 space-y-4 min-h-auto">
      {sortedData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-right text-gray-600 truncate">{item.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-7">
            <div
              className="bg-[#3FA170]/90 h-7 rounded-full flex items-center justify-end px-4 text-white font-semibold"
              style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
            >
              {item.value.toLocaleString()}
              <span className="ml-1">{selectedUnit}</span>
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

  // คำนวณค่า max สำหรับ Y-axis
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.นำเข้า || 0, d.เบิกจ่าย || 0)),
    10
  );
  const yAxisMax = Math.ceil(maxValue * 1.2 / 10) * 10;

  return (
    <div className="w-full h-80 pt-4 pr-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={8}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={8}
            domain={[0, yAxisMax]}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '0.5rem',
              padding: '8px 12px'
            }}
            formatter={(value, name) => [value.toLocaleString(), name]}
            labelStyle={{ fontWeight: 'semibold', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="นำเข้า" 
            stroke="#3FA170" 
            strokeWidth={2.5} 
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} 
            dot={{ r: 3, fill: '#3FA170', strokeWidth: 0 }}
            name="นำเข้า"
          />
          <Line 
            type="monotone" 
            dataKey="เบิกจ่าย" 
            stroke="#EF4444" 
            strokeWidth={2.5} 
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} 
            dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
            name="เบิกจ่าย"
          />
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

  const [allCategories, setAllCategories] = useState([]);
  const [allMonthOptions, setAllMonthOptions] = useState([]);
  const [allUnitOptions, setAllUnitOptions] = useState([]);
  const [allInventoryData, setAllInventoryData] = useState([]);

  const [stockByUnitAll, setStockByUnitAll] = useState([]);

  // โหลดข้อมูลเริ่มต้น (categories, months, units, inventory)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [monthRes, categoryRes, invRes] = await Promise.all([
          fetch('/api/statistics/filters'),
          fetch('/api/categories'),
          fetch('/api/inventory'),
        ]);
        
        if (!monthRes.ok || !categoryRes.ok) throw new Error('ไม่สามารถโหลดข้อมูลตัวกรองได้');

        const monthData = await monthRes.json();
        const rawCategoryData = await categoryRes.json();
        const invData = invRes.ok ? await invRes.json() : [];

        const formattedCategories = [
          { name: 'ทั้งหมด' },
          ...rawCategoryData.map((c) => ({ name: c.category_name || c.name })),
        ];

        setAllCategories(formattedCategories);
        setAllMonthOptions(monthData.availableMonths || []);
        setAllInventoryData(invData);

        // สร้าง unit options จาก inventory
        const unitSet = new Set();
        invData.forEach(row => {
          const unitName = row.unit?.unit_name || row.unit_name;
          if (unitName) unitSet.add(unitName);
        });
        const units = [{ name: 'ทั้งหมด' }, ...Array.from(unitSet).sort((a, b) => a.localeCompare(b, 'th')).map(u => ({ name: u }))];
        setAllUnitOptions(units);

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
    fetchInitialData();
  }, []);

  // คำนวณ filtered unit options ตามหมวดหมู่ที่เลือก
  const filteredUnitOptions = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') return allUnitOptions;

    // กรองเฉพาะหน่วยที่มีในหมวดหมู่ที่เลือก
    const unitSet = new Set();
    allInventoryData.forEach(row => {
      const catName = row.ingredient?.category?.category_name || row.category_name;
      const unitName = row.unit?.unit_name || row.unit_name;
      if (catName === selectedCategory && unitName) {
        unitSet.add(unitName);
      }
    });

    if (unitSet.size === 0) return [{ name: 'ทั้งหมด' }];
    return [{ name: 'ทั้งหมด' }, ...Array.from(unitSet).sort((a, b) => a.localeCompare(b, 'th')).map(u => ({ name: u }))];
  }, [selectedCategory, allUnitOptions, allInventoryData]);

  // Reset unit เมื่อเปลี่ยนหมวดหมู่และหน่วยที่เลือกไม่มีในตัวเลือกใหม่
  useEffect(() => {
    const availableUnits = filteredUnitOptions.map(u => u.name);
    if (!availableUnits.includes(selectedUnit)) {
      setSelectedUnit('ทั้งหมด');
    }
  }, [selectedCategory, filteredUnitOptions]);

  // คำนวณ stock by unit ตามที่กรอง
  useEffect(() => {
    let filteredInv = allInventoryData;

    // กรณีที่ 1: เลือกหมวดหมู่อย่างเดียว (หน่วยนับ = ทั้งหมด)
    if (selectedCategory !== 'ทั้งหมด' && selectedUnit === 'ทั้งหมด') {
      filteredInv = filteredInv.filter(row => {
        const catName = row.ingredient?.category?.category_name || row.category_name;
        return catName === selectedCategory;
      });
    }
    // กรณีที่ 2: เลือกหน่วยนับอย่างเดียว (หมวดหมู่ = ทั้งหมด)
    else if (selectedCategory === 'ทั้งหมด' && selectedUnit !== 'ทั้งหมด') {
      filteredInv = filteredInv.filter(row => {
        const unitName = row.unit?.unit_name || row.unit_name;
        return unitName === selectedUnit;
      });
    }
    // กรณีที่ 3: เลือกทั้งหมวดหมู่และหน่วยนับ
    else if (selectedCategory !== 'ทั้งหมด' && selectedUnit !== 'ทั้งหมด') {
      filteredInv = filteredInv.filter(row => {
        const catName = row.ingredient?.category?.category_name || row.category_name;
        const unitName = row.unit?.unit_name || row.unit_name;
        return catName === selectedCategory && unitName === selectedUnit;
      });
    }
    // กรณีที่ 4: ไม่เลือกอะไรเลย (ทั้งหมดทั้งคู่) - ใช้ข้อมูลทั้งหมด

    // สรุปยอดตามหน่วย
    const byUnit = Object.values(
      filteredInv.reduce((acc, row) => {
        const unitName = row.unit?.unit_name || row.unit_name || '—';
        const qty = Number(row.quantity || 0);
        if (!acc[unitName]) acc[unitName] = { unit: unitName, qty: 0 };
        acc[unitName].qty += qty;
        return acc;
      }, {})
    ).sort((a, b) => a.unit.localeCompare(b.unit, 'th'));

    setStockByUnitAll(byUnit);
  }, [allInventoryData, selectedCategory, selectedUnit]);

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
        const params = new URLSearchParams({ month, year });
        if (selectedCategory !== 'ทั้งหมด') params.append('category', selectedCategory);
        if (selectedUnit !== 'ทั้งหมด') params.append('unit', selectedUnit);

        const res = await fetch(`/api/statistics?${params.toString()}`);
        if (!res.ok) throw new Error((await res.json()).error || 'เกิดข้อผิดพลาด');
        const data = await res.json();

        const formatted = {
          summary: {
            import: data.summary.importTotal,
            dispense: data.summary.dispenseTotal,
            stock: data.summary.stockTotal,
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
  }, [selectedMonth, selectedCategory, selectedUnit]);

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
    if (selectedUnit === 'ทั้งหมด') return stockByUnitAll;
    const match = stockByUnitAll.find((x) => x.unit === selectedUnit);
    return match ? [match] : [];
  }, [selectedUnit, stockByUnitAll]);

  /* ---------- UI ---------- */
  const renderContent = () => {
    if (isLoading) return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="p-10 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;
    if (!currentData) return <div className="p-10 text-center text-gray-500">ไม่พบข้อมูล</div>;

    return (
      <>
        {/* cards summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ArrowDownToLine size={20} />}
            title="ปริมาณนำเข้า"
            value={(currentData.summary?.import ?? 0).toLocaleString()}
            unit="ล็อต"
            context={`ข้อมูลเดือน ${selectedMonth}`}
          />
          <StatCard
            icon={<ArrowUpFromLine size={20} />}
            title="ปริมาณเบิกจ่าย"
            value={(currentData.summary?.dispense ?? 0).toLocaleString()}
            unit="ล็อต"
            context={`ข้อมูลเดือน ${selectedMonth}`}
          />
          <StockByUnitCard
            list={stockByUnitList}
            selectedUnit={selectedUnit}
            selectedCategory={selectedCategory}
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
                : `วัตถุดิบที่ใช้บ่อยในหมวด "${selectedCategory}"`}
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
          categories={allCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          placeholder="เลือกหมวดหมู่"
          className="md:col-span-1"
        />
        <CustomDropdown
          label="หน่วยนับ"
          categories={filteredUnitOptions}
          selectedCategory={selectedUnit}
          onSelectCategory={setSelectedUnit}
          placeholder="เลือกหน่วยนับ"
          className="md:col-span-1"
        />
        <CustomDropdown
          label="เลือกเดือน"
          categories={allMonthOptions}
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