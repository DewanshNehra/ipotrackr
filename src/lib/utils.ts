import { APIIPOObject, ProcessedIPOData, GmpHistoryItem, IPOGmpResponse, ChartData, IPOSubscriptionResponse, ProcessedSubscriptionData } from '@/types/ipo';

export function processIPOData(apiData: APIIPOObject): ProcessedIPOData {
  const plainName = apiData["~ipo_name"]?.trim();
  const nameMatch = apiData.Name?.match(/title="([^"]+)"/);
  const ipoName = plainName || (nameMatch ? nameMatch[1] : 'Unknown IPO');

  const statusMatch = apiData.Name?.match(/bg-(\w+)/);
  const badgeClass = statusMatch ? statusMatch[1] : 'secondary';

  let status: 'open' | 'upcoming' | 'pending' | 'listed' = 'pending';
  if (badgeClass === 'success') status = 'open';
  else if (badgeClass === 'warning' || badgeClass === 'info') status = 'upcoming';
  else if (badgeClass === 'secondary' || badgeClass === 'light') status = 'listed';
  else if (badgeClass === 'primary' || badgeClass === 'dark') status = 'pending';


  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const openStr = apiData["~Srt_Open"] || '';
  const closeStr = apiData["~Srt_Close"] || '';
  const boaStr = apiData["~Srt_BoA_Dt"] || '';      
  const listStr = apiData["~Str_Listing"] || '';       

  const hasOpen = !!openStr;
  const hasClose = !!closeStr;
  const hasList = !!listStr;

  if (hasOpen && hasClose) {
    const openDate = new Date(openStr);
    openDate.setHours(0, 0, 0, 0);
    const closeDate = new Date(closeStr);
    closeDate.setHours(23, 59, 59, 999);

    if (!isNaN(openDate.getTime()) && !isNaN(closeDate.getTime())) {
      if (currentDate >= openDate && currentDate <= closeDate) {
        status = 'open';
      } else if (currentDate < openDate) {
        status = 'upcoming';
      } else if (currentDate > closeDate) {
        if (hasList) {
          const listingDate = new Date(listStr);
          listingDate.setHours(0, 0, 0, 0);
          status = !isNaN(listingDate.getTime()) && currentDate >= listingDate ? 'listed' : 'pending';
        } else {
          status = 'pending';
        }
      }
    }
  }

  const gmpValueMatch = apiData.GMP?.match(/<b>([^<]+)<\/b>/);
  const rawGmpStr = (gmpValueMatch?.[1] || '').replace(/[^\d.-]/g, '');
  const gmpNumber = rawGmpStr && rawGmpStr !== '--' ? parseFloat(rawGmpStr) : 0;

  const gmpPercentFromString = apiData.GMP?.match(/\(([^)]+)\)/)?.[1];
  const gmpPercentFromField = apiData["~gmp_percent_calc"] && apiData["~gmp_percent_calc"] !== ''
    ? `${Number(apiData["~gmp_percent_calc"]).toFixed(2)}%`
    : undefined;

  const price = parseNumericValue(apiData["Price (₹)"] || '');
  const lotSize = Math.max(0, Math.floor(parseNumericValue(apiData.Lot || '')));

  const estListingValue = price > 0 ? price + (isNaN(gmpNumber) ? 0 : gmpNumber) : 0;

  const estListingPercentage =
    gmpPercentFromString && gmpPercentFromString !== ''
      ? gmpPercentFromString
      : price > 0 && !isNaN(gmpNumber) && gmpNumber !== 0
        ? `${((gmpNumber / price) * 100).toFixed(2)}%`
        : gmpPercentFromField || '0%';

  const expectedProfit = lotSize > 0 && estListingValue > 0 && price > 0
    ? Math.round(lotSize * (estListingValue - price))
    : 0;

  const issueSize = (apiData["IPO Size"] || '').replace(/&#8377;/g, '₹');


  return {
    id: apiData["~id"],
    ipoName,
    gmpValue: String(isNaN(gmpNumber) ? 0 : gmpNumber),
    gmpPercentage: estListingPercentage,
    subscriptionStatus: apiData.Sub || '',
    status,
    price,
    lotSize,
    issueSize,
    estListing: estListingValue > 0 ? `${estListingValue} (${estListingPercentage})` : `0 (${estListingPercentage})`,
    estListingValue,
    estListingPercentage,
    biddingStartDate: apiData["~Srt_Open"] || '',
    biddingEndDate: apiData["~Srt_Close"] || '',
    // Accurate activity dates will be provided by activity-dates API; leave undefined here
    basisOfAllotmentDate: boaStr || undefined,
    refundsInitiationDate: undefined,
    creditToDematDate: undefined,
    listingDate: listStr || undefined,
    expectedProfit,
    detailsUrl: `https://www.investorgain.com${apiData["~urlrewrite_folder_name"]}`
  };
}

