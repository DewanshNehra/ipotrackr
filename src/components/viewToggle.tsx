'use client';

import React from 'react';
import { BsGrid3X3Gap, BsTable } from 'react-icons/bs';

interface ViewToggleClientProps {
    view: 'cards' | 'table';
    onViewChange: (view: 'cards' | 'table') => void;
}

export default function ViewToggleClient({ view, onViewChange }: ViewToggleClientProps) {
    return (
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2d2d2d] rounded-lg p-1">
            <button
                onClick={() => onViewChange('cards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    view === 'cards' 
                        ? 'bg-[#00FF7B] text-black' 
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                <BsGrid3X3Gap size={16} />
                <span className="text-sm font-medium">Cards</span>
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    view === 'table' 
                        ? 'bg-[#00FF7B] text-black' 
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                <BsTable size={16} />
                <span className="text-sm font-medium">Table</span>
            </button>
        </div>
    );
}