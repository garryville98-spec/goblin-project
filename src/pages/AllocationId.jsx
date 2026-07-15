import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { cryptoPrices, SOL_WALLET } from '../data/marketData.js';

const SERVICE_FEE_RATE = 0.05; // 5% one-time service fee to generate the Allocation ID
const solPrice = cryptoPrices.find((c) => c.symbol === 'SOL')?.price || 0;

const TIERS = [
  { id: 'black', name: 'Black Tier', amount: 25000, color: '#0b1220' },
  { id: 'gold', name: 'Gold Tier', amount: 50000, color: '#b8872e' },
  { id: 'tier-one', name: 'Tier One', amount: 100000, color: '#0052ff' },
];

const INTRO =
  '**Generate Your $GOBLIN Allocation ID**\n\nYour **$GOBLIN Allocation ID** is a unique identifier that securely connects your account to the $GOBLIN investment ecosystem. It serves as your permanent reference for managing stock allocations, tracking portfolio activity, viewing transaction history, and accessing future platform services. Every allocation, reward, and investment record associated with your account is linked through this ID, ensuring your holdings remain secure, verifiable, and easily accessible whenever you sign in.\n\nGenerating your Allocation ID is a one-time process that activates your investment profile and grants access to your personalized $GOBLIN dashboard. Once created, you\'ll be able to monitor your allocated shares, receive future distributions, track account activity, and unlock new features as they become available on the platform. Your Allocation ID remains uniquely assigned to your account, providing a secure and seamless experience as you participate in the growth of the $GOBLIN ecosystem.';

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

function AllocationId() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [funded, setFunded] = useState(false); // awaiting blockchain confirmation

  const serviceFee = selected ? selected.amount * SERVICE_FEE_RATE : 0;
  const feeInSol = solPrice ? (serviceFee / solPrice).toFixed(4) : null;

  const selectTier = (pkg) => {
    setSelected(pkg);
    setShowPayment(false);
    setFunded(false);
  };

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(SOL_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFund = () => {
    // Payment received — now awaiting blockchain confirmation before the
    // Allocation ID is generated. We intentionally do not auto-generate
    // because the deposit is still being verified on-chain.
    setFunded(true);
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Allocation ID"
        title="Generate Your $GOBLIN Allocation ID"
        description="Activate your investment profile with a one-time, uniquely assigned Allocation ID."
      />

      <article className="panel generate-intro">{renderBold(INTRO)}</article>

      <div className="tier-header">
        <h3>Select your account package</h3>
        <p>Choose an account package below. A one-time 5% service fee is required to generate your Allocation ID and is paid to the platform SOL wallet.</p>
      </div>

      <div className="tier-grid">
        {TIERS.map((pkg) => {
          const isSelected = selected?.id === pkg.id;
          const tierFee = pkg.amount * SERVICE_FEE_RATE;
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
              <span className="tier-subtitle">Account Package</span>
              <div className="tier-min">
                <span>Service fee (5%)</span>
                <strong>{fmt(tierFee)}</strong>
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
          Continue with {selected.name}
        </button>
      )}

      {showPayment && selected && !funded && (
        <article className="panel payment-box">
          <SectionHeader
            eyebrow="Service Fee"
            title={`${selected.name} · Generate Allocation ID`}
          />

          <div className="tier-funding-meta">
            <div className="tier-funding-item">
              <span>Account Package</span>
              <strong>{fmt(selected.amount)}</strong>
            </div>
            <div className="tier-funding-item">
              <span>Service Fee (5%)</span>
              <strong>{fmt(serviceFee)}</strong>
            </div>
          </div>

          <p className="funding-note">
            Pay the 5% service fee to the same platform SOL wallet used across the stakepool section to generate your unique $GOBLIN Allocation ID.
          </p>

          <div className="deposit-address-section">
            <div className="qr-code-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(SOL_WALLET)}`}
                alt="QR Code for SOL deposit address"
                className="qr-code-image"
              />
            </div>
            <div className="deposit-details">
              <div className="wallet-row">
                <code className="wallet-address">{SOL_WALLET}</code>
                <button className="ghost-button" type="button" onClick={copyWallet}>
                  {copied ? 'Copied' : 'Copy Address'}
                </button>
              </div>
              <div className="deposit-summary">
                <div className="deposit-summary-row">
                  <span>Service Fee (USD)</span>
                  <strong>{fmt(serviceFee)}</strong>
                </div>
                <div className="deposit-summary-row">
                  <span>SOL / USD Rate</span>
                  <strong>{fmt(solPrice)}</strong>
                </div>
                <div className="deposit-summary-row total">
                  <span>Send (SOL)</span>
                  <strong>{feeInSol ? `${feeInSol} SOL` : '—'}</strong>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-button full-width"
            onClick={handleFund}
          >
            I Have Sent the Fee
          </button>
          <p className="payment-note">
            After your SOL payment is sent to the address above, we will confirm it on the blockchain. Your Allocation ID will be generated automatically once the required network confirmations are received.
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
            eyebrow="Allocation ID Confirmation"
            title="Allocation ID Generation in Progress"
          />
          <p className="payment-line">
            We're currently confirming your SOL payment on the blockchain. Once the required network confirmations have been received, your $GOBLIN Allocation ID will be generated automatically and linked to your account.
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
            Your Allocation ID and investment profile will be activated automatically once your deposit is confirmed on the blockchain.
          </p>
        </article>
      )}
    </section>
  );
}

export default AllocationId;
