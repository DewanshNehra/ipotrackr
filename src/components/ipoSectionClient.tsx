'use client';

import React, { useState, useMemo } from 'react';
import IPOCard from './ipoCard';
import IPOTable from './ipoTable';
import ViewToggle from './viewToggle';
import FilterControls from './filterControls';
import { ProcessedIPOData } from '@/types/ipo';

interface IPOSectionClientProps {
    initialData: ProcessedIPOData[];
}

export default function IPOSectionClient({ initialData }: IPOSectionClientProps) {
    const [view, setView] = useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSME, setShowSME] = useState(true);

    const filteredData = useMemo(() => {
        let result = initialData;

        if (!showSME) {
            result = result.filter(ipo => !ipo.isSME);
        }

        if (searchTerm.trim()) {
            result = result.filter(ipo => 
                ipo.ipoName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return result;
    }, [initialData, showSME, searchTerm]);

    const sortedTableData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const statusPriority = { open: 0, upcoming: 1, listed: 2, pending: 3 };
            const aPriority = statusPriority[a.status] || 99;
            const bPriority = statusPriority[b.status] || 99;
            
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            
            return b.expectedProfit - a.expectedProfit;
        });
    }, [filteredData]);

    const categorizedIPOs = useMemo(() => {
        const sortByProfit = (ipos: ProcessedIPOData[]) => {
            return [...ipos].sort((a, b) => {
                if (a.isSME && !b.isSME) return 1;
                if (!a.isSME && b.isSME) return -1;
                
                
                return b.expectedProfit - a.expectedProfit;
            });
        };

        return {
            open: sortByProfit(filteredData.filter(ipo => ipo.status === 'open')),
            upcoming: sortByProfit(filteredData.filter(ipo => ipo.status === 'upcoming')),
            listed: sortByProfit(filteredData.filter(ipo => ipo.status === 'listed')),
            pending: sortByProfit(filteredData.filter(ipo => ipo.status === 'pending'))
        };
    }, [filteredData]);

    const categoryConfig = {
        open: {
            title: 'Open for Bidding',
            color: 'text-[#00FF7B]',
            bgColor: 'bg-[#00FF7B]/10',
            borderColor: 'border-[#00FF7B]/20',
        },
        upcoming: {
            title: 'Upcoming IPOs',
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            borderColor: 'border-blue-400/20',
        },
        pending: {
            title: 'Allotment Pending',
            color: 'text-[#bd8536]',
            bgColor: 'bg-[#bd8536]/10',
            borderColor: 'border-[#bd8536]/20',
        },
        listed: {
            title: 'Recently Listed',
            color: 'text-gray-400',
            bgColor: 'bg-gray-400/10',
            borderColor: 'border-gray-400/20',
        }
    };

    const renderCategory = (status: keyof typeof categorizedIPOs, ipos: ProcessedIPOData[]) => {
        if (ipos.length === 0) return null;

        const config = categoryConfig[status];

        const sortedIPOs = [...ipos].sort((a, b) => {
            if (a.isSME && !b.isSME) return 1;
            if (!a.isSME && b.isSME) return -1;
            
            return 0;
        });

        return (
            <div key={status} className="mb-16">
                <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-6 mb-8`}>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-2xl font-bold ${config.color}`}>
                            {config.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                            {ipos.length} IPO{ipos.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className='grid justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 grid-y-16'>
                    {sortedIPOs.map((ipo) => (
                        <IPOCard key={ipo.id} {...ipo} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
          {/* SEO-optimized structured data for IPO list */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Live IPO GMP Tracker List",
                "description": "Complete list of IPOs with live GMP data and subscription status",
                "numberOfItems": filteredData.length,
                "itemListElement": filteredData.slice(0, 20).map((ipo, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "FinancialProduct",
                    "name": `${ipo.ipoName} IPO`,
                    "description": `${ipo.ipoName} IPO with GMP ₹${ipo.gmpValue} and expected profit ₹${ipo.expectedProfit}`,
                    "category": "IPO",
                    "offers": {
                      "@type": "Offer",
                      "price": ipo.price,
                      "priceCurrency": "INR"
                    }
                  }
                }))
              })
            }}
          />

          <div className='px-[5%] mx-auto'>
            {/* SEO-optimized content structure */}
            <header className="text-center mb-16">
                <h1 className='text-4xl font-bold text-white mb-4'>
                    Live IPO GMP Tracker Dashboard - Real-time Grey Market Premium
                </h1>
                <p className="text-gray-400 text-lg">
                    Track live IPO GMPs, subscription status, and investment opportunities for {filteredData.length} IPOs. 
                    Updated every 10 minutes with accurate grey market premium data.
                </p>
                
                {/* SEO-friendly summary stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2d2d2d]">
                    <div className="text-2xl font-bold text-[#00FF7B]">{categorizedIPOs.open.length}</div>
                    <div className="text-sm text-gray-400">Open IPOs</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2d2d2d]">
                    <div className="text-2xl font-bold text-blue-400">{categorizedIPOs.upcoming.length}</div>
                    <div className="text-sm text-gray-400">Upcoming</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2d2d2d]">
                    <div className="text-2xl font-bold text-[#bd8536]">{categorizedIPOs.pending.length}</div>
                    <div className="text-sm text-gray-400">Pending</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2d2d2d]">
                    <div className="text-2xl font-bold text-gray-400">{categorizedIPOs.listed.length}</div>
                    <div className="text-sm text-gray-400">Listed</div>
                  </div>
                </div>
            </header>

            {/* View Toggle and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12">
                <ViewToggle view={view} onViewChange={setView} />
                <div className="flex-1 max-w-2xl">
                    <FilterControls 
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showSME={showSME}
                        onSMEToggle={setShowSME}
                    />
                </div>
            </div>

            {/* Content based on view */}
            {view === 'table' ? (
                <section aria-label="IPO Data Table">
                    <IPOTable data={sortedTableData} />
                </section>
            ) : (
                <>
                    {renderCategory('open', categorizedIPOs.open)}
                    {renderCategory('upcoming', categorizedIPOs.upcoming)}
                    {renderCategory('listed', categorizedIPOs.listed)}
                    {renderCategory('pending', categorizedIPOs.pending)}
                </>
            )}

            {/* SEO-friendly content section */}
            <section className="mt-16 bg-[#1A1A1A] border border-[#2d2d2d] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About IPO GMP Tracking</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-[#00FF7B] mb-2">What is IPO GMP?</h3>
                  <p className="text-sm leading-relaxed">
                    IPO Grey Market Premium (GMP) is the price difference between the IPO issue price and 
                    the grey market trading price. It indicates market sentiment and potential listing gains.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#00FF7B] mb-2">Live Data Updates</h3>
                  <p className="text-sm leading-relaxed">
                    Our IPO tracker provides real-time GMP data, subscription status, and detailed analysis 
                    updated every 10 minutes to help you make informed investment decisions.
                  </p>
                </div>
              </div>
            </section>

            {/* Show message if no results */}
            {filteredData.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">
                        No IPOs match your current filters.
                    </p>
                    {searchTerm && (
                        <p className="text-gray-500 text-sm mt-2">
                            Try adjusting your search term or filters.
                        </p>
                    )}
                </div>
            )}
        </div>
        </>
    );
}