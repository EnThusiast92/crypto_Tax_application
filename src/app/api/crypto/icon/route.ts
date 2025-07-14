// /src/app/api/crypto/icon/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Coin {
  id: string;
  symbol: string;
  name: string;
}

// In-memory cache for the coins list
let coinsList: Coin[] | null = null;
let symbolToIdMap: Map<string, string> | null = null;

const FALLBACK_ICON_URL = '/default-icon.png'; // A path to a default icon in your public folder

async function getCoinsList() {
  if (coinsList && symbolToIdMap) {
    return;
  }
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!response.ok) {
      throw new Error('Failed to fetch coins list from CoinGecko');
    }
    const data: Coin[] = await response.json();
    coinsList = data;
    symbolToIdMap = new Map(coinsList.map(coin => [coin.symbol.toLowerCase(), coin.id]));
  } catch (error) {
    console.error('CoinGecko API error:', error);
    coinsList = null; // Reset cache on error
    symbolToIdMap = null;
  }
}

async function getCoinDetails(id: string) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.image?.thumb || null;
    } catch (error) {
        console.error(`Failed to fetch details for coin ${id}:`, error);
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
  await getCoinsList();
  
  if (!symbolToIdMap) {
      return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  const coinId = symbolToIdMap.get(symbol.toLowerCase());

  if (!coinId) {
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  const iconUrl = await getCoinDetails(coinId);
  
  if (!iconUrl) {
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  return NextResponse.json({ iconUrl });
}
