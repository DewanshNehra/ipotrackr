import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

const UPSTREAM = 'https://webnodejs.investorgain.com/cloud/v2/ipo/ipo-subscription-read';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid IPO id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${UPSTREAM}/${id}`, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        Referer: 'https://www.investorgain.com/',
      },
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('subscription route error:', e);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
