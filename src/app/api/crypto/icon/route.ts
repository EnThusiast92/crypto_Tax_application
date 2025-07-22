// app/api/crypto/icon/route.ts
import { NextResponse } from 'next/server';

// In-memory cache for symbol→id mapping (avoid hammering the CoinGecko „/coins/list“ on every request)
let symbolToIdMap: Record<string,string> | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function ensureMap() {
  const now = Date.now();
  if (symbolToIdMap && (now - lastFetchTimestamp < CACHE_DURATION)) {
    return;
  }
  
  console.log('Fetching fresh coin list from CoinGecko...');
  try {
    const resp = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!resp.ok) {
        console.error(`CoinGecko API /coins/list fetch failed: ${resp.status}`);
        throw new Error(`List fetch failed: ${resp.status}`);
    }
    const list: { id: string; symbol: string }[] = await resp.json();
    const newMap: Record<string, string> = {};
    for (const coin of list) {
        newMap[coin.symbol.toLowerCase()] = coin.id;
    }
    symbolToIdMap = newMap;
    lastFetchTimestamp = now;
    console.log('Successfully fetched and cached the coin list.');
  } catch (error) {
    console.error('Error fetching or processing CoinGecko coin list:', error);
    // If fetching fails, we prevent further requests for the cache duration to avoid spamming the API.
    lastFetchTimestamp = now; 
    throw error; // Re-throw to be caught by the handler
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol || typeof symbol !== 'string') {
    return NextResponse.json({ error: 'Symbol query param is required' }, { status: 400 });
  }
  const sym = symbol.toLowerCase();

  try {
    await ensureMap();
    if (!symbolToIdMap) {
        // This case handles when ensureMap fails to populate the map
        return NextResponse.json({ error: 'Failed to build symbol map from CoinGecko' }, { status: 503 });
    }

    const coinId = symbolToIdMap[sym];
    if (!coinId) {
      return NextResponse.json({ error: `no coin id for symbol "${symbol}"` }, { status: 404 });
    }

    // Fetch coin data (we only need the image field)
    const coinResp = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}` +
      `?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
    );

    if (!coinResp.ok) {
      console.error(`Failed to fetch coin data for ID: ${coinId}. Status: ${coinResp.status}`);
      return NextResponse.json({ error: 'failed to fetch coin data' }, { status: coinResp.status });
    }

    const coinData: { image?: { thumb: string; small: string; large: string } } = await coinResp.json();
    const iconUrl = coinData.image?.small || coinData.image?.thumb;
    if (!iconUrl) {
      return NextResponse.json({ error: 'no image available' }, { status: 404 });
    }

    return NextResponse.json({ iconUrl });
  } catch (err: any) {
    console.error('API /crypto/icon error:', err);
    return NextResponse.json({ error: err.message || 'internal server error' }, { status: 500 });
  }
}
