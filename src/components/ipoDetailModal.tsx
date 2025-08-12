'use client';

import React, { useEffect, useState } from 'react';
import { ProcessedIPOData, GmpHistoryItem, ProcessedSubscriptionData, IPOActivityDates } from '@/types/ipo';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TooltipItem } from 'chart.js';
import { BsXLg, BsArrowUp, BsArrowDown, BsBarChart } from 'react-icons/bs';
import { fetchIPOGmpData, fetchIPOSubscriptionData, fetchIPOActivityDates } from '@/lib/api';
import { createChartData, formatDateFull, computeActivityProgress, isMilestoneDone } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface IPODetailModalProps {
  ipoId: number;
  onClose: () => void;
  ipoData: ProcessedIPOData;
}

export default function IPODetailModal({ ipoId, onClose, ipoData }: IPODetailModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmpHistory, setGmpHistory] = useState<GmpHistoryItem[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<ProcessedSubscriptionData | null>(null);
  const [activityDates, setActivityDates] = useState<IPOActivityDates | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [gmpData, subData] = await Promise.all([
          fetchIPOGmpData(ipoId),
          fetchIPOSubscriptionData(ipoId)
        ]);
        
        setGmpHistory(gmpData);
        setSubscriptionData(subData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [ipoId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!ipoData?.detailsUrl) return;
        const parsed = await fetchIPOActivityDates(ipoData.detailsUrl);
        if (!cancelled && parsed) setActivityDates(parsed);
      } catch (e) {

        console.warn('Activity dates parse failed:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [ipoData?.detailsUrl]);

  const chartData = createChartData(gmpHistory);
  const tableData = [...gmpHistory].reverse();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          font: {
            family: 'var(--font-space-grotesk)',
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#2d2d2d',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const dataIndex = context.dataIndex;
            
            return [
              `GMP: ₹${gmpHistory[dataIndex]?.gmp || 0}`,
              `Estimated Profit: ${gmpHistory[dataIndex]?.estimatedProfit || '₹0'}`,
              `Percentage: ${gmpHistory[dataIndex]?.percentage || '0%'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: { family: 'var(--font-space-grotesk)' }
        },
        grid: { display: false },
        border: { color: '#2d2d2d' }
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: { family: 'var(--font-space-grotesk)' },
          callback: function(value: string | number) { return '₹' + value; }
        },
        grid: { color: 'rgba(45, 45, 45, 0.5)', tickLength: 0 },
        border: { color: '#2d2d2d' }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);
  
  const rawActivityItems = [
    { key: 'open', label: 'IPO Open', date: activityDates?.biddingStartDate || ipoData.biddingStartDate },
    { key: 'close', label: 'IPO Close', date: activityDates?.biddingEndDate || ipoData.biddingEndDate },
    { key: 'boa', label: 'Basis of Allotment', date: activityDates?.basisOfAllotmentDate || ipoData.basisOfAllotmentDate },
    { key: 'refunds', label: 'Refunds Initiation', date: activityDates?.refundsInitiationDate || undefined },
    { key: 'credit', label: 'Credit to Demat', date: activityDates?.creditToDematDate || undefined },
    { key: 'listing', label: 'IPO Listing', date: activityDates?.listingDate || ipoData.listingDate },
  ];

  const activityItems = rawActivityItems.filter(i => !!i.date);

  // Progress based on visible items with continuous interpolation (IST-aware)
  const progressPercent = activityItems.length > 1
    ? computeActivityProgress(activityItems)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1A1A] border border-[#2d2d2d] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-scrollbar" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="text-xl font-semibold">{ipoData.ipoName} - Details & Analysis</h2>
          <div className="flex items-center gap-3">
            <a 
              href={ipoData.detailsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-[#00FF7B] border border-[#00FF7B] hover:bg-[#00FF7B] hover:text-black transition-colors px-4 py-1 rounded-md"
            >
              More Details
            </a>
            <button onClick={onClose} className="p-2 hover:bg-[#252525] rounded-full transition-colors">
              <BsXLg className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Modal content */}
        <div className="p-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Current GMP */}
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Current GMP</div>
              <div className="text-2xl font-bold text-[#00FF7B]">₹{ipoData.gmpValue}</div>
              <div className="text-sm">{ipoData.gmpPercentage} of issue price</div>
            </div>
            {/* Issue Price */}
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Issue Price</div>
              <div className="text-2xl font-bold">₹{ipoData.price}</div>
              <div className="text-sm">Lot Size: {ipoData.lotSize}</div>
            </div>
            {/* Expected Profit */}
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Expected Profit</div>
              <div className={`text-2xl font-bold ${ipoData.expectedProfit >= 0 ? 'text-[#00FF7B]' : 'text-red-400'}`}>
                ₹{Math.abs(ipoData.expectedProfit).toLocaleString()}
              </div>
              <div className="text-sm">Per lot</div>
            </div>
            {/* Total Subscription */}
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Total Subscription</div>
              {subscriptionData ? (
                <>
                  <div className="text-2xl font-bold text-[#00FF7B]">{subscriptionData.total}</div>
                  <div className="text-sm">Overall demand</div>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-500">--</div>
              )}
            </div>
          </div>

          {/* Subscription breakdown (unchanged) */}
          {subscriptionData && (
            <div className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
              <div className="flex items-center gap-2 mb-4">
                <BsBarChart className="text-[#00FF7B]" />
                <h3 className="text-lg font-medium text-white">Live Subscription Status</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d]">
                  <div className="text-gray-400 text-sm">QIB</div>
                  <div className="text-xl font-bold text-blue-400">{subscriptionData.qib}</div>
                  <div className="text-xs text-gray-500">Institutional</div>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d]">
                  <div className="text-gray-400 text-sm">NII</div>
                  <div className="text-xl font-bold text-purple-400">{subscriptionData.nii}</div>
                  <div className="text-xs text-gray-500">Non-Institutional</div>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d]">
                  <div className="text-gray-400 text-sm">RII</div>
                  <div className="text-xl font-bold text-orange-400">{subscriptionData.rii}</div>
                  <div className="text-xs text-gray-500">Retail</div>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d]">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-xl font-bold text-[#00FF7B]">{subscriptionData.total}</div>
                  <div className="text-xs text-gray-500">Overall</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Last updated: {subscriptionData.lastUpdated}
              </div>
            </div>
          )}

          {/* IPO Activity */}
          {activityItems.length >= 2 && (
            <section className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
              <h3 className="text-lg font-medium text-white mb-4">IPO Activity</h3>

              <div className="overflow-x-auto md:overflow-x-visible">
                <div
                  className="flex flex-col gap-4 w-full md:w-auto px-1"
                  style={{ minWidth: `${Math.max(activityItems.length, 6) * 140}px` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    {activityItems.map((item) => {
                      const done = isMilestoneDone(item);
                      return (
                        <div key={item.key} className="flex-1 flex flex-col items-center min-w-0">
                          <div className={`w-3 h-3 rounded-full ${done ? 'bg-[#00FF7B]' : 'bg-[#2d2d2d]'}`} />
                          <div className="mt-2 text-center">
                            <div className="text-xs text-gray-300 truncate max-w-[120px]">{item.label}</div>
                            <div className="text-[10px] text-gray-400">{formatDateFull(item.date)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-11/12 h-1 bg-[#2d2d2d] rounded">
                    <div
                      className="h-1 bg-[#00FF7B] rounded transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                      aria-label="IPO activity progress"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Chart*/}
          <div className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
            <h3 className="text-lg font-medium mb-4 text-white">GMP Trend Analysis</h3>
            {isLoading ? (
              <div className="h-64 md:h-[420px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF7B]"></div>
              </div>
            ) : error ? (
              <div className="h-64 md:h-[420px] flex items-center justify-center text-center">
                <div>
                  <div className="text-red-400 mb-2">Error loading data</div>
                  <div className="text-gray-400 text-sm">{error}</div>
                </div>
              </div>
            ) : gmpHistory.length === 0 ? (
              <div className="h-64 md:h-[420px] flex items-center justify-center">
                <div className="text-gray-400">No GMP history available</div>
              </div>
            ) : (
              <div className="h-64 md:h-[420px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* GMP history table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#2A2A2A] to-[#1F1F1F] border-y border-[#3d3d3d]">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">IPO Price</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">GMP</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Movement</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">Est. Listing</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">Est. Profit</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d2d]">
                {isLoading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="py-8 text-center text-red-400">{error}</td></tr>
                ) : tableData.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No history data available</td></tr>
                ) : (
                  tableData.map((item, index) => (
                    <tr key={index} className="hover:bg-[#252525] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">{item.date}</td>
                      <td className="py-3 px-4 text-right">{item.price}</td>
                      <td className="py-3 px-4 text-right text-[#00FF7B] font-medium">₹{item.gmp}</td>
                      <td className="py-3 px-4 flex justify-center">
                        {item.movement === 'up' ? (
                          <div className="bg-[#00FF7B]/20 p-1 rounded-full">
                            <BsArrowUp className="w-3 h-3 text-[#00FF7B]" />
                          </div>
                        ) : item.movement === 'down' ? (
                          <div className="bg-red-400/20 p-1 rounded-full">
                            <BsArrowDown className="w-3 h-3 text-red-400" />
                          </div>
                        ) : (
                          <div className="bg-gray-400/20 p-1 rounded-full">
                            <div className="w-3 h-[2px] bg-gray-400"></div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">₹{item.estimatedListing} <span className="text-xs text-gray-400">({item.percentage})</span></td>
                      <td className="py-3 px-4 text-right text-[#00FF7B]">{item.estimatedProfit}</td>
                      <td className="py-3 px-4 text-right text-gray-400 text-sm">{item.lastUpdated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