export function formatDateFull(dateString?: string): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = d.getDate();
  const mon = d.toLocaleString('default', { month: 'short' });
  const yr = d.getFullYear();
  return `${day} ${mon} ${yr}`;
}

export function processGmpHistoryData(gmpResponse: IPOGmpResponse): GmpHistoryItem[] {
  if (!gmpResponse.ipoGmpTable) {
    return [];
  }

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(gmpResponse.ipoGmpTable, 'text/html');
  const rows = htmlDoc.querySelectorAll('tbody tr');
  
  const extractedData: GmpHistoryItem[] = [];
  
  rows.forEach(row => {
    const gmpDateCell = row.querySelector('[data-title="GMP Date"]');
    const priceCell = row.querySelector('[data-title="IPO Price"]');
    const gmpCell = row.querySelector('[data-title="GMP"]');
    const estListingCell = row.querySelector('[data-title="Est. Listing Price"]');
    const estProfitCell = row.querySelector('[data-title="Est. Profit"]');
    const lastUpdatedCell = row.querySelector('[data-title="Last Updated"]');
    
    if (!gmpDateCell || !priceCell || !gmpCell || !estListingCell) return;
    
    let movement: 'up' | 'down' | 'none' = 'none';
    if (gmpCell.innerHTML.includes('trend-up')) {
      movement = 'up';
    } else if (gmpCell.innerHTML.includes('trend-dn')) {
      movement = 'down';
    }
    
    const gmpValue = gmpCell.textContent?.match(/₹(\d+)/)?.[1] || 
                    gmpCell.textContent?.match(/\u20B9(\d+)/)?.[1] || 
                    gmpCell.textContent?.match(/(\d+)/)?.[1] || '0';
    
    const estListingText = estListingCell.textContent || '';
    const estListingValue = estListingText.match(/₹(\d+)/)?.[1] || 
                           estListingText.match(/\u20B9(\d+)/)?.[1] || 
                           estListingText.match(/(\d+)/)?.[1] || '0';
    const estListingPercentage = estListingText.match(/\(([^)]+)\)/)?.[1] || '0%';
    
    extractedData.push({
      date: (gmpDateCell.textContent || '').trim().split(' ')[0],
      price: (priceCell.textContent || '').trim(),
      gmp: parseInt(gmpValue, 10),
      estimatedListing: parseInt(estListingValue, 10),
      percentage: estListingPercentage,
      estimatedProfit: (estProfitCell?.textContent || '').trim(),
      movement,
      lastUpdated: (lastUpdatedCell?.textContent || '').trim()
    });
  });
  
  return extractedData.reverse();
}

