// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

// Cache for the top 200 coins by market cap.
// The key is the symbol (lowercase), and the value is the icon URL.
let topCoinsCache: { [symbol: string]: string } = {};
let topCoinsCacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Full list cache for fallback searches.
let fullCoinListCache: any[] = [];
let fullCoinListTimestamp = 0;


/**
 * Fetches the top 200 coins by market cap from CoinGecko and caches their icon URLs.
 * This is the primary method for icon lookups.
 */
async function getTopCoinsMap(): Promise<{ [symbol: string]: string }> {
  const now = Date.now();
  if (Object.keys(topCoinsCache).length > 0 && now - topCoinsCacheTimestamp < CACHE_DURATION) {
    return topCoinsCache;
  }

  try {
    console.log('Refreshing top 200 coins cache...');
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=200&page=1&sparkline=false');
    if (!res.ok) {
      throw new Error(`Failed to fetch top coins list: ${res.statusText}`);
    }
    const topCoins: any[] = await res.json();
    
    const newCache: { [symbol: string]: string } = {};
    for (const coin of topCoins) {
        if (coin.symbol && coin.image) {
            // This map directly stores the symbol -> icon URL mapping.
            newCache[coin.symbol.toLowerCase()] = coin.image;
        }
    }

    topCoinsCache = newCache;
    topCoinsCacheTimestamp = now;
    console.log(`Top 200 coins cache refreshed successfully. Found ${Object.keys(topCoinsCache).length} coins.`);
    return topCoinsCache;
  } catch (error) {
    console.error('Error refreshing top coins cache:', error);
    // Return stale cache if available, otherwise an empty object.
    return topCoinsCache;
  }
}

/**
 * Fetches the full list of all coins from CoinGecko.
 * This is used as a fallback if a coin is not in the top 200.
 */
async function getFullCoinList() {
  const now = Date.now();
  if (fullCoinListCache.length === 0 || now - fullCoinListTimestamp > CACHE_DURATION) {
    try {
      console.log('Refreshing full coin list cache...');
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (!res.ok) throw new Error(`Failed to fetch full coin list: ${res.statusText}`);
      fullCoinListCache = await res.json();
      fullCoinListTimestamp = now;
    } catch (error) {
      console.error('Error refreshing full coin list cache:', error);
    }
  }
  return fullCoinListCache;
}

/**
 * Fallback function to find a coin ID from the full list for less common coins.
 */
async function getCoinIdBySymbol_Fallback(symbol: string): Promise<string | null> {
  const list = await getFullCoinList();
  if (!list || list.length === 0) return null;

  const normalizedSymbol = symbol.toLowerCase();
  
  // Find all potential matches for the symbol.
  const potentialMatches = list.filter(coin => coin.symbol.toLowerCase() === normalizedSymbol);

  if (potentialMatches.length === 0) return null;
  if (potentialMatches.length === 1) return potentialMatches[0].id;
  
  // If multiple matches, prefer the one where the id is the symbol itself, or the shortest one.
  const perfectMatch = potentialMatches.find(coin => coin.id.toLowerCase() === normalizedSymbol);
  if(perfectMatch) return perfectMatch.id;

  potentialMatches.sort((a, b) => a.id.length - b.id.length);
  return potentialMatches[0].id;
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 });
  }

  const normalizedSymbol = symbol.toLowerCase();

  try {
    // 1. Check the preloaded top 200 cache first.
    const topCoins = await getTopCoinsMap();
    if (topCoins[normalizedSymbol]) {
      return NextResponse.json({ iconUrl: topCoins[normalizedSymbol] });
    }

    // 2. If not in the top 200, perform a fallback search using the full list.
    const id = await getCoinIdBySymbol_Fallback(normalizedSymbol);
    if (!id) {
      return NextResponse.json({ iconUrl: null, error: 'Symbol not found in full list' }, { status: 404 });
    }

    // 3. Fetch details for the found ID.
    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    if (!coinRes.ok) {
      return NextResponse.json({ iconUrl: null, error: 'Failed to fetch coin details' }, { status: coinRes.status });
    }
    const coinData = await coinRes.json();
    const iconUrl = coinData.image?.large || coinData.image?.small || null;
    
    return NextResponse.json({ iconUrl });

  } catch (err) {
    console.error(`An unexpected error occurred while fetching the icon for symbol ${symbol}:`, err);
    return NextResponse.json({ iconUrl: null, error: 'Internal server error while fetching icon' }, { status: 500 });
  }
}
