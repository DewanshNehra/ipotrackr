import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const html = await res.text();


    const findValue = (keys: string[]): string => {
      for (const key of keys) {

        const rx1 = new RegExp(`"${escapeRegex(key)}"\\s*:\\s*"([^"]+)"`, 'i');
        const m1 = html.match(rx1);
        if (m1?.[1]) return m1[1];

        const rx2 = new RegExp(`\\\\\\"${escapeRegex(key)}\\\\\\"\\s*:\\s*\\\\\\"([^\\\\"]+)\\\\\\"`, 'i');
        const m2 = html.match(rx2);
        if (m2?.[1]) return m2[1];
      }
      return '';
    };

    const normalize = (v?: string): string | '' => stripTimeISO(v) || parseHumanDateToISO(v);


    const biddingStartDate =
      normalize(findValue(['issue_open_dt_json', 'issue_open_date', 'issue_open_dt'])) || undefined;

    const biddingEndDate =
      normalize(findValue(['issue_end_dt_json', 'issue_close_date', 'issue_end_dt'])) || undefined;

    const basisOfAllotmentDate =
      normalize(findValue(['timetable_boa_dt', 'basic_of_allotment_dt'])) || undefined;

    const refundsInitiationDate =
      normalize(findValue(['timetable_refunds_dt', 'initiation_of_refund_dt'])) || undefined;

    const creditToDematDate =
      normalize(findValue(['timetable_share_credit_dt', 'demat_acct_credit_dt'])) || undefined;

    const listingDate =
      normalize(findValue(['timetable_listing_dt', 'ipo_listing_date', 'listing_dt'])) || undefined;

    // Actual price the stock listed at (populated only once an IPO has listed).
    const listingPrice = parseNum(findValue(['listing_price']));

    return NextResponse.json(
      {
        biddingStartDate,
        biddingEndDate,
        basisOfAllotmentDate,
        refundsInitiationDate,
        creditToDematDate,
        listingDate,
        listingPrice,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('activity-dates route error:', e);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseNum(v?: string): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function stripTimeISO(v?: string): string | '' {
  if (!v || typeof v !== 'string') return '';
  const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}


function parseHumanDateToISO(v?: string): string | '' {
  if (!v || typeof v !== 'string') return '';
  const cleaned = v.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return '';
  const [dStr, monStrRaw, yStr] = parts;
  const day = parseInt(dStr, 10);
  const monStr = monStrRaw.toLowerCase().slice(0, 3);
  const monMap: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const mIdx = monMap[monStr];
  const year = parseInt(yStr, 10);
  if (!day || !mIdx || !year) return '';
  const mm = String(mIdx).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
