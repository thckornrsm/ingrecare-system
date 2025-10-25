"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const generatePages = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
}) {
    const pageNumbers = generatePages(currentPage, totalPages);
    const itemsPerPageOptions = [10, 20, 50, 100];

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="w-full flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 mt-4">
            <div className="mb-4 md:mb-0">
                <span>แสดงรายการ </span>
                <span className="text-gray-800">{startItem}-{endItem}</span>
                <span> จาก </span>
                <span className="text-gray-800">{totalItems}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {pageNumbers.map((page, index) =>
                        typeof page === 'number' ? (
                            <button
                                key={`${page}-${index}`}
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    currentPage === page ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
                        )
                    )}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;