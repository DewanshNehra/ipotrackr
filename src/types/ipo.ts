export interface APIIPOObject {
  "~orderby1": number;
  "Name": string;
  "GMP": string;
  "Rating": string;
  "Sub": string;
  "Price (₹)": string;
  "IPO Size": string;
  "Lot": string;
  "~P/E": string;
  "~id": number;
  "Open": string;
  "Close": string;
  "BoA Dt": string;
  "Listing": string;
  "Updated-On": string;
  "Anchor": string;
  "~Srt_Open": string;
  "~Srt_Close": string;
  "~Srt_BoA_Dt": string;
  "~Str_Listing": string;
  "~urlrewrite_folder_name": string;
  "~Display_Order": number;
  "~Highlight_Row": string;
  "~IPO_Category": string;
  "~gmp_percent_calc"?: string;
  "~ipo_name"?: string;
}

export interface APIResponse {
  msg: string;
  reportTableData: APIIPOObject[];
  totalRecords?: number;
  totalPages?: number;
  iPageNo?: number;
  fldpage_size?: number;
}

export interface ProcessedIPOData {
  id: number;
  ipoName: string;
  gmpValue: string;
  gmpPercentage: string;
  subscriptionStatus: string;
  status: 'open' | 'upcoming' | 'pending' | 'listed';
  price: number;
  lotSize: number;
  issueSize: string;
  estListing: string;
  estListingValue: number;
  estListingPercentage: string;
  biddingStartDate: string | "-";
  biddingEndDate: string;
  basisOfAllotmentDate?: string;
  refundsInitiationDate?: string;
  creditToDematDate?: string;
  listingDate?: string;
  expectedProfit: number;
  detailsUrl: string; 
}

export interface IPOActivityDates {
  biddingStartDate?: string;
  biddingEndDate?: string;
  basisOfAllotmentDate?: string;
  refundsInitiationDate?: string;
  creditToDematDate?: string;
  listingDate?: string;
  /** Actual price the stock listed at (present only for listed IPOs). */
  listingPrice?: number;
}

export interface GmpHistoryItem {
  date: string;
  gmp: number;
  price: string;
  estimatedListing: number;
  percentage: string;
  estimatedProfit: string;
  movement: 'up' | 'down' | 'none';
  lastUpdated: string;
}

export interface IPOGmpResponse {
  msg: number;
  ipoGmpData: Array<{
    Seq: number;
    id: number;
    ipo_id: number;
    gmp_date: string;
    gmp: string;
    gmp_comments: string;
    gmp_compare_desc: string;
    subject_to_sauda: string;
    gmp_city: string;
    gmp_variation: string;
    max_ipo_price: string;
    estimated_listing_price: string;
    gmp_percent_calc: string;
    gmp_desc_other: string;
    up_down_status: string;
    gmp_active_record_flag: number;
    sub2: string;
    est_profit: string;
    create_date: string;
    create_date_gmp: string;
    last_updated_gmp: string;
    last_updated: string;
  }>;
  ipoGmpTable: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  pointBackgroundColor?: string[];
  pointRadius: number;
  pointHoverRadius?: number;
  borderDash?: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface SubscriptionDataItem {
  bid_date: string;
  qib: string;
  nii: string;
  rii: string;
  total: string;
}

export interface IPOSubscriptionResponse {
  msg: number;
  data: {
    ipoBiddingData: Array<{
      bid_date: string;
      qib: string;
      nii: string;
      rii: string;
      total: string;
    }>;
  };
}

export interface ProcessedSubscriptionData {
  qib: string;
  nii: string;
  rii: string;
  total: string;
  lastUpdated: string;
}

export interface SubscriptionHistoryItem {
  date: string;
  qib: number;
  nii: number;
  rii: number;
  total: number;
}