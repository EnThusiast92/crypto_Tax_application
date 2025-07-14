// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

let coinListCache: { [symbol: string]: string } = {};
let cacheTimestamp = 0;

async function getCoinGeckoId(symbol: string): Promise<string | null> {
  const now = Date.now();
  // Refresh cache every 24 hours
  if (Object.keys(coinListCache).length === 0 || now - cacheTimestamp > 86400000) {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!res.ok) {
            console.error('Failed to fetch coin list from CoinGecko');
            return null; // Or use stale cache if available
        }
        const data = await res.json();
        const newCache: { [symbol: string]: string } = {};
        for (const coin of data) {
            // To handle duplicate symbols, we can decide on a strategy.
            // For now, the first one wins, which is often the main one.
            if (!newCache[coin.symbol.toLowerCase()]) {
                newCache[coin.symbol.toLowerCase()] = coin.id;
            }
        }
        coinListCache = newCache;
        cacheTimestamp = now;
        console.log('CoinGecko coin list cache refreshed.');
    } catch(error) {
        console.error('Error refreshing CoinGecko cache:', error);
        // Return null or use stale cache if an error occurs
        return coinListCache[symbol.toLowerCase()] || null;
    }
  }

  return coinListCache[symbol.toLowerCase()] || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 });
  }

  try {
    const id = await getCoinGeckoId(symbol);
    if (!id) {
        console.log(`Symbol not found in cache: ${symbol}`);
        return NextResponse.json({ iconUrl: null, error: 'Symbol not found' }, { status: 404 });
    }

    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
     if (!coinRes.ok) {
      console.error(`Failed to fetch details for coin ${id}`);
      return NextResponse.json({ iconUrl: null, error: 'Failed to fetch coin details' }, { status: coinRes.status });
    }
    const coinData = await coinRes.json();
    const iconUrl = coinData.image?.large || coinData.image?.thumb || coinData.image?.small || null;
    
    if(!iconUrl){
      console.log(`Icon URL not found for ${id}`);
    }

    return NextResponse.json({ iconUrl });
  } catch (err) {
    console.error('Error fetching CoinGecko icon:', err);
    return NextResponse.json({ iconUrl: null, error: 'Failed to fetch icon' }, { status: 500 });
  }
}
