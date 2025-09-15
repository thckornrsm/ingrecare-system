import React from 'react';
import { Utensils, Beef, Carrot, Apple, Fish, CookingPot, Ellipsis } from 'lucide-react';

function FilterTabs({ activeFilter, setActiveFilter }) {
    const categories = [
        { name: 'ทั้งหมด', icon: <Utensils size={16}/> },
        { name: 'ผัก', icon: <Carrot size={16}/> },
        { name: 'ผลไม้', icon: <Apple size={16}/> },
        { name: 'เนื้อสัตว์', icon: <Beef size={16}/> },
        { name: 'ทะเล', icon: <Fish size={16}/> },
        { name: 'เครื่องปรุง', icon: <CookingPot size={16}/> },
        { name: 'อื่นๆ', icon: <Ellipsis size={16}/> },
    ];

    return (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
            {categories.map(category => (
                <button 
                    key={category.name}
                    onClick={() => setActiveFilter(category.name)}
                    className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-colors ${
                        activeFilter === category.name 
                        ? 'bg-gray-200 text-gray-800 font-semibold' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    {category.icon}
                    {category.name === 'อื่นๆ' ? 'อื่นๆ' : category.name}
                </button>
            ))}
        </div>
    );
}

export default FilterTabs;