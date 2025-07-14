// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

let coinListCache: any[] = [];
let cacheTimestamp = 0;

// This function fetches the full coin list and caches it for 24 hours.
async function getCoinList() {
  const now = Date.now();
  if (coinListCache.length === 0 || now - cacheTimestamp > 86400000) { // 24 hours
    try {
      console.log('Refreshing CoinGecko coin list cache...');
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (!res.ok) {
        throw new Error(`Failed to fetch coin list: ${res.statusText}`);
      }
      coinListCache = await res.json();
      cacheTimestamp = now;
      console.log('CoinGecko coin list cache refreshed successfully.');
    } catch (error) {
      console.error('Error refreshing CoinGecko coin list cache:', error);
      // Return stale cache if available, otherwise it will be empty
    }
  }
  return coinListCache;
}

// This function finds the most likely correct CoinGecko ID for a given symbol.
// It prioritizes coins where the id or name is a close match to the symbol.
async function getCoinIdBySymbol(symbol: string): Promise<string | null> {
  const normalizedSymbol = symbol.toLowerCase();
  
  // Hardcoded exception for JTO as its symbol in CoinGecko is 'jito'
  if (normalizedSymbol === 'jto') {
      return 'jito-governance-token';
  }

  const list = await getCoinList();
  if (!list || list.length === 0) {
      console.error('Coin list is empty, cannot perform lookup.');
      return null;
  }

  const potentialMatches = list.filter(coin => coin.symbol.toLowerCase() === normalizedSymbol);

  if (potentialMatches.length === 0) {
    console.log(`No match found for symbol: ${normalizedSymbol}`);
    return null;
  }

  if (potentialMatches.length === 1) {
    return potentialMatches[0].id;
  }

  // If multiple matches, try to find the best one.
  // 1. Prefer an exact match on id (e.g., symbol 'btc' -> id 'bitcoin' is common)
  let bestMatch = potentialMatches.find(coin => coin.id.toLowerCase() === normalizedSymbol);
  if (bestMatch) return bestMatch.id;
  
  // 2. Prefer a match where the name is very similar to the symbol
  bestMatch = potentialMatches.find(coin => coin.name.toLowerCase() === normalizedSymbol);
  if (bestMatch) return bestMatch.id;

  // 3. Fallback to the first result if other heuristics fail
  return potentialMatches[0].id;
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 });
  }

  try {
    const id = await getCoinIdBySymbol(symbol);
    if (!id) {
        console.log(`Symbol not found in cache for: ${symbol}`);
        return NextResponse.json({ iconUrl: null, error: 'Symbol not found' }, { status: 404 });
    }

    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
     if (!coinRes.ok) {
      console.error(`Failed to fetch details for coin ID ${id}`);
      return NextResponse.json({ iconUrl: null, error: 'Failed to fetch coin details' }, { status: coinRes.status });
    }
    const coinData = await coinRes.json();
    const iconUrl = coinData.image?.large || coinData.image?.thumb || coinData.image?.small || null;
    
    if(!iconUrl){
      console.log(`Icon URL not found for coin ID: ${id}`);
    }

    return NextResponse.json({ iconUrl });
  } catch (err) {
    console.error(`Error fetching CoinGecko icon for symbol ${symbol}:`, err);
    return NextResponse.json({ iconUrl: null, error: 'Failed to fetch icon' }, { status: 500 });
  }
}
