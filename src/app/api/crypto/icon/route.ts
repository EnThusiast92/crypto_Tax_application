
// app/api/crypto/icon/route.ts
import { NextResponse } from 'next/server';

// This file is kept for potential future use or for single-icon lookups if needed,
// but the primary, high-performance logic has been moved to /api/crypto/icons.
// The new batch endpoint is more efficient for loading multiple icons at once.

let symbolToIdMap: Record<string, string> | null = null;
let mapPromise: Promise<void> | null = null;
let iconCache: Record<string, string> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cacheTimestamps: Record<string, number> = {};

async function ensureMap() {
  if (symbolToIdMap) {
    return;
  }
  if (mapPromise) {
    return mapPromise;
  }

  mapPromise = (async () => {
    try {
        const resp = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!resp.ok) {
            console.error(`List fetch failed with status: ${resp.status}`);
            throw new Error(`List fetch failed: ${resp.status}`);
        }
        const list: { id: string; symbol: string }[] = await resp.json();
        const newMap = list.reduce((m, c) => {
            if (!m[c.symbol.toLowerCase()]) {
            m[c.symbol.toLowerCase()] = c.id;
            }
            return m;
        }, {} as Record<string, string>);
        symbolToIdMap = newMap;
    } catch (e) {
        mapPromise = null;
        throw e;
    }
  })();

  return mapPromise;
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

    const last = cacheTimestamps[coinId] || 0;
    if (iconCache[coinId] && Date.now() - last < CACHE_TTL) {
      return NextResponse.json({ iconUrl: iconCache[coinId] });
    }

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

    iconCache[coinId] = iconUrl;
    cacheTimestamps[coinId] = Date.now();
    return NextResponse.json({ iconUrl });
  } catch (err: any) {
    console.error(`API /crypto/icon error for symbol "${symbol}":`, err.message);
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 });
  }
}
