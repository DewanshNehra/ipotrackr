'use client';

import React from 'react';
import { BsSearch, BsToggleOff, BsToggleOn } from 'react-icons/bs';

interface FilterControlsClientProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showSME: boolean;
    onSMEToggle: (value: boolean) => void;
}

export default function FilterControlsClient({ 
    searchTerm, 
    onSearchChange, 
    showSME, 
    onSMEToggle 
}: FilterControlsClientProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search IPOs..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-[#2d2d2d] rounded-lg bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7B] focus:border-transparent"
                />
            </div>

            {/* SME Toggle */}
            <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Show SME IPOs:</span>
                <button
                    onClick={() => onSMEToggle(!showSME)}
                    className={`transition-colors ${showSME ? 'text-[#00FF7B]' : 'text-gray-400'}`}
                >
                    {showSME ? <BsToggleOn size={24} /> : <BsToggleOff size={24} />}
                </button>
                <span className={`text-sm ${showSME ? 'text-[#00FF7B]' : 'text-gray-400'}`}>
                    {showSME ? 'Enabled' : 'Disabled'}
                </span>
            </div>
        </div>
    );
}