'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ProcessedIPOData, GmpHistoryItem, ProcessedSubscriptionData, IPOActivityDates, SubscriptionHistoryItem } from '@/types/ipo';
import { BsXLg, BsArrowUp, BsArrowDown, BsBarChart } from 'react-icons/bs';
import { fetchIPOGmpData, fetchIPOSubscriptionData, fetchIPOSubscriptionHistory, fetchIPOActivityDates } from '@/lib/api';
import { formatDateFull, computeActivityProgress, isMilestoneDone } from '@/lib/utils';
import { LineChart } from '@/components/charts/line-chart';
import { Line } from '@/components/charts/line';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip } from '@/components/charts/tooltip';
import { AreaChart } from '@/components/charts/area-chart';
import { Area } from '@/components/charts/area';
import { YAxisLabels } from '@/components/charts/y-axis-labels';
import SubscriptionGauge from './subscription-gauge';

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
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [activityDates, setActivityDates] = useState<IPOActivityDates | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [gmpData, subData, subHistory] = await Promise.all([
          fetchIPOGmpData(ipoId),
          fetchIPOSubscriptionData(ipoId),
          fetchIPOSubscriptionHistory(ipoId)
        ]);

        setGmpHistory(gmpData);
        setSubscriptionData(subData);
        setSubscriptionHistory(subHistory);
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

  const tableData = [...gmpHistory].reverse();

  const areaChartData = useMemo(() => {
    return gmpHistory.map((item, index) => ({
      date: new Date(2026, 0, index + 1),
      gmp: item.gmp,
      estListing: item.estimatedListing,
      ipoPrice: ipoData.price,
    }));
  }, [gmpHistory, ipoData.price]);

  const stackedSubscriptionData = useMemo(() => {
    return subscriptionHistory.map((item, index) => ({
      date: new Date(2026, 0, index + 1),
      qibCum: item.qib,
      niiCum: item.qib + item.nii,
      riiCum: item.qib + item.nii + item.rii,
    }));
  }, [subscriptionHistory]);

  const gmpColor = ipoData.expectedProfit >= 0 ? '#00FF7B' : '#FF3F42';

  // Listed-IPO performance: GMP prediction vs the actual listing outcome.
  const listingPerf = useMemo(() => {
    if (ipoData.status !== 'listed') return null;
    const issue = ipoData.price;
    const actual = activityDates?.listingPrice;
    if (!issue || issue <= 0 || !actual || actual <= 0) return null;

    const estListing = ipoData.estListingValue > 0 ? ipoData.estListingValue : issue;
    const actualGainPct = ((actual - issue) / issue) * 100;
    const estGainPct = ((estListing - issue) / issue) * 100;

    // How the GMP-implied estimate compared to reality (±2% = "on the money").
    const diff = estListing > 0 ? (actual - estListing) / estListing : 0;
    let verdict: { label: string; color: string };
    if (diff >= 0.02) verdict = { label: 'GMP was conservative — listed higher', color: '#00FF7B' };
    else if (diff <= -0.02) verdict = { label: 'GMP was optimistic — listed lower', color: '#FF3F42' };
    else verdict = { label: 'GMP called it — close to estimate', color: '#3b82f6' };

    return { issue, estListing, actual, actualGainPct, estGainPct, verdict };
  }, [ipoData.status, ipoData.price, ipoData.estListingValue, activityDates?.listingPrice]);

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
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Current GMP</div>
              <div className="text-2xl font-bold text-[#00FF7B]">₹{ipoData.gmpValue}</div>
              <div className="text-sm">{ipoData.gmpPercentage} of issue price</div>
            </div>
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Issue Price</div>
              <div className="text-2xl font-bold">₹{ipoData.price}</div>
              <div className="text-sm">Lot Size: {ipoData.lotSize}</div>
            </div>
            <div className="bg-[#252525] p-4 rounded-lg border border-[#2d2d2d]">
              <div className="text-gray-400 text-sm mb-1">Expected Profit</div>
              <div className={`text-2xl font-bold ${ipoData.expectedProfit >= 0 ? 'text-[#00FF7B]' : 'text-red-400'}`}>
                ₹{Math.abs(ipoData.expectedProfit).toLocaleString()}
              </div>
              <div className="text-sm">Per lot</div>
            </div>
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

          {/* Listing performance — GMP prediction vs actual (listed IPOs only) */}
          {listingPerf && (
            <div className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-medium text-white">Listing Performance</h3>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ color: listingPerf.verdict.color, backgroundColor: `${listingPerf.verdict.color}1a` }}
                >
                  {listingPerf.verdict.label}
                </span>
              </div>

              <div className="flex items-stretch gap-2 md:gap-3">
                <div className="flex-1 bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] text-center">
                  <div className="text-gray-400 text-xs mb-1">Issue Price</div>
                  <div className="text-lg md:text-xl font-bold text-white">₹{listingPerf.issue}</div>
                </div>

                <div className="flex items-center text-gray-600 text-lg">→</div>

                <div className="flex-1 bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] text-center">
                  <div className="text-gray-400 text-xs mb-1">Est. Listing (GMP)</div>
                  <div className="text-lg md:text-xl font-bold text-white">₹{listingPerf.estListing}</div>
                  <div className={`text-xs ${listingPerf.estGainPct >= 0 ? 'text-[#00FF7B]' : 'text-[#FF3F42]'}`}>
                    {listingPerf.estGainPct >= 0 ? '+' : ''}{listingPerf.estGainPct.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-lg">→</div>

                <div
                  className="flex-1 p-3 rounded-lg border text-center"
                  style={{
                    borderColor: `${listingPerf.actualGainPct >= 0 ? '#00FF7B' : '#FF3F42'}59`,
                    backgroundColor: `${listingPerf.actualGainPct >= 0 ? '#00FF7B' : '#FF3F42'}12`,
                  }}
                >
                  <div className="text-gray-400 text-xs mb-1">Actual Listing</div>
                  <div className={`text-lg md:text-xl font-bold ${listingPerf.actualGainPct >= 0 ? 'text-[#00FF7B]' : 'text-[#FF3F42]'}`}>
                    ₹{listingPerf.actual}
                  </div>
                  <div className={`text-xs ${listingPerf.actualGainPct >= 0 ? 'text-[#00FF7B]' : 'text-[#FF3F42]'}`}>
                    {listingPerf.actualGainPct >= 0 ? '+' : ''}{listingPerf.actualGainPct.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Listing gain is measured against the issue price. Live/current price isn&apos;t tracked by this source.
              </div>
            </div>
          )}

          {/* Subscription breakdown cards + bar chart */}
          {subscriptionData && (
            <div className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
              <div className="flex items-center gap-2 mb-4">
                <BsBarChart className="text-[#00FF7B]" />
                <h3 className="text-lg font-medium text-white">Live Subscription Status</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] flex flex-col items-center">
                  <div className="text-gray-400 text-sm self-start">QIB</div>
                  <SubscriptionGauge value={parseFloat(subscriptionData.qib) || 0} label="Institutional" color="#3b82f6" size={64} />
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] flex flex-col items-center">
                  <div className="text-gray-400 text-sm self-start">NII</div>
                  <SubscriptionGauge value={parseFloat(subscriptionData.nii) || 0} label="Non-Institutional" color="#a855f7" size={64} />
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] flex flex-col items-center">
                  <div className="text-gray-400 text-sm self-start">RII</div>
                  <SubscriptionGauge value={parseFloat(subscriptionData.rii) || 0} label="Retail" color="#f97316" size={64} />
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2d2d2d] flex flex-col items-center">
                  <div className="text-gray-400 text-sm self-start">Total</div>
                  <SubscriptionGauge value={parseFloat(subscriptionData.total) || 0} label="Overall" color="#00FF7B" size={64} />
                </div>
              </div>

              {/* Stacked area chart for subscription history */}
              {stackedSubscriptionData.length > 1 && (
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></div>
                      <span className="text-gray-400">QIB</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]"></div>
                      <span className="text-gray-400">NII</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#f97316]"></div>
                      <span className="text-gray-400">RII</span>
                    </div>
                  </div>
                  <div className="h-48">
                    <AreaChart
                      data={stackedSubscriptionData}
                      xDataKey="date"
                      margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                      className="h-full w-full"
                      status="ready"
                    >
                      <Grid horizontal vertical={false} stroke="#2d2d2d" />
                      <YAxisLabels numTicks={4} format={(v) => `${v}x`} />
                      <XAxis numTicks={5} />
                      <Area dataKey="riiCum" fill="#f97316" stroke="#f97316" fillOpacity={0.9} strokeWidth={1.5} showHighlight={false} />
                      <Area dataKey="niiCum" fill="#a855f7" stroke="#a855f7" fillOpacity={0.9} strokeWidth={1.5} showHighlight={false} />
                      <Area dataKey="qibCum" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.9} strokeWidth={1.5} showHighlight={false} />
                      <ChartTooltip />
                    </AreaChart>
                  </div>
                </div>
              )}

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

          {/* GMP Trend Area Chart */}
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
                <AreaChart
                  data={areaChartData}
                  xDataKey="date"
                  margin={{ top: 20, right: 20, bottom: 30, left: 55 }}
                  className="h-full w-full"
                  status="ready"
                >
                  <Grid horizontal vertical={false} stroke="#2d2d2d" />
                  <YAxisLabels numTicks={5} format={(v) => `₹${v}`} />
                  <XAxis numTicks={5} />
                  <Area
                    dataKey="gmp"
                    fill={gmpColor}
                    stroke={gmpColor}
                    fillOpacity={0.3}
                    strokeWidth={2.5}
                    showMarkers
                  />
                  <ChartTooltip />
                </AreaChart>
              </div>
            )}
          </div>

          {/* Est. Listing Line Chart (when we have enough data) */}
          {gmpHistory.length > 2 && ipoData.price > 0 && (
            <div className="mb-8 bg-[#0F0F0F] p-4 rounded-xl border border-[#2d2d2d]">
              <h3 className="text-lg font-medium mb-4 text-white">Estimated Listing vs Issue Price</h3>
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#3b82f6] rounded"></div>
                  <span className="text-gray-400">Est. Listing Price</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 border-t border-dashed border-[#f97316]"></div>
                  <span className="text-gray-400">Issue Price (₹{ipoData.price})</span>
                </div>
              </div>
              <div className="h-48 md:h-64">
                <LineChart
                  data={areaChartData}
                  xDataKey="date"
                  margin={{ top: 20, right: 20, bottom: 30, left: 55 }}
                  className="h-full w-full"
                  status="ready"
                >
                  <Grid horizontal vertical={false} stroke="#2d2d2d" />
                  <YAxisLabels numTicks={5} format={(v) => `₹${v}`} />
                  <XAxis numTicks={5} />
                  <Line dataKey="ipoPrice" stroke="#f97316" strokeWidth={1.5} dashFromIndex={0} dashArray="6,4" />
                  <Line dataKey="estListing" stroke="#3b82f6" strokeWidth={2.5} showMarkers />
                  <ChartTooltip />
                </LineChart>
              </div>
            </div>
          )}

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
