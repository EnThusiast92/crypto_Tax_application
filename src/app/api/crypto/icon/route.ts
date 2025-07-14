// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

// These variables will cache the data in memory for the lifetime of the server instance.
let coinListCache: any[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches the full list of coins from CoinGecko and caches it.
 */
async function getCoinList() {
  const now = Date.now();
  if (coinListCache.length === 0 || now - cacheTimestamp > CACHE_DURATION) {
    try {
      console.log('Refreshing CoinGecko coin list cache...');
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (!res.ok) {
        throw new Error(`Failed to fetch coin list: ${res.statusText}`);
      }
      coinListCache = await res.json();
      cacheTimestamp = now;
      console.log(`CoinGecko coin list cache refreshed successfully. Found ${coinListCache.length} coins.`);
    } catch (error) {
      console.error('Error refreshing CoinGecko coin list cache:', error);
      // If fetching fails, we'll continue using the stale cache if it exists.
    }
  }
  return coinListCache;
}

/**
 * Finds the most likely CoinGecko ID for a given symbol.
 * This is the crucial step: it matches the SYMBOL you provide (e.g., "xrp")
 * to the SYMBOL in the CoinGecko list to find the correct ID (e.g., "ripple").
 */
async function getCoinIdBySymbol(symbol: string): Promise<string | null> {
  const normalizedSymbol = symbol.toLowerCase();
  const list = await getCoinList();

  if (!list || list.length === 0) {
    console.error('Coin list is empty, cannot perform lookup.');
    return null;
  }
  
  // Handle specific known exceptions where the symbol is not the primary one.
  if (normalizedSymbol === 'jto') {
    return 'jito-governance-token';
  }

  // Find all potential coins that match the symbol.
  const potentialMatches = list.filter(coin => coin.symbol.toLowerCase() === normalizedSymbol);

  if (potentialMatches.length === 0) {
    console.log(`No match found for symbol: ${normalizedSymbol}`);
    return null;
  }
  
  if (potentialMatches.length === 1) {
    return potentialMatches[0].id;
  }

  // If there are multiple matches, we apply a simple heuristic.
  // Prefer the coin where the id is the simplest (shortest), as primary assets
  // often have simpler IDs (e.g., "bitcoin" vs. "wrapped-bitcoin").
  potentialMatches.sort((a, b) => a.id.length - b.id.length);
  return potentialMatches[0].id;
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 });
  }

  try {
    // STEP 1: Get the CoinGecko ID for the given symbol by matching the symbol.
    const id = await getCoinIdBySymbol(symbol);
    
    if (!id) {
        console.log(`Could not resolve a CoinGecko ID for symbol: ${symbol}`);
        return NextResponse.json({ iconUrl: null, error: 'Symbol not found' }, { status: 404 });
    }

    // STEP 2: Use the found ID to fetch the coin's detailed data.
    const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    if (!coinRes.ok) {
      console.error(`Failed to fetch details for coin ID ${id} (symbol: ${symbol}). Status: ${coinRes.statusText}`);
      return NextResponse.json({ iconUrl: null, error: 'Failed to fetch coin details' }, { status: coinRes.status });
    }
    const coinData = await coinRes.json();
    
    // Extract the large icon URL, falling back to thumb or small if it doesn't exist.
    const iconUrl = coinData.image?.large || coinData.image?.thumb || coinData.image?.small || null;
    
    if(!iconUrl){
      console.log(`Icon URL not found in data for coin ID: ${id}`);
    }

    return NextResponse.json({ iconUrl });
  } catch (err) {
    console.error(`An unexpected error occurred while fetching the icon for symbol ${symbol}:`, err);
    return NextResponse.json({ iconUrl: null, error: 'Internal server error while fetching icon' }, { status: 500 });
  }
}
