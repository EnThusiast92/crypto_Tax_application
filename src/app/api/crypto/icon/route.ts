// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

// This cache will now persist across requests in the same server instance.
let coinListCache: { [symbol: string]: string } = {};
let topCoinsCache: { [symbol: string]: string } = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function preloadTopCoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=200&page=1');
    if (!res.ok) {
      console.error('Failed to preload top coins from CoinGecko');
      return;
    }
    const data = await res.json();
    const newCache: { [symbol: string]: string } = {};
    for (const coin of data) {
      newCache[coin.symbol.toLowerCase()] = coin.id;
    }
    topCoinsCache = newCache;
    console.log('Successfully preloaded and cached top 200 coins.');
  } catch (error) {
    console.error('Error preloading or processing top coins:', error);
  }
}

async function getCoinGeckoId(symbol: string): Promise<string | null> {
  const now = Date.now();
  const lowerSymbol = symbol.toLowerCase();

  // 1. Check top coins cache first
  if (topCoinsCache[lowerSymbol]) {
    return topCoinsCache[lowerSymbol];
  }

  // 2. If not in top coins, check the full list cache
  // Refresh full list cache every 24 hours or if it's empty
  if (Object.keys(coinListCache).length === 0 || now - cacheTimestamp > CACHE_DURATION) {
    try {
      // Also preload top coins when refreshing the main list
      await preloadTopCoins();
      
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (!res.ok) {
        console.error('Failed to fetch full coin list from CoinGecko');
        // Return from existing (potentially stale) cache if possible
        return coinListCache[lowerSymbol] || null;
      }
      const data = await res.json();
      const newCache: { [symbol: string]: string } = {};
      for (const coin of data) {
        newCache[coin.symbol.toLowerCase()] = coin.id;
      }
      coinListCache = newCache;
      cacheTimestamp = now;
      console.log('Successfully fetched and cached the full coin list.');
    } catch (error) {
      console.error('Error fetching or processing CoinGecko coin list:', error);
      // In case of error, rely on the potentially stale cache
      return coinListCache[lowerSymbol] || null;
    }
  }
  
  // 3. Return from the full list cache
  return coinListCache[lowerSymbol] || null;
}

// Initial preload when the server starts
preloadTopCoins();


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 });
  }

  try {
    const id = await getCoinGeckoId(symbol);
    if (!id) {
      return NextResponse.json({ iconUrl: null, error: 'Symbol not found' }, { status: 404 });
    }

    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
     if (!coinRes.ok) {
      console.error(`Failed to fetch coin data for ID: ${id}. Status: ${coinRes.status}`);
      return NextResponse.json({ iconUrl: null, error: `Failed to fetch data for ${symbol}` }, { status: coinRes.status });
    }
    const coinData = await coinRes.json();
    const iconUrl = coinData.image?.thumb || coinData.image?.small || null;

    if (!iconUrl) {
      return NextResponse.json({ iconUrl: null, error: 'Icon URL not found in coin data' }, { status: 404 });
    }

    return NextResponse.json({ iconUrl });

  } catch (err) {
    console.error(`Error fetching CoinGecko icon for symbol ${symbol}:`, err);
    return NextResponse.json({ iconUrl: null, error: 'Failed to fetch icon' }, { status: 500 });
  }
}
