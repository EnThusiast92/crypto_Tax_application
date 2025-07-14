// /src/app/api/crypto/icon/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Coin {
  id: string;
  symbol: string;
  name: string;
}

// A path to a generic icon in your public folder. 
// Note: This path is resolved by the client, not the server.
const FALLBACK_ICON_URL = '/generic-crypto-icon.svg'; 

async function getCoinIdBySymbol(symbol: string): Promise<string | null> {
    const normalizedSymbol = symbol.toLowerCase();
    try {
        console.log(`[API] Fetching coins list to find ID for symbol: ${normalizedSymbol}`);
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list', { next: { revalidate: 3600 } }); // Revalidate once per hour
        if (!response.ok) {
            console.error(`[API] Failed to fetch coins list from CoinGecko, status: ${response.status}`);
            return null;
        }
        const coinsList: Coin[] = await response.json();
        
        // Prioritize exact ID match for common assets to avoid conflicts (e.g. btc vs wbtc)
        const exactMatch = coinsList.find(coin => coin.id.toLowerCase() === normalizedSymbol);
        if (exactMatch) {
            console.log(`[API] Found exact ID match for ${normalizedSymbol}: ${exactMatch.id}`);
            return exactMatch.id;
        }
        
        // If no exact match, find the first coin with the matching symbol.
        let foundCoin = coinsList.find(coin => coin.symbol.toLowerCase() === normalizedSymbol);

        // Special case for JTO, as its symbol in coingecko is 'jito'
        if (!foundCoin && normalizedSymbol === 'jto') {
            foundCoin = coinsList.find(coin => coin.id === 'jito');
        }

        if (foundCoin) {
            console.log(`[API] Found ID for ${normalizedSymbol}: ${foundCoin.id}`);
            return foundCoin.id;
        } else {
            console.log(`[API] Could not find ID for symbol: ${normalizedSymbol}`);
            return null;
        }
    } catch (error) {
        console.error('[API] Error in getCoinIdBySymbol:', error);
        return null;
    }
}

async function getCoinIconById(id: string): Promise<string | null> {
    try {
        console.log(`[API] Fetching details for coin ID: ${id}`);
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
        if (!response.ok) {
            console.error(`[API] Failed to fetch details for coin ${id}, status: ${response.status}`);
            return null;
        }
        const data = await response.json();
        const iconUrl = data.image?.thumb || null;
        if (iconUrl) {
            console.log(`[API] Found icon for ${id}: ${iconUrl}`);
        } else {
            console.log(`[API] No icon URL found in details for ${id}`);
        }
        return iconUrl;
    } catch (error) {
        console.error(`[API] Error in getCoinIconById for ${id}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  const coinId = await getCoinIdBySymbol(symbol);

  if (!coinId) {
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  const iconUrl = await getCoinIconById(coinId);
  
  if (!iconUrl) {
    return NextResponse.json({ iconUrl: FALLBACK_ICON_URL });
  }

  return NextResponse.json({ iconUrl });
}
