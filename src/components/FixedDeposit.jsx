import { useMemo, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { fixedDeposits } from '../data/marketData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { createDeposit } from '../services/db.js';

function FixedDeposit() {
  const [amount, setAmount] = useState(5000);
  const [selectedPlan, setSelectedPlan] = useState(fixedDeposits[1]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const estimatedYield = useMemo(() => {
    const apy = Number(selectedPlan.apy.replace('%', ''));
    return amount * (apy / 100);
  }, [amount, selectedPlan]);

  const handleLockDeposit = async () => {
    if (!user) {
      setStatus('Please sign in to lock a deposit');
      return;
    }
    if (amount < Number(selectedPlan.min.replace('$', '').replace(',', ''))) {
      setStatus(`Minimum deposit is ${selectedPlan.min}`);
      return;
    }
    if (amount > Number(selectedPlan.max.replace('$', '').replace(',', ''))) {
      setStatus(`Maximum deposit is ${selectedPlan.max}`);
      return;
    }

    setLoading(true);
    setStatus('Processing deposit...');

    try {
      const apy = Number(selectedPlan.apy.replace('%', ''));
      const termDays = Number(selectedPlan.term.replace(' days', ''));
      await createDeposit(user.id, amount, selectedPlan.name, apy, termDays);
      setStatus(`Deposit of $${amount.toLocaleString()} locked in ${selectedPlan.name} at ${selectedPlan.apy} APY.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Fixed deposit"
        title="Goblin vault deposits"
        description="Lock stable assets into timed vaults with transparent APY estimates."
      />

      <div className="split-grid">
        <div className="card-grid">
          {fixedDeposits.map((plan) => (
            <article
              key={plan.name}
              className={`vault-card ${selectedPlan.name === plan.name ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setSelectedPlan(plan);
              }}
            >
              <span className="vault-glow" style={{ backgroundColor: plan.color }} />
              <div className="vault-topline">
                <strong>{plan.name}</strong>
                <small>{plan.risk} risk</small>
              </div>
              <h3>{plan.apy} APY</h3>
            </article>
          ))}
        </div>

        <aside className="panel deposit-calculator">
          <SectionHeader
            eyebrow="Yield preview"
            title="Estimate your return"
          />
          <label>
            Deposit amount
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>
          <div className="yield-summary">
            <span>Selected vault</span>
            <strong>{selectedPlan.name}</strong>
            <span>Estimated yield</span>
            <strong>${estimatedYield.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>
          <button
            className="primary-button full-width"
            type="button"
            onClick={handleLockDeposit}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Lock deposit'}
          </button>
          {status && <p className="status-message">{status}</p>}
        </aside>
      </div>
    </section>
  );
}

export default FixedDeposit;