export function createChartData(gmpHistory: GmpHistoryItem[]): ChartData {
  return {
    labels: gmpHistory.map(item => item.date),
    datasets: [
      {
        label: 'GMP Value (₹)',
        data: gmpHistory.map(item => item.gmp),
        borderColor: 'rgb(0, 255, 123)',
        backgroundColor: 'rgba(0, 255, 123, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: gmpHistory.map(item => 
          item.movement === 'up' ? 'rgb(0, 255, 123)' : 
          item.movement === 'down' ? 'rgb(255, 63, 66)' : 
          'rgb(200, 200, 200)'
        ),
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ]
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
}

export function formatIPOName(name: string, maxLength: number = 25): string {
  const cleanName = name.replace(/\s*(NSE\s*)?SME\s*/gi, '').trim();
  return cleanName.length <= maxLength ? cleanName : `${cleanName.substring(0, maxLength).trim()}...`;
}

export function parseNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  const numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
}

export function formatExpectedProfit(profit: number): string {
  const absProfit = Math.abs(profit);
  return profit >= 0 ? absProfit.toLocaleString() : `-${absProfit.toLocaleString()}`;
}

export function sortIPOsByStatus(data: ProcessedIPOData[]): ProcessedIPOData[] {
  return [...data].sort((a, b) => {
    const statusPriority = { open: 0, upcoming: 1, pending: 2, listed: 3 };
    const aPriority = statusPriority[a.status] || 99;
    const bPriority = statusPriority[b.status] || 99;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    const aIsSME = a.ipoName.toLowerCase().includes('sme');
    const bIsSME = b.ipoName.toLowerCase().includes('sme');
    
    if (aIsSME !== bIsSME) {
      return aIsSME ? 1 : -1;
    }
    
    return b.expectedProfit - a.expectedProfit;
  });
}

export function processSubscriptionData(subscriptionResponse: IPOSubscriptionResponse): ProcessedSubscriptionData | null {
  if (!subscriptionResponse.data?.ipoBiddingData || subscriptionResponse.data.ipoBiddingData.length === 0) {
    return null;
  }

  const latestData = subscriptionResponse.data.ipoBiddingData[subscriptionResponse.data.ipoBiddingData.length - 1];

  return {
    qib: latestData.qib,
    nii: latestData.nii,
    rii: latestData.rii,
    total: latestData.total,
    lastUpdated: latestData.bid_date
  };
}

function parseYMDParts(s?: string): { y: number; mo: number; d: number } | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3] };
}


function istMidnightUTCms(date?: string): number {
  const p = parseYMDParts(date);
  if (!p) return NaN;
  return Date.UTC(p.y, p.mo - 1, p.d, -5, -30, 0, 0);
}


function ist5pmUTCms(date?: string): number {
  const p = parseYMDParts(date);
  if (!p) return NaN;

  return Date.UTC(p.y, p.mo - 1, p.d, 11, 30, 0, 0);
}


export function istThresholdUTCms(key: string, date?: string): number {
  if (!date) return NaN;
  return key === 'close' ? ist5pmUTCms(date) : istMidnightUTCms(date);
}


export function isMilestoneDone(
  item: { key: string; date?: string },
  nowUTCms: number = Date.now()
): boolean {
  const t = istThresholdUTCms(item.key, item.date);
  return Number.isFinite(t) && nowUTCms >= t;
}


export function computeActivityProgress(
  items: Array<{ key: string; date?: string }>,
  nowUTCms: number = Date.now()
): number {
  const timed = items
    .map((it, idx) => ({ idx, key: it.key, date: it.date, t: istThresholdUTCms(it.key, it.date) }))
    .filter(x => Number.isFinite(x.t));

  if (timed.length < 2) return 0;

  timed.sort((a, b) => a.idx - b.idx);

  const lastIdx = timed.length - 1;
  const segments = lastIdx;
  if (nowUTCms <= timed[0].t) return 0;
  if (nowUTCms >= timed[lastIdx].t) return 100;


  let i = 0;
  for (; i < lastIdx; i++) {
    if (nowUTCms < timed[i + 1].t) break;
  }
  const t0 = timed[i].t;
  const t1 = timed[i + 1].t;
  const frac = Math.max(0, Math.min(1, (nowUTCms - t0) / Math.max(1, t1 - t0)));
  const completed = i + frac;

  return Math.max(0, Math.min(100, (completed / segments) * 100));
}
// Debounce utility for search tracking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
