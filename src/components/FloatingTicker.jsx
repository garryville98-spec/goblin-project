 import { cryptoPrices } from '../data/marketData.js';

function FloatingTicker() {
  const tickerItems = [...cryptoPrices, ...cryptoPrices];

  return (
    <div className="ticker-wrap" aria-label="Floating cryptocurrency prices">
      <div className="ticker-track">
        {tickerItems.map((coin, index) => {
          const isPositive = coin.change >= 0;
          const key = `${coin.symbol}-${index}`;

          return (
            <div className="ticker-item" key={key}>
              <strong>{coin.symbol}/USDT</strong>
              <span>${coin.price.toLocaleString()}</span>
              <small className={isPositive ? 'positive-text' : 'negative-text'}>
                {isPositive ? '+' : ''}{coin.change}%
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FloatingTicker;
