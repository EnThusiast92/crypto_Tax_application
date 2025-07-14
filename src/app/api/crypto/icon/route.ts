// /src/app/api/crypto/icon/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Coin {
  id: string;
  symbol: string;
  name: string;
}

// In-memory cache for the coins list and details
let coinsList: Coin[] | null = null;
let symbolToIdMap: Map<string, string> | null = null;
const coinDetailsCache = new Map<string, string | null>();

const FALLBACK_ICON_URL = '/generic-crypto-icon.svg'; // A path to a generic icon in your public folder

async function initializeCoinListCache() {
  // If cache is already populated, do nothing.
  if (coinsList && symbolToIdMap) {
    return;
  }
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!response.ok) {
      throw new Error(`Failed to fetch coins list from CoinGecko, status: ${response.status}`);
    }
    const data: Coin[] = await response.json();
    coinsList = data;
    symbolToIdMap = new Map(coinsList.map(coin => [coin.symbol.toLowerCase(), coin.id]));
    console.log('CoinGecko list cached successfully.');
  } catch (error) {
    console.error('CoinGecko API error (coins/list):', error);
    // Reset cache on error to allow for retries on subsequent requests
    coinsList = null; 
    symbolToIdMap = null;
  }
}

async function getCoinIcon(id: string): Promise<string | null> {
    if (coinDetailsCache.has(id)) {
        return coinDetailsCache.get(id)!;
    }
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        if (!response.ok) {
            coinDetailsCache.set(id, null); // Cache failure to avoid refetching
            return null;
        }
        const data = await response.json();
        const iconUrl = data.image?.thumb || null;
        coinDetailsCache.set(id, iconUrl);
        return iconUrl;
    } catch (error) {
        console.error(`Failed to fetch details for coin ${id}:`, error);
        coinDetailsCache.set(id, null); // Cache failure
        return null;
    }
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  // Ensure the coins list is fetched and cached
  await initializeCoinListCache();
  
  if (!symbolToIdMap) {
      // If the list couldn't be fetched, we can't proceed.
      return NextResponse.json({ iconUrl: FALLBACK_ICON_URL }, { status: 500, statusText: "Failed to initialize CoinGecko symbol mapping." });
  }
  
  // Special case for JTO which might not be in the list correctly
  const normalizedSymbol = symbol.toLowerCase();
  const coinId = symbolToIdMap.get(normalizedSymbol);

  if (!coinId) {
    // console.log(`Symbol '${normalizedSymbol}' not found in CoinGecko map.`);
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  const iconUrl = await getCoinIcon(coinId);
  
  if (!iconUrl) {
    // console.log(`Icon not found for coinId '${coinId}'.`);
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  return NextResponse.json({ iconUrl });
}
