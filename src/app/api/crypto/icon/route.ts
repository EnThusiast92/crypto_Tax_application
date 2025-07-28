
import {NextRequest, NextResponse} from 'next/server';

// This is a more robust route to fetch a single coin's data.
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({error: 'Symbol query parameter is required'}, {status: 400});
  }

  try {
    // 1. Use CoinGecko's search endpoint to find the coin by symbol.
    // This is more direct than fetching the entire list.
    const searchResp = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
    if (!searchResp.ok) {
        return NextResponse.json({ error: 'Failed to search for coin on CoinGecko' }, { status: searchResp.status });
    }
    const searchData: { coins: { id: string; symbol: string; large: string; }[] } = await searchResp.json();
    
    // Find the best match (often the first result for a direct symbol lookup)
    const coin = searchData.coins?.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());

    if (!coin || !coin.large) {
        return NextResponse.json({ error: `Icon for symbol '${symbol}' not found on CoinGecko` }, { status: 404 });
    }

    // 2. The search result directly contains the 'large' image url.
    const iconUrl = coin.large;

    return NextResponse.json({iconUrl});
  } catch (error) {
    console.error(`API Error fetching icon for ${symbol}:`, error);
    return NextResponse.json({error: 'An internal server error occurred'}, {status: 500});
  }
}
