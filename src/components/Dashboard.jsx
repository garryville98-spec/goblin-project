import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingTicker from './FloatingTicker.jsx';
import SectionHeader from './SectionHeader.jsx';
import Assets from './Assets.jsx';
import { dashboardSnapshot, topStocks } from '../data/marketData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePortfolio } from '../hooks/usePortfolio.js';

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const PORTFOLIO_TOTAL = 50000;

// Demo capital allocation: total $50,000. Available cash is now $0; the
// $18,600 previously shown as available cash is represented as Liquid asset.
const capitalAllocation = [
  { label: 'Available cash', amount: 0, color: '#59ff9b' },
  { label: 'Liquid asset', amount: 18600, color: '#4dd0e1' },
  { label: 'Fixed deposits', amount: 22400, color: '#ffd166' },
  { label: 'Stakepools', amount: 6000, color: '#a78bfa' },
  { label: 'Launchpad reserve', amount: 3000, color: '#ff5f7a' },
].map((a) => ({
  ...a,
  value: `${Math.round((a.amount / PORTFOLIO_TOTAL) * 100)}%`,
  amount: fmt(a.amount),
}));

const signals = [
  { label: 'Market regime', value: 'Accumulation', detail: 'Major crypto pairs are forming higher lows.' },
  { label: 'Liquidity depth', value: 'Strong', detail: 'BTC and ETH order books show healthy depth.' },
  { label: 'Yield opportunity', value: '14.5% APY', detail: 'Goblin Growth Vault remains the preferred vault.' },
];

const quickActions = [
  { label: 'Deposit assets', action: 'Fund vault' },
  { label: 'Stake portfolio', action: 'Earn yield' },
  { label: 'Join launchpad', action: 'Reserve allocation' },
];

function Dashboard() {
  const { user } = useAuth();
  const { loading, error, activity } = usePortfolio(user?.id);
  const navigate = useNavigate();
  const [goldTierActivated, setGoldTierActivated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleActivate = () => {
    setGoldTierActivated(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/create-wallet');
    }, 1500);
  };

  return (
    <section className="page-grid">
      <FloatingTicker />

      <div className={`hero-card premium-hero ${goldTierActivated ? 'gold-active' : ''}`}>
        <div className="hero-copy">
          <span className="eyebrow">{dashboardSnapshot.title}</span>
          <h2>$Goblin Private Capital</h2>
          <p>Simple access to markets, yield, and launches.</p>
          <div className="hero-badges">
            <span>Markets</span>
            <span>Yield</span>
            <span>Launches</span>
            {goldTierActivated && <span className="premium-badge">Premium Active</span>}
          </div>
          <button
            className={`gold-tier-button ${goldTierActivated ? 'activated' : ''}`}
            type="button"
            onClick={handleActivate}
            disabled={goldTierActivated}
          >
            {goldTierActivated ? (
              <>
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Gold Tier Activated
              </>
            ) : (
              'Activate gold tier'
            )}
          </button>
        </div>

        <aside className="hero-side-panel">
          <span>Portfolio health</span>
          <strong>{dashboardSnapshot.healthScore}/100</strong>
          <p>Risk-adjusted allocation score based on current vault, stake, and trading exposure.</p>
          <div className="mini-bar wide">
            <span style={{ width: `${dashboardSnapshot.healthScore}%` }} />
          </div>
          <div className="hero-side-stats">
            <div>
              <small>Available liquidity</small>
              <strong>{dashboardSnapshot.liquidity}</strong>
            </div>
            <div>
              <small>Goblin Alpha</small>
              <strong>{dashboardSnapshot.alphaScore}</strong>
            </div>
          </div>
        </aside>
      </div>

      {showToast && (
        <div className="gold-toast">
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Congratulations! Your Gold Tier has been activated. Redirecting to wallet setup...
        </div>
      )}
      {loading && <div className="status-message">Loading your portfolio…</div>}
      {error && <div className="status-message error">Could not load portfolio: {error}</div>}

      {!loading && !error && (
        <>
          <Assets />

          <div className="dashboard-main-grid">
            <article className="panel wide-panel">
              <SectionHeader
                eyebrow="Capital allocation"
                title="Your investment stack"
                description="Balance trading, vaults, staking, and launchpad reserves."
              />
              <div className="allocation-total">
                <span>Portfolio balance</span>
                <strong>{fmt(PORTFOLIO_TOTAL)}</strong>
              </div>
              <div className="allocation-grid">
                {capitalAllocation.map((item) => (
                  <div className="allocation-item" key={item.label}>
                    <div>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <small>{item.amount}</small>
                    <div className="mini-bar wide">
                      <span style={{ width: item.value, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <SectionHeader
                eyebrow="Goblin signals"
                title="Market intelligence"
              />
              <div className="signal-list">
                {signals.map((signal) => (
                  <div className="signal-item" key={signal.label}>
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.detail}</p>
                  </div>
                ))}
              </div>
              <div className="quick-actions">
                {quickActions.map((action) => (
                  <button className="quick-action" key={action.label} type="button">
                    <span>{action.label}</span>
                    <strong>{action.action}</strong>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <div className="content-grid">
            <article className="panel wide-panel">
              <SectionHeader
                eyebrow="Top stocks"
                title="Markets moving today"
                description="Momentum stocks and crypto-linked equities."
              />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Price</th>
                      <th>24h</th>
                      <th>Sector</th>
                      <th>Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStocks.slice(0, 4).map((stock) => (
                      <tr key={stock.symbol}>
                        <td>
                          <strong>{stock.symbol}</strong>
                          <span>{stock.name}</span>
                        </td>
                        <td>${stock.price.toLocaleString()}</td>
                        <td className={stock.change >= 0 ? 'positive-text' : 'negative-text'}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </td>
                        <td>{stock.sector}</td>
                        <td>
                          {stock.allocation ? (
                            <div className="mini-bar">
                              <span style={{ width: `${stock.allocation}%` }} />
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel">
              <SectionHeader
                eyebrow="Activity"
                title="Recent Goblin moves"
              />
              {activity.length === 0 ? (
                <p className="status-message">No activity yet. Fund your account to get started.</p>
              ) : (
                <div className="activity-list">
                  {activity.map((item, i) => (
                    <div className="activity-item" key={`${item.title}-${i}`}>
                      <span />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <small>{item.time}</small>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
