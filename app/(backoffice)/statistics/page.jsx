'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FilterTabs from '@/components/FilterTabs';

// Example Mock Data for Donut Chart
const donutChartData = [
    { name: 'ทะเล', value: 30, color: 'bg-sky-300', strokeColor: 'text-sky-300' },
    { name: 'ผัก', value: 15, color: 'bg-green-300', strokeColor: 'text-green-300' },
    { name: 'ผลไม้', value: 13, color: 'bg-violet-300', strokeColor: 'text-violet-300' },
    { name: 'เครื่องปรุง', value: 20, color: 'bg-yellow-300', strokeColor: 'text-yellow-300' },
    { name: 'เนื้อสัตว์', value: 14, color: 'bg-red-400', strokeColor: 'text-red-400' },
    { name: 'อื่นๆ', value: 6, color: 'bg-gray-300', strokeColor: 'text-gray-300' },
];

// Example Mock Data for Bar Chart
const barChartData = {
    'ผัก': [
        { name: 'ผักกาด', value: 35 }, { name: 'ผักกวางตุ้ง', value: 70 },
        { name: 'แครอท', value: 28 }, { name: 'หัวหอม', value: 62 },
        { name: 'ฟักทอง', value: 44 }, { name: 'กะหล่ำปลี', value: 78 },
        { name: 'ข้าวโพดอ่อน', value: 72 }
    ],
    'ผลไม้': [
        { name: 'แอปเปิ้ล', value: 60 }, { name: 'กล้วย', value: 80 }, 
        { name: 'ส้ม', value: 45 }, { name: 'มะม่วง', value: 75 }
    ],
    'เนื้อสัตว์': [
        { name: 'เนื้อวัว', value: 85 }, { name: 'เนื้อหมู', value: 90 }, 
        { name: 'ไก่', value: 70 }, { name: 'เป็ด', value: 50 }
    ],
    'ทะเล': [
        { name: 'กุ้ง', value: 75 }, { name: 'ปลาหมึก', value: 65 }, 
        { name: 'ปลาแซลมอน', value: 88 }, { name: 'หอย', value: 40 }
    ],
    'เครื่องปรุง': [
        { name: 'น้ำปลา', value: 95 }, { name: 'น้ำตาล', value: 85 }, 
        { name: 'ซอสพริก', value: 70 }, { name: 'น้ำมันหอย', value: 80 }
    ],
    'อื่นๆ': [
        { name: 'ไข่ไก่', value: 90 }, { name: 'เต้าหู้', value: 60 }, 
        { name: 'วุ้นเส้น', value: 70 }
    ],
};

// DonutChart Component *In Main Page*
const DonutChart = () => {
  const [hovered, setHovered] = useState(null);
  const totalValue = donutChartData.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-15 p-4 relative">
      <div className="relative w-78 h-78">
        <svg className="w-full h-full transform rotate-90" viewBox="0 0 36 36">
          {donutChartData.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const dashArray = `${percentage} ${100 - percentage}`;
            const dashOffset = -cumulativePercentage;
            cumulativePercentage += percentage;
            return (
              <circle
                key={index}
                cx="18" cy="18" r="14"
                className={`stroke-current ${item.strokeColor} cursor-pointer transition-opacity duration-200`}
                strokeWidth="8"
                fill="none"
                pathLength="100"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                // Hover Effects
                onMouseEnter={() => setHovered(item.name)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  opacity: hovered && hovered !== item.name ? 0.4 : 1,
                }}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                          bg-white shadow-lg rounded-md px-3 py-2 text-sm font-medium text-center">
            <span className="block">{hovered}</span>
            <span className="block text-gray-600">
              {donutChartData.find(d => d.name === hovered)?.value}%
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4">
        {donutChartData.map(item => (
          <div key={item.name} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-sm ${item.color}`}></div>
            <span className="text-gray-700">{item.name}</span>
            <span className="font-semibold text-gray-800 ml-auto">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// BarChart Component
const BarChart = ({ data, categoryName }) => {
    const barColors = [
        'bg-sky-300', 
        'bg-emerald-300', 
        'bg-violet-300', 
        'bg-amber-300', 
        'bg-red-300', 
        'bg-pink-300', 
        'bg-indigo-300'
    ];

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                แผนภูมิแท่งแสดงสัดส่วนการใช้วัตถุดิบประเภท "{categoryName}"
            </h2>
            <div className="w-full h-78 flex gap-4 items-end border-l border-b border-gray-300 px-4 pt-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                        <div 
                            className={`w-full ${barColors[index % barColors.length]} rounded-t-md`}
                            style={{ height: `${item.value}%` }}
                        ></div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* Main Statistics Page */
export default function StatisticsPage() {
    const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
    return (
        <div className="flex h-screen bg-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto py-9 px-25">
                    <div className="mb-8">
                        <h1 className="text-black text-3xl font-bold">สถิติการใช้งาน</h1>
                        <p className="text-[#979999]">สถิติการใช้งานเพื่อใช้ประกอบการตัดสินใจ</p>
                    </div>

                    <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                    <div className="bg-[#F6F8FA] p-9 rounded-lg border-1 border-[#E5E5E5]">
                        <div className="bg-white p-6 rounded-lg">
                            {activeFilter === 'ทั้งหมด' ? (
                            <>
                                <h2 className="text-lg font-semibold text-black mb-2 text-center">
                                    แผนภูมิวงกลมสัดส่วนการใช้วัตถุดิบตามประเภท
                                </h2>
                                <DonutChart />
                            </>
                        ) : (
                            <BarChart 
                                data={barChartData[activeFilter] || []} 
                                categoryName={activeFilter}
                            />
                        )}
                        </div>
                    </div>  
                </main>
            </div>
        </div>
    );
}
