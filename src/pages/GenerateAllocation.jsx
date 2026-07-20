import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { cryptoPrices } from '../data/marketData.js';

// Hardcoded BNB deposit address used for all wallet funding transactions.
const BNB_WALLET =
  import.meta.env.VITE_BNB_WALLET || '0x9668A3d0C429C64b8a2c3d3Ba84bC6EbFECbcBe3';
const bnbPrice = cryptoPrices.find((c) => c.symbol === 'BNB')?.price || 0;
const MIN_FUNDING_RATE = 0.10; // 10% minimum Cash Balance funding requirement

const TIERS = [
  { id: 'black', name: 'Tier One', amount: 25000, color: '#0052ff' },
  { id: 'gold', name: 'Gold Tier', amount: 50000, color: '#b8872e' },
  { id: 'tier-one', name: 'Black Tier', amount: 100000, color: '#0b1220' },
];

const INTRO =
  'Your **Cash Balance** is the foundation of your investment account. Funding your wallet enables efficient portfolio execution, access to exclusive investment opportunities, and continued eligibility for platform features and advisory services.\n\nSelect an **account tier** below to view its size and required minimum funding. The minimum Cash Balance funding requirement is **10% of your selected account size**, and you may deposit any amount above the minimum. Once funded, your balance is immediately available for trading, staking, fixed deposits, and launchpad allocations.';

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Render **bold** segments from the intro copy.
function renderBold(text) {
  return text.split('\n\n').map((paragraph, pIdx) => (
    <p key={pIdx}>
      {paragraph.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </p>
  ));
}

function GenerateAllocation() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [funded, setFunded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');

  const minFunding = selected ? selected.amount * MIN_FUNDING_RATE : 0;
  const fundingAmountNum = Number(fundingAmount) || 0;
  const amountValid = fundingAmountNum >= minFunding && fundingAmountNum > 0;
  const bnbAmount = bnbPrice ? (fundingAmountNum / bnbPrice).toFixed(6) : null;

  const selectTier = (pkg) => {
    setSelected(pkg);
    setShowPayment(false);
    setFunded(false);
    setFundingAmount(String(pkg.amount * MIN_FUNDING_RATE));
  };

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(BNB_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFund = () => {
    if (!amountValid) return;
    // Payment received — now awaiting blockchain confirmation before funds
    // become available. We intentionally do not auto-navigate because the
    // deposit is still being verified on-chain.
    setFunded(true);
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Wallet Funding"
        title="Top Up Your Cash Balance"
        description="Fund your investment wallet to unlock portfolio execution and exclusive opportunities."
      />

      <article className="panel generate-intro">{renderBold(INTRO)}</article>

      <div className="tier-header">
        <h3>Select your account tier</h3>
        <p>Choose an investment account size. Each tier shows its required 10% minimum Cash Balance funding.</p>
      </div>

      <div className="tier-grid">
        {TIERS.map((pkg) => {
          const isSelected = selected?.id === pkg.id;
          const tierMin = pkg.amount * MIN_FUNDING_RATE;
          return (
            <article
              key={pkg.id}
              className={`panel tier-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor: isSelected ? pkg.color : `${pkg.color}55`,
                boxShadow: isSelected ? `0 0 0 3px ${pkg.color}66` : undefined,
              }}
              onClick={() => selectTier(pkg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') selectTier(pkg);
              }}
            >
              <span className="tier-accent" style={{ background: pkg.color }} />
              <span
                className="tier-glow"
                style={{ background: `radial-gradient(circle, ${pkg.color}66, transparent 70%)` }}
              />
              <div className="tier-topline">
                <strong style={{ color: pkg.color }}>{pkg.name}</strong>
              </div>
              <h3 style={{ color: pkg.color }}>{fmt(pkg.amount)}</h3>
              <span className="tier-subtitle">Account Size</span>
              <div className="tier-min">
                <span>Min. funding (10%)</span>
                <strong>{fmt(tierMin)}</strong>
              </div>
            </article>
          );
        })}
      </div>

      {selected && !showPayment && !funded && (
        <button
          type="button"
          className="primary-button full-width"
          onClick={() => setShowPayment(true)}
        >
          Fund Wallet
        </button>
      )}

      {showPayment && selected && !funded && (
        <article className="panel payment-box">
          <SectionHeader
            eyebrow="Deposit"
            title={`${selected.name} · Fund Your Cash Balance`}
          />

          <div className="tier-funding-meta">
            <div className="tier-funding-item">
              <span>Account Size</span>
              <strong>{fmt(selected.amount)}</strong>
            </div>
            <div className="tier-funding-item">
              <span>Minimum Funding (10%)</span>
              <strong>{fmt(minFunding)}</strong>
            </div>
          </div>

          <label className="funding-amount-label">
            Funding Amount (USD)
            <input
              type="number"
              min={minFunding}
              step="0.01"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              placeholder={String(minFunding)}
            />
          </label>
          {!amountValid && (
            <p className="funding-error">
              Your funding amount must be at least <strong>{fmt(minFunding)}</strong> to meet the 7% minimum requirement.
            </p>
          )}
          <p className="funding-note">
            You may deposit more than the minimum at any time. The amount above is only the required minimum.
          </p>

          <div className="deposit-address-section">
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
                  <strong>{fmt(fundingAmountNum)}</strong>
                </div>
                <div className="deposit-summary-row">
                  <span>BNB / USD Rate</span>
                  <strong>{fmt(bnbPrice)}</strong>
                </div>
                <div className="deposit-summary-row total">
                  <span>Send (BNB)</span>
                  <strong>{bnbAmount ? `${bnbAmount} BNB` : '—'}</strong>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-button full-width"
            onClick={handleFund}
            disabled={!amountValid}
          >
            I Have Sent the Funds
          </button>
          <p className="payment-note">
            Send the exact BNB amount above to the deposit address. Funds will be credited to your Cash Balance after network confirmation, which usually takes 1-2 minutes.
          </p>
        </article>
      )}

      {funded && (
        <article className="panel generated-box confirmation-box">
          <div className="confirmation-icon">
            <span className="confirmation-spinner" aria-hidden="true" />
          </div>
          <span className="confirmation-badge">
            <span className="confirmation-badge-dot" aria-hidden="true" />
            Awaiting Blockchain Confirmation
          </span>
          <SectionHeader
            eyebrow="Funding Confirmation"
            title="Funding Confirmation in Progress"
          />
          <p className="payment-line">
            We're currently confirming your deposit on the blockchain. Once the required network confirmations have been received, your Cash Balance will be updated automatically and your funds will become available for investment.
          </p>
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => navigate('/dashboard')}
            disabled
          >
            Go to Dashboard
          </button>
          <p className="confirmation-note">
            Investment, trading, and withdrawal actions will be enabled automatically once your deposit is confirmed on the blockchain.
          </p>
        </article>
      )}
    </section>
  );
}

export default GenerateAllocation;
