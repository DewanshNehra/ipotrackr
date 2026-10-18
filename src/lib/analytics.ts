// Umami analytics utility for type-safe event tracking

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean | undefined>) => void;
    };
  }
}

export const trackEvent = (eventName: string, eventData?: Record<string, string | number | boolean | undefined>) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData);
  }
};

// Predefined event types for better tracking
export const analytics = {
  // IPO Card Interactions
  ipoCardClick: (ipoName: string, status: string, gmp: string | number) => {
    trackEvent('ipo-card-click', {
      ipo_name: ipoName,
      status,
      gmp: gmp.toString(),
    });
  },

  // Modal Interactions
  ipoModalOpen: (ipoName: string) => {
    trackEvent('ipo-modal-open', { ipo_name: ipoName });
  },

  ipoModalClose: (ipoName: string, timeSpent?: number) => {
    trackEvent('ipo-modal-close', { 
      ipo_name: ipoName,
      time_spent_seconds: timeSpent 
    });
  },

  // View Toggle
  viewToggle: (view: 'cards' | 'table') => {
    trackEvent('view-toggle', { view_type: view });
  },

  // Filter Usage
  searchUsed: (searchTerm: string) => {
    trackEvent('search-used', { 
      search_term: searchTerm,
      term_length: searchTerm.length 
    });
  },

  smeFilterToggle: (enabled: boolean) => {
    trackEvent('sme-filter-toggle', { enabled });
  },

  // IPO Status Filters (if you add them later)
  statusFilter: (status: string) => {
    trackEvent('status-filter', { status });
  },
};
