
import { NextResponse } from 'next/server';

let symbolToIdMap: Record<string, string> | null = null;
let mapPromise: Promise<void> | null = null;

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
    } catch(e) {
        mapPromise = null;
        throw e;
    }
  })();
  return mapPromise;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'symbols query param (csv) is required' }, { status: 400 });
  }

  try {
    await ensureMap();
    if (!symbolToIdMap) {
         return NextResponse.json({ error: 'Failed to build symbol map' }, { status: 500 });
    }
    
    const syms = symbols.split(',').map(s => s.trim().toLowerCase());
    const ids = syms.map(s => symbolToIdMap![s]).filter(Boolean);

    if (!ids.length) {
      return NextResponse.json({}, { status: 404 });
    }

    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}`;
    const marketResp = await fetch(url);

    if (!marketResp.ok) {
      const code = marketResp.status === 429 ? 503 : marketResp.status;
      return NextResponse.json({ error: 'market data fetch failed' }, { status: code });
    }

    const data: { id: string; image: string }[] = await marketResp.json();
    const result: Record<string, string> = {};
    
    data.forEach(c => {
      const sym = Object.entries(symbolToIdMap!).find(([, id]) => id === c.id)?.[0];
      if (sym) {
        result[sym] = c.image;
      }
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /crypto/icons error:', err);
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 });
  }
}
