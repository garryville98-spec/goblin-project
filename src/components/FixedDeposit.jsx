import { useMemo, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { fixedDeposits, cryptoPrices } from '../data/marketData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { createDeposit } from '../services/db.js';

// Hardcoded BNB deposit address used for all wallet funding transactions.
const BNB_WALLET =
  import.meta.env.VITE_BNB_WALLET || '0x9668A3d0C429C64b8a2c3d3Ba84bC6EbFECbcBe3';
const bnbPrice = cryptoPrices.find((c) => c.symbol === 'BNB')?.price || 0;

function FixedDeposit() {
  const [amount, setAmount] = useState(5000);
  const [selectedPlan, setSelectedPlan] = useState(fixedDeposits[1]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const estimatedYield = useMemo(() => {
    const apy = Number(selectedPlan.apy.replace('%', ''));
    return amount * (apy / 100);
  }, [amount, selectedPlan]);

  const bnbAmount = bnbPrice ? (amount / bnbPrice).toFixed(6) : null;

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(BNB_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

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
      // Reveal the BNB deposit address so the user can fund the vault, just
      // like the Cash Balance funding flow.
      setShowDeposit(true);
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
          {showDeposit && (
            <article className="panel payment-box deposit-address-section">
              <SectionHeader
                eyebrow="Deposit"
                title={`${selectedPlan.name} · Fund Your Vault`}
              />
              <p className="funding-note">
                Send the BNB amount below to the deposit address to fund your fixed deposit vault.
              </p>
              <div className="qr-code-container">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(BNB_WALLET)}`}
                  alt="QR Code for BNB deposit address"
                  className="qr-code-image"
                />
              </div>
              <div className="deposit-details">
                <div className="wallet-row">
                  <code className="wallet-address">{BNB_WALLET}</code>
                  <button className="ghost-button" type="button" onClick={copyWallet}>
                    {copied ? 'Copied' : 'Copy Address'}
                  </button>
                </div>
                <div className="deposit-summary">
                  <div className="deposit-summary-row">
                    <span>Funding Amount (USD)</span>
                    <strong>${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="deposit-summary-row">
                    <span>BNB / USD Rate</span>
                    <strong>${bnbPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="deposit-summary-row total">
                    <span>Send (BNB)</span>
                    <strong>{bnbAmount ? `${bnbAmount} BNB` : '—'}</strong>
                  </div>
                </div>
              </div>
            </article>
          )}
        </aside>
      </div>
    </section>
  );
}

export default FixedDeposit;
