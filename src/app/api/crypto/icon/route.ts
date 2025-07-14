
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

        // Special case for JTO, as its symbol in coingecko is 'jito' but we use 'jto'
        if (normalizedSymbol === 'jto') {
            const jtoCoin = coinsList.find(coin => coin.id === 'jito');
            if (jtoCoin) {
                 console.log(`[API] Found special case ID for jto: ${jtoCoin.id}`);
                 return jtoCoin.id;
            }
        }
        
        // Find all coins with the matching symbol.
        const potentialMatches = coinsList.filter(coin => coin.symbol.toLowerCase() === normalizedSymbol);

        if (potentialMatches.length === 0) {
            console.log(`[API] Could not find any coin with symbol: ${normalizedSymbol}`);
            return null;
        }

        if (potentialMatches.length === 1) {
            console.log(`[API] Found unique match for ${normalizedSymbol}: ${potentialMatches[0].id}`);
            return potentialMatches[0].id;
        }

        // Heuristic: When multiple coins share a symbol, the main one often has the simplest/shortest ID.
        // e.g., for 'eth', we want 'ethereum', not 'ethereum-pow' or other variants.
        // Sort by the length of the ID string, ascending.
        potentialMatches.sort((a, b) => a.id.length - b.id.length);
        const bestMatch = potentialMatches[0];

        console.log(`[API] Found best match for ${normalizedSymbol} (out of ${potentialMatches.length}): ${bestMatch.id}`);
        return bestMatch.id;

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
        // Use large for better quality, fallback to thumb
        const iconUrl = data.image?.large || data.image?.thumb || null;
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
