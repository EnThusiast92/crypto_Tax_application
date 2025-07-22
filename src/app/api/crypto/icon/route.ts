
import {NextRequest, NextResponse} from 'next/server';

// This is a simplified, single-purpose route to fetch one coin's data.
// It avoids complex caching logic as it's meant for on-demand fallbacks.
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({error: 'Symbol query parameter is required'}, {status: 400});
  }

  try {
    // 1. Fetch the full list to find the coin's ID
    const listResp = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!listResp.ok) {
        return NextResponse.json({ error: 'Failed to fetch coin list from CoinGecko' }, { status: listResp.status });
    }
    const coinList: { id: string; symbol: string }[] = await listResp.json();
    const coin = coinList.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());

    if (!coin) {
        return NextResponse.json({ error: `Coin with symbol '${symbol}' not found` }, { status: 404 });
    }
    
    // 2. Fetch the specific coin's market data to get the image
    const marketResp = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin.id}`);
     if (!marketResp.ok) {
        return NextResponse.json({ error: 'Failed to fetch coin market data from CoinGecko' }, { status: marketResp.status });
    }
    const marketData: { image?: string }[] = await marketResp.json();
    const iconUrl = marketData[0]?.image;

    if (!iconUrl) {
      return NextResponse.json({ error: 'Icon URL not found for this coin' }, { status: 404 });
    }

    return NextResponse.json({iconUrl});
  } catch (error) {
    console.error(`API Error fetching icon for ${symbol}:`, error);
    return NextResponse.json({error: 'An internal server error occurred'}, {status: 500});
  }
}
