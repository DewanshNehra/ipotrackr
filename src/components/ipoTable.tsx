'use client';

import React, { useState } from 'react';
import { ProcessedIPOData } from '@/types/ipo';
import { BsCircleFill } from 'react-icons/bs';
import IPODetailModal from './ipoDetailModal';

interface IPOTableProps {
    data: ProcessedIPOData[];
}

export default function IPOTable({ data }: IPOTableProps) {
    const [selectedIPO, setSelectedIPO] = useState<ProcessedIPOData | null>(null);

    const sortedData = React.useMemo(() => {
        const normalizedData = data.map(ipo => {
            let normalizedStatus: 'open' | 'upcoming' | 'pending' | 'listed' = ipo.status;
            
            if (!['open', 'upcoming', 'pending', 'listed'].includes(ipo.status)) {
                normalizedStatus = 'pending';
            }
            
            return {
                ...ipo,
                _normalizedStatus: normalizedStatus
            };
        });
        
        return normalizedData.sort((a, b) => {
            const statusOrder: Record<string, number> = {
                'open': 0,
                'upcoming': 1,
                'pending': 2, 
                'listed': 3
            };
            
            const aOrder = statusOrder[a._normalizedStatus] ?? 99;
            const bOrder = statusOrder[b._normalizedStatus] ?? 99;
            
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            
            if (a.isSME !== b.isSME) {
                return a.isSME ? 1 : -1;
            }
            
            return b.expectedProfit - a.expectedProfit;
        });
    }, [data]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    const formatIPOName = (name: string) => {
        const maxLength = 25;
        const cleanName = name.trim();
        
        if (cleanName.length <= maxLength) {
            return cleanName;
        }
        
        return `${cleanName.substring(0, maxLength).trim()}...`;
    };

    const getStatusIcon = (status: string) => {
        const statusConfig = {
            open: { color: 'text-[#00FF7B]', label: 'Open', bgColor: 'bg-[#00FF7B]/20' },
            upcoming: { color: 'text-blue-400', label: 'Upcoming', bgColor: 'bg-blue-400/20' },
            pending: { color: 'text-[#bd8536]', label: 'Pending', bgColor: 'bg-[#bd8536]/20' },
            listed: { color: 'text-gray-400', label: 'Listed', bgColor: 'bg-gray-400/20' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full  ${config.bgColor}`}>
                <BsCircleFill className={`w-2 h-2 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
        );
    };

    const parseNumericValue = (value: string | number): number => {
        if (typeof value === 'number') return value;
        const numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
        return isNaN(numericValue) ? 0 : numericValue;
    };

    if (data.length === 0) {
        return (
            <div className="bg-[#1A1A1A] border border-[#2d2d2d] rounded-xl p-12 text-center">
                <div className="text-gray-400 mb-4">
                    <BsCircleFill className="w-12 h-12 mx-auto opacity-20 mb-4" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No IPOs Found</h3>
                <p className="text-gray-400">No IPOs match your current filters.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#1A1A1A] border border-[#2d2d2d] rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px]">
                        <thead className="bg-gradient-to-r from-[#2A2A2A] to-[#1F1F1F] border-b border-[#3d3d2d]">
                            <tr>
                                <th className="px-4 py-5 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    IPO Details
                                </th>
                                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-5 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-4 py-5 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    GMP
                                </th>
                                <th className="px-4 py-5 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Est. Listing
                                </th>
                                <th className="px-4 py-5 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Expected Profit
                                </th>
                                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Lot Size
                                </th>
                                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Issue Size
                                </th>
                                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Subscription
                                </th>
                                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                    Bidding Period
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2d2d]">
                            {sortedData.map((ipo, index) => {
                                const isSME = ipo.isSME;
                                const parsedEstListingValue = parseNumericValue(ipo.estListing.split(' ')[0]);
                                const parsedGmpValue = parseNumericValue(ipo.gmpValue);
                                
                                return (
                                    <tr 
                                        key={ipo.id} 
                                        className="hover:bg-[#252525] transition-all duration-200 group cursor-pointer"
                                        style={{
                                            background: index % 2 === 0 ? 'rgba(26, 26, 26, 0.5)' : 'rgba(42, 42, 42, 0.3)'
                                        }}
                                        onClick={() => setSelectedIPO(ipo)}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="font-semibold text-white text-sm group-hover:text-[#00FF7B] transition-colors" title={ipo.ipoName}>
                                                            {formatIPOName(ipo.ipoName)}
                                                        </div>
                                                        {isSME && (
                                                            <span className="bg-gradient-to-r from-[#404040] to-[#505050] text-white text-xs px-2 py-1 rounded-md border border-[#5d5d5d] font-medium">
                                                                SME
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            {getStatusIcon(ipo.status)}
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="  text-base">
                                                ₹{ipo.price}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="space-y-1">
                                                <div className=" text-base">
                                                    ₹{parsedGmpValue.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-300 bg-[#2A2A2A] px-2 py-1 rounded">
                                                    {ipo.gmpPercentage}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="space-y-1">
                                                <div className=" text-base">
                                                    ₹{parsedEstListingValue.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-300 bg-[#2A2A2A] px-2 py-1 rounded">
                                                    {ipo.estListingPercentage}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="text-right">
                                                    <div className={`font-bold text-base ${ipo.expectedProfit >= 0 ? 'text-[#00FF7B]' : 'text-red-400'}`}>
                                                        ₹{Math.abs(ipo.expectedProfit).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {ipo.expectedProfit >= 0 ? 'Profit' : 'Loss'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <div className="bg-[#2A2A2A] px-2 py-1 rounded-lg">
                                                <span className="text-white text-sm font-medium">{ipo.lotSize}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <div className="text-sm text-gray-300">
                                                {ipo.issueSize}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <div className="text-sm text-gray-300 bg-[#2A2A2A] px-2 py-1 rounded">
                                                {ipo.subscriptionStatus}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-[#00FF7B] bg-[#00FF7B]/10 px-2 py-1 rounded">
                                                    {formatDate(ipo.biddingStartDate)}
                                                </div>
                                                <div className="text-xs text-gray-400">to</div>
                                                <div className="text-xs font-medium text-[#FF3F42] bg-red-400/10 px-2 py-1 rounded">
                                                    {formatDate(ipo.biddingEndDate)}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {selectedIPO && (
                <IPODetailModal 
                    ipoId={selectedIPO.id} 
                    onClose={() => setSelectedIPO(null)}
                    ipoData={selectedIPO}
                />
            )}
        </>
    );
}