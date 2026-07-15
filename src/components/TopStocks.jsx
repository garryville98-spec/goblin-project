import SectionHeader from './SectionHeader.jsx';
import { topStocks } from '../data/marketData.js';

function TopStocks() {
  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Top stocks to trade"
        title="Goblin market scanner"
        description="High-momentum stocks and crypto-linked equities."
        actionLabel="Export watchlist"
      />

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Sector</th>
              <th>Market Cap</th>
              <th>Goblin Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {topStocks.map((stock) => (
              <tr key={stock.symbol}>
                <td><strong>{stock.symbol}</strong></td>
                <td>{stock.name}</td>
                <td>${stock.price.toLocaleString()}</td>
                <td className={stock.change >= 0 ? 'positive-text' : 'negative-text'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </td>
                <td>{stock.sector}</td>
                <td>{stock.marketCap}</td>
                <td>
                  {stock.allocation ? (
                    <div className="score-cell">
                      <span>{stock.allocation}%</span>
                      <div className="mini-bar">
                        <span style={{ width: `${stock.allocation}%` }} />
                      </div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="tiny-button buy" type="button" onClick={() => alert('activate current tier')}>Buy</button>
                    <button className="tiny-button sell" type="button" onClick={() => alert('activate current tier')}>Sell</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TopStocks;
