// components/ToastNotification.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

function ToastNotification({ message, type, onClose }) {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-lg border-l-4 shadow-lg ${bgColor} ${borderColor} animate-fade-in-right`}>
            <Icon className={textColor} />
            <div className={`ml-3 text-sm font-medium ${textColor}`}>
                {message}
            </div>
            <button onClick={onClose} className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex h-8 w-8 ${textColor} hover:bg-opacity-20`}>
                <X size={20} />
            </button>
        </div>
    );
}

export default ToastNotification;