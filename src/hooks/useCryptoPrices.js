import { useState, useEffect } from 'react';

const COIN_MAP = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
];

const FALLBACK_PRICES = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64492.41, change: -0.54, volume: '$42.8B' },
  { symbol: 'SOL', name: 'Solana', price: 75.91, change: 0.90, volume: '$4.1B' },
  { symbol: 'ETH', name: 'Ethereum', price: 1863.50, change: 0.05, volume: '$18.6B' },
  { symbol: 'BNB', name: 'BNB', price: 567.53, change: -0.72, volume: '$1.7B' },
];

export function useCryptoPrices() {
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const ids = COIN_MAP.map((c) => c.id).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`CoinGecko API responded with status ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        const updated = COIN_MAP.map((coin) => {
          const coinData = data[coin.id];
          return {
            symbol: coin.symbol,
            name: coin.name,
            price: coinData?.usd ?? FALLBACK_PRICES.find((p) => p.symbol === coin.symbol).price,
            change: coinData?.usd_24h_change ?? FALLBACK_PRICES.find((p) => p.symbol === coin.symbol).change,
            volume: FALLBACK_PRICES.find((p) => p.symbol === coin.symbol).volume,
          };
        });

        setPrices(updated);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.warn('[goblin] Failed to fetch live crypto prices, using fallback:', err.message);
          setError(err.message);
          setPrices(FALLBACK_PRICES);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrices();

    // Refresh prices every 60 seconds to avoid hitting CoinGecko rate limits.
    const interval = setInterval(fetchPrices, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { prices, loading, error };
}
