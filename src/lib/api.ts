import { APIResponse, ProcessedIPOData, IPOGmpResponse, GmpHistoryItem, IPOSubscriptionResponse, ProcessedSubscriptionData } from '@/types/ipo';
import { processIPOData, processGmpHistoryData, processSubscriptionData } from './utils';

const API_BASE_URL = 'https://webnodejs.investorgain.com/cloud/report/data-read/331/1/6/2025/2025-26/0/all';
const GMP_API_BASE_URL = 'https://webnodejs.investorgain.com/cloud/ipo/ipo-gmp-read';
const SUBSCRIPTION_API_BASE_URL = 'https://webnodejs.investorgain.com/cloud/ipo/ipo-subscription-read';

export async function fetchIPOData(): Promise<ProcessedIPOData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?search=&v=${Date.now()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } 
    });

    if (!response.ok) {
      console.error(`Failed to fetch IPO data: ${response.status}`);
      return []; 
    }

    const data: APIResponse = await response.json();
    
    if (!data.reportTableData || !Array.isArray(data.reportTableData)) {
      console.warn('Invalid API response structure, returning empty array');
      return [];
    }

    return data.reportTableData.map(processIPOData);
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    return [];
  }
}

export async function fetchIPOGmpData(ipoId: number): Promise<GmpHistoryItem[]> {
  try {
    const response = await fetch(`${GMP_API_BASE_URL}/${ipoId}/true`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GMP data: ${response.status}`);
    }

    const data: IPOGmpResponse = await response.json();
    
    if (data.msg !== 1) {
      throw new Error('Invalid GMP data response');
    }

    return processGmpHistoryData(data);
  } catch (error) {
    console.error('Error fetching GMP data:', error);
    throw error;
  }
}

export async function fetchIPOGmpRawData(ipoId: number): Promise<IPOGmpResponse> {
  try {
    const response = await fetch(`${GMP_API_BASE_URL}/${ipoId}/true`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GMP data: ${response.status}`);
    }

    const data: IPOGmpResponse = await response.json();
    
    if (data.msg !== 1) {
      throw new Error('Invalid GMP data response');
    }

    return data;
  } catch (error) {
    console.error('Error fetching GMP raw data:', error);
    throw error;
  }
}

export async function fetchIPOSubscriptionData(ipoId: number): Promise<ProcessedSubscriptionData | null> {
  try {
    const response = await fetch(`${SUBSCRIPTION_API_BASE_URL}/${ipoId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription data: ${response.status}`);
    }

    const data: IPOSubscriptionResponse = await response.json();
    
    if (data.msg !== 1) {
      throw new Error('Invalid subscription data response');
    }

    return processSubscriptionData(data);
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return null;
  }
}