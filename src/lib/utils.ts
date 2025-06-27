import { APIIPOObject, ProcessedIPOData, GmpHistoryItem, IPOGmpResponse, ChartData, IPOSubscriptionResponse, ProcessedSubscriptionData } from '@/types/ipo';

export function processIPOData(apiData: APIIPOObject): ProcessedIPOData {
  const nameMatch = apiData.Name.match(/title="([^"]+)"/);
  const ipoName = nameMatch ? nameMatch[1] : 'Unknown IPO';
  
  const statusMatch = apiData.Name.match(/bg-(\w+)/);
  const badgeClass = statusMatch ? statusMatch[1] : 'secondary';
  
  let status: 'open' | 'upcoming' | 'pending' | 'listed' = 'pending';
  
  if (badgeClass === 'success') {
    status = 'open';
  } else if (badgeClass === 'warning' || badgeClass === 'info') {
    status = 'upcoming';
  } else if (badgeClass === 'secondary' || badgeClass === 'light') {
    status = 'listed';
  } else if (badgeClass === 'primary' || badgeClass === 'dark') {
    status = 'pending';
  }
  
  // Get current date at start of day (00:00:00)
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Get open and close dates at start of day
  const openDate = new Date(apiData["~Srt_Open"]);
  openDate.setHours(0, 0, 0, 0);
  
  const closeDate = new Date(apiData["~Srt_Close"]);
  closeDate.setHours(23, 59, 59, 999); // Set to end of day for close date
  
  // Check if listing date exists and set it
  let listingDate: Date | null = null;
  if (apiData["~Str_Listing"]) {
    listingDate = new Date(apiData["~Str_Listing"]);
    listingDate.setHours(0, 0, 0, 0);
  }
  
  // Determine status based on dates
  if (currentDate >= openDate && currentDate <= closeDate) {
    status = 'open';
  } else if (currentDate < openDate) {
    status = 'upcoming';
  } else if (listingDate && currentDate >= listingDate) {
    status = 'listed';
  } else if (currentDate > closeDate) {
    status = 'pending';
  }
  
  const gmpMatch = apiData.GMP.match(/&#8377;<b>([\d.]+)<\/b> \(([^)]+)\)/);
  const gmpValue = gmpMatch ? gmpMatch[1] : '0';
  const gmpPercentage = gmpMatch ? gmpMatch[2] : '0%';
  
  const estListingMatch = apiData["Est Listing"].match(/<b>([\d.]+) \(([^)]+)\)<\/b>/);
  const estListingValue = estListingMatch ? parseFloat(estListingMatch[1]) : 0;
  const estListingPercentage = estListingMatch ? estListingMatch[2] : '0%';
  
  const price = parseInt(apiData.Price);
  const lotSize = parseInt(apiData.Lot);
  const expectedProfit = lotSize * (estListingValue - price);
  
  return {
    id: apiData["~id"],
    ipoName,
    gmpValue,
    gmpPercentage,
    subscriptionStatus: apiData.Sub,
    status,
    price,
    lotSize,
    issueSize: apiData["IPO Size"].replace('&#8377;', '₹'),
    estListing: `${estListingValue} (${estListingPercentage})`,
    estListingValue,
    estListingPercentage,
    biddingStartDate: apiData["~Srt_Open"],
    biddingEndDate: apiData["~Srt_Close"],
    expectedProfit,
    detailsUrl: `https://www.investorgain.com${apiData["~urlrewrite_folder_name"]}`
  };
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
    const priceCell = row.querySelector('[data-title="GMP Price"]');
    const gmpCell = row.querySelector('[data-title="GMP"]');
    const estListingCell = row.querySelector('[data-title="Estimated Listing Price"]');
    const estProfitCell = row.querySelector('[data-title="Estimated Profit Per Lot"]');
    const lastUpdatedCell = row.querySelector('[data-title="Last updated"]');
    
    if (!gmpDateCell || !priceCell || !gmpCell || !estListingCell) return;
    
    let movement: 'up' | 'down' | 'none' = 'none';
    if (gmpCell.innerHTML.includes('arrow_up.png')) {
      movement = 'up';
    } else if (gmpCell.innerHTML.includes('arrow_down.png')) {
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