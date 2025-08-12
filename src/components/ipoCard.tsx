import React, { useState } from 'react';
import { ProcessedIPOData } from '@/types/ipo';
import IPODetailModal from './ipoDetailModal';

export default function IPOCard(props: ProcessedIPOData) {
    const [showModal, setShowModal] = useState(false);
    const {
        id,
        ipoName,
        subscriptionStatus,
        status,
        expectedProfit,
        price,
        issueSize,
        lotSize,
        estListing,
        gmpValue,
        gmpPercentage,
        biddingStartDate,
        biddingEndDate,
    } = props;
    
    const isSME = ipoName.toLowerCase().includes('sme');
    
    const formatIPOName = (name: string) => {
        const maxLength = 20;
        const cleanName = name.replace(/\s*(NSE\s*)?SME\s*/gi, '').trim();
        
        if (cleanName.length <= maxLength) {
            return cleanName;
        }
        
        return `${cleanName.substring(0, maxLength).trim()}...`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    const parseNumericValue = (value: string | number): number => {
        if (typeof value === 'number') return value;
        const numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
        return isNaN(numericValue) ? 0 : numericValue;
    };

    const parsedGmpValue = parseNumericValue(gmpValue);
    const parsedEstListingValue = parseNumericValue(estListing.split(' ')[0]);
    const formatExpectedProfit = (profit: number): string => {
        const absProfit = Math.abs(profit);
        return profit >= 0 ? absProfit.toLocaleString() : `-${absProfit.toLocaleString()}`;
    };

    return (
        <>
            <article 
                className="bg-[#1A1A1A] backdrop-blur-[1px] border border-[#2d2d2d] rounded-xl p-6 w-full max-w-md cursor-pointer hover:border-[#00FF7B]/40 hover:shadow-lg hover:shadow-[#00FF7B]/10 transition-all"
                onClick={() => setShowModal(true)}
                itemScope
                itemType="https://schema.org/FinancialProduct"
            >
                <meta itemProp="name" content={`${ipoName} IPO`} />
                <meta itemProp="category" content="IPO" />
                <meta itemProp="description" content={`${ipoName} IPO with GMP ₹${gmpValue} and ${status} status`} />
                
                {isSME && (
                    <div className='w-full -mt-12 mb-2 flex justify-end h-6'>
                        <div className="w-fit bg-[#404040] text-white text-xs px-2 py-1 rounded border border-[#5d5d5d]">
                            SME
                        </div>
                    </div>
                )}
                <header className='flex justify-between items-center gap-2 mb-4'>
                    <div className='flex justify-center items-center gap-2'>
                        <h3 className="text-[16px] md:text-[18px] lg:text-[20px]" itemProp="name">
                            {formatIPOName(ipoName)} IPO
                        </h3>
                        <span className='text-sm text-[#5D5D5D]' itemProp="offers" itemScope itemType="https://schema.org/Offer">
                            <meta itemProp="availability" content={`https://schema.org/${status === 'open' ? 'InStock' : 'OutOfStock'}`} />
                            {subscriptionStatus}
                        </span>
                        <div
                            className={`size-2 rounded-full ${
                                status === 'open' ? 'bg-[#00FF7B]' :
                                status === 'upcoming' ? 'bg-gray-400' :
                                status === 'pending' ? 'bg-[#bd8536]' :
                                'bg-[#404040]'
                            }`}
                            title={`IPO Status: ${status}`}
                        />
                    </div>
                    <div className='text-[#00FF7B]' itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="price" content={expectedProfit.toString()} />
                        <meta itemProp="priceCurrency" content="INR" />
                        <span>₹</span>{formatExpectedProfit(expectedProfit)}
                    </div>
                </header>
                <div className='w-full flex flex-col items-center gap-2 text-[12px] md:text-[14px] lg:text-[16px]'>
                    <div className='w-11/12 flex flex-row justify-between'>
                        <div>
                            <span className='text-[#5D5D5D]'>Price: </span>
                            <span className='text-[#00FF7B]'>₹{price}</span>
                        </div>
                        <div>
                            <span className='text-[#5D5D5D]'>Issue Size: </span>
                            <span>{issueSize}</span>
                        </div>
                    </div>
                    <div className='w-11/12 flex flex-row justify-between'>
                        <div>
                            <span className='text-[#5D5D5D]'>Lot Size: </span>
                            <span>{lotSize}</span>
                        </div>
                        <div>
                            <span className='text-[#5D5D5D]'>Est. Listing: </span>
                            <span className='text-[#00FF7B]'>₹{parsedEstListingValue}</span>
                            <span className='text-white'> ({gmpPercentage})</span>
                        </div>
                    </div>
                    <div className='w-11/12 flex flex-row justify-between'>
                        <div>               
                            <span className='text-[#5D5D5D]'>GMP: </span>
                            <span className='text-[#00FF7B]'>₹{parsedGmpValue}</span>
                            <span className='text-white'> ({gmpPercentage})</span>
                        </div>
                        <div>
                            <span className='text-[#5D5D5D]'>Bidding: </span>
                            {isNaN(new Date(biddingStartDate).getTime()) ? (
                                <span className='text-[#FF3F42]'>Not Updated</span>
                            ) : (
                                <>
                                    <span className='text-[#00FF7B]'>{formatDate(biddingStartDate)}</span>
                                    <span className='text-white'> - </span>
                                    <span className='text-[#FF3F42]'>{formatDate(biddingEndDate)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </article>
            
            {showModal && (
                <IPODetailModal 
                    ipoId={id} 
                    onClose={() => setShowModal(false)}
                    ipoData={props}
                />
            )}
        </>
    );
}