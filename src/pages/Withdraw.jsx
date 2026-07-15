import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createWithdrawal } from '../services/db.js';

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];
const WITHDRAWAL_FEE_RATE = 0.01; // 1% illustrative network fee

function Withdraw() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const balance = 50000;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [allocationId, setAllocationId] = useState('');
  const [status, setStatus] = useState(null); // { tone: 'success' | 'error' | 'info', message }
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount) || 0;
  const fee = numericAmount * WITHDRAWAL_FEE_RATE;
  const netReceived = Math.max(numericAmount - fee, 0);
  const insufficient = numericAmount > Number(balance || 0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) {
      setStatus({ tone: 'error', message: 'Enter a valid withdrawal amount.' });
      return;
    }

    setLoading(true);
    setStatus({ tone: 'info', message: 'Processing withdrawal…' });

    try {
      await createWithdrawal(user.id, numericAmount, method, allocationId.trim() || null);
      setStatus({
        tone: 'success',
        message: `Withdrawal of ${fmt(numericAmount)} via ${
          method === 'bank' ? 'bank transfer' : 'crypto wallet'
        } initiated.`,
      });
      setAmount('');
      setAllocationId('');
    } catch (err) {
      if (err.message.includes('Insufficient funds')) {
        setStatus({
          tone: 'info',
          message:
            'Available balance is insufficient. Enter an Allocation ID to withdraw against a launchpad allocation.',
        });
      } else if (err.message.includes('Allocation ID not found')) {
        setStatus({
          tone: 'error',
          message: 'Allocation ID not found, ',
          actionLabel: 'generate an allocation ID.',
          onAction: () => navigate('/generate-allocation-id'),
        });
      } else {
        setStatus({ tone: 'error', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Liquidity"
        title="Withdraw funds"
        description="Move assets from your Goblin account to a linked bank or wallet."
      />

      <div className="split-grid">
        <form className="panel withdraw-form" onSubmit={handleWithdraw}>
          <div className="form-block">
            <label className="field-label" htmlFor="withdraw-amount">
              Amount (USD)
            </label>
            <div className="amount-input">
              <span className="currency-prefix">$</span>
              <input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="quick-amounts">
              {QUICK_AMOUNTS.map((q) => (
                <button type="button" key={q} className="chip" onClick={() => setAmount(String(q))}>
                  {fmt(q)}
                </button>
              ))}
              <button
                type="button"
                className="chip"
                onClick={() => setAmount(String(balance || 0))}
              >
                Max
              </button>
            </div>
          </div>

          <div className="form-block">
            <label className="field-label" htmlFor="withdraw-method">
              Destination
            </label>
            <select
              id="withdraw-method"
              className="select-input"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Crypto Wallet</option>
            </select>
          </div>

          <div className="form-block allocation-block">
            <label className="field-label" htmlFor="withdraw-allocation">
              Allocation ID
            </label>
            <input
              id="withdraw-allocation"
              type="text"
              className="text-input"
              value={allocationId}
              onChange={(e) => setAllocationId(e.target.value)}
            />
            <p className="field-hint">
              Enter your Allocation ID
            </p>
            <button
              type="button"
              className="ghost-button allocation-generate-btn"
              onClick={() => navigate('/generate-allocation-id')}
            >
              Generate an allocation ID
            </button>
          </div>

          <button type="submit" className="primary-button full-width" disabled={loading}>
            {loading ? 'Processing…' : 'Request withdrawal'}
          </button>

          {status && (
            <p className={`status-message ${status.tone}`}>
              {status.message}
              {status.actionLabel && (
                <button type="button" className="status-link" onClick={status.onAction}>
                  {status.actionLabel}
                </button>
              )}
            </p>
          )}
        </form>

        <aside className="panel withdraw-summary">
          <SectionHeader eyebrow="Overview" title="Withdrawal summary" />
          <div className="balance-hero">
            <span>Available balance</span>
            <strong>{fmt(balance)}</strong>
          </div>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Withdrawal amount</span>
              <strong>{fmt(numericAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Destination</span>
              <strong>{method === 'bank' ? 'Bank transfer' : 'Crypto wallet'}</strong>
            </div>
            <div className="summary-row">
              <span>Estimated fee (1%)</span>
              <strong>{fmt(fee)}</strong>
            </div>
            <div className="summary-row total">
              <span>You receive</span>
              <strong>{fmt(netReceived)}</strong>
            </div>
          </div>

          {insufficient && !allocationId && (
            <p className="summary-note">
              This amount exceeds your available balance. Add an Allocation ID to cover the
              shortfall from a launchpad allocation.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default Withdraw;
