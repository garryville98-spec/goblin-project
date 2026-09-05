import { useCryptoPrices } from '../hooks/useCryptoPrices.js';

function FloatingTicker() {
  const { prices, loading } = useCryptoPrices();
  const tickerItems = loading ? [] : [...prices, ...prices];

  if (loading) {
    return (
      <div className="ticker-wrap" aria-label="Floating cryptocurrency prices">
        <div className="ticker-track">
          <div className="ticker-item">Loading live prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticker-wrap" aria-label="Floating cryptocurrency prices">
      <div className="ticker-track">
        {tickerItems.map((coin, index) => {
          const isPositive = coin.change >= 0;
          const key = `${coin.symbol}-${index}`;

          return (
            <div className="ticker-item" key={key}>
              <strong>{coin.symbol}/USDT</strong>
              <span>${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <small className={isPositive ? 'positive-text' : 'negative-text'}>
                {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FloatingTicker;
