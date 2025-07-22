
// app/api/crypto/icon/route.ts
import { NextResponse } from 'next/server';

let symbolToIdMap: Record<string, string> | null = null;
let iconCache: Record<string, string> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cacheTimestamps: Record<string, number> = {};

async function ensureMap() {
  if (symbolToIdMap) return;
  const resp = await fetch('https://api.coingecko.com/api/v3/coins/list');
  if (!resp.ok) throw new Error(`List fetch failed: ${resp.status}`);
  const list: { id: string; symbol: string }[] = await resp.json();
  symbolToIdMap = list.reduce((m, c) => {
    // We might have duplicates, the first one is usually the most popular one.
    if (!m[c.symbol.toLowerCase()]) {
      m[c.symbol.toLowerCase()] = c.id;
    }
    return m;
  }, {} as Record<string, string>);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol || typeof symbol !== 'string') {
    return NextResponse.json({ error: 'Symbol query param is required' }, { status: 400 });
  }
  const sym = symbol.toLowerCase();

  try {
    await ensureMap();
    if (!symbolToIdMap) {
      return NextResponse.json({ error: 'Failed to build symbol map from CoinGecko' }, { status: 503 });
    }
    const coinId = symbolToIdMap[sym];
    if (!coinId) {
      return NextResponse.json({ error: `unknown symbol "${symbol}"` }, { status: 404 });
    }

    // Return cached image if still fresh
    const last = cacheTimestamps[coinId] || 0;
    if (iconCache[coinId] && Date.now() - last < CACHE_TTL) {
      return NextResponse.json({ iconUrl: iconCache[coinId] });
    }

    // Fetch via markets endpoint (single-coin)
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`;
    const marketResp = await fetch(url);
    if (marketResp.status === 429) {
      return NextResponse.json({ error: 'rate limited, try again later' }, { status: 503 });
    }
    if (!marketResp.ok) {
      return NextResponse.json({ error: 'failed to fetch market data' }, { status: marketResp.status });
    }
    const bodies: { image?: string }[] = await marketResp.json();
    const iconUrl = bodies[0]?.image;
    if (!iconUrl) {
      return NextResponse.json({ error: 'no image in response' }, { status: 404 });
    }

    // Cache and return
    iconCache[coinId] = iconUrl;
    cacheTimestamps[coinId] = Date.now();
    return NextResponse.json({ iconUrl });
  } catch (err: any) {
    console.error('API /crypto/icon error:', err);
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 });
  }
}
