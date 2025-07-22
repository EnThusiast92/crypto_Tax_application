// app/api/crypto/icon/route.ts

import { NextResponse } from 'next/server';

let coinListCache: { [symbol: string]: string } = {}; let cacheTimestamp = 0;

async function getCoinGeckoId(symbol: string): Promise<string | null> { const now = Date.now(); // Refresh cache every 24 hours if (Object.keys(coinListCache).length === 0 || now - cacheTimestamp > 86400000) { const res = await fetch('https://api.coingecko.com/api/v3/coins/list'); const data = await res.json(); coinListCache = {}; for (const coin of data) { coinListCache[coin.symbol.toLowerCase()] = coin.id; } cacheTimestamp = now; }

return coinListCache[symbol.toLowerCase()] || null; }

export async function GET(request: Request) { const { searchParams } = new URL(request.url); const symbol = searchParams.get('symbol');

if (!symbol) { return NextResponse.json({ iconUrl: null, error: 'Missing symbol' }, { status: 400 }); }

try { const id = await getCoinGeckoId(symbol); if (!id) { return NextResponse.json({ iconUrl: null, error: 'Symbol not found' }, { status: 404 }); }

const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
const coinData = await coinRes.json();
const iconUrl = coinData.image?.thumb || coinData.image?.small || null;

return NextResponse.json({ iconUrl });

} catch (err) { console.error('Error fetching CoinGecko icon:', err); return NextResponse.json({ iconUrl: null, error: 'Failed to fetch icon' }, { status: 500 }); } }