import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { stakePools } from '../data/marketData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { createStake } from '../services/db.js';

function StakePool() {
  const [stakeAmounts, setStakeAmounts] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleStake = async (pool) => {
    if (!user) {
      setStatus('Please sign in to stake assets');
      return;
    }
    const amount = Number(stakeAmounts[pool.name] || 0);
    if (amount <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    alert('Activate current tier');
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Stakepool"
        title="Earn yield on Goblin-compatible assets"
        description="Stake crypto assets into curated pools with flexible and locked strategies."
        actionLabel="Create pool"
      />

      {status && <div className="status-message">{status}</div>}

      <div className="pool-grid">
        {stakePools.map((pool) => (
          <article className="panel pool-card" key={pool.name}>
            <div className="pool-icon">{pool.token[0]}</div>
            <div className="pool-header">
              <strong>{pool.name}</strong>
              <span>{pool.lock}</span>
            </div>
            <div className="pool-stats">
              <div>
                <small>APY</small>
                <strong>{pool.apy}</strong>
              </div>
              <div>
                <small>TVL</small>
                <strong>{pool.tvl}</strong>
              </div>
              <div>
                <small>Token</small>
                <strong>{pool.token}</strong>
              </div>
            </div>
            <div className="progress-label">
              <span>Pool capacity</span>
              <strong>{pool.progress}%</strong>
            </div>
            <div className="mini-bar wide">
              <span style={{ width: `${pool.progress}%` }} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <input
                type="number"
                placeholder={`Amount (${pool.token})`}
                value={stakeAmounts[pool.name] || ''}
                onChange={(e) => setStakeAmounts({ ...stakeAmounts, [pool.name]: e.target.value })}
                min="0"
              />
            </div>
            <button
              className="secondary-button full-width"
              type="button"
              onClick={() => handleStake(pool)}
              disabled={!user || loading}
            >
              {loading ? 'Processing...' : 'Stake assets'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StakePool;
