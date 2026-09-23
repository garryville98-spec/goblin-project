import { useNavigate } from 'react-router-dom';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5.5 12.5 4.2 4.2 8.8-9.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0 4.2-4.2M12 15 7.8 10.8M4.5 19.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.2 19.2 6v5.1c0 4.2-2.8 7.4-7.2 9.1-4.4-1.7-7.2-4.9-7.2-9.1V6L12 3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.8 11.8 2.2 2.2 4.2-4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.8 6.5h12.7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M2.8 8.5h18.7M15.5 14h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function WithdrawalApproved() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="withdrawal-approval-page">
      <div className="approval-page-glow approval-glow-one" />
      <div className="approval-page-glow approval-glow-two" />

      <div className="approval-page-shell">
        <div className="approval-topline">
          <button className="approval-back-button" type="button" onClick={() => navigate('/withdraw')}>
            <ArrowLeftIcon />
            Withdrawals
          </button>

          <div className="approval-brand-mini" aria-label="$Goblin Investment OS">
            <span className="approval-brand-mark">G</span>
            <span>
              <strong>$Goblin</strong>
              <small>Investment OS</small>
            </span>
          </div>

          <button className="ghost-button approval-print-button" type="button" onClick={handlePrint}>
            <DownloadIcon />
            Download receipt
          </button>
        </div>

        <div className="panel approval-hero-panel">
          <div className="approval-hero-copy">
            <div className="approval-status-pill">
              <span className="approval-live-dot" />
              Approved
            </div>
            <p className="eyebrow">Liquidity / Withdrawal receipt</p>
            <h1>$600.00 approved</h1>
            <p>
              Your withdrawal has cleared the Goblin risk review and is queued for release to your verified destination.
            </p>
            <div className="approval-hero-actions">
              <button className="primary-button" type="button" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </button>
              <button className="ghost-button" type="button" onClick={handlePrint}>
                View receipt details
              </button>
            </div>
          </div>

          <div className="approval-amount-card">
            <div>
              <span className="approval-amount-label">Approved amount</span>
              <strong>{formatMoney(600)}</strong>
              <div className="approval-amount-meta">
                <span>USD</span>
                <span className="approval-confirmed">Confirmed</span>
              </div>
            </div>
            <div className="approval-check-orb" aria-label="Approved">
              <CheckIcon />
            </div>
          </div>
        </div>

        <div className="approval-content-grid">
          <div className="panel approval-details-panel">
            <div className="section-header approval-section-header">
              <div>
                <span className="eyebrow">Transaction record</span>
                <h2>Withdrawal details</h2>
                <p>A clear record of the approved request, destination, and release schedule.</p>
              </div>
              <span className="approval-record-badge">Receipt ready</span>
            </div>

            <div className="approval-detail-grid">
              <div className="approval-detail">
                <span>Withdrawal amount</span>
                <strong>{formatMoney(600)}</strong>
              </div>
              <div className="approval-detail">
                <span>Destination</span>
                <strong>Bank transfer ···· 4821</strong>
              </div>
              <div className="approval-detail">
                <span>Processing fee</span>
                <strong>{formatMoney(0)}</strong>
              </div>
              <div className="approval-detail">
                <span>Net release</span>
                <strong className="positive-text">{formatMoney(600)}</strong>
              </div>
              <div className="approval-detail">
                <span>Requested</span>
                <strong>20 Sep 2026 · 10:42 AM</strong>
              </div>
              <div className="approval-detail">
                <span>Approved</span>
                <strong>20 Sep 2026 · 10:45 AM</strong>
              </div>
              <div className="approval-detail approval-detail-wide">
                <span>Receipt reference</span>
                <strong className="approval-mono">GBL-WD-600-20260920-1045</strong>
              </div>
            </div>

            <div className="approval-timeline" aria-label="Withdrawal progress">
              <div className="approval-timeline-row approval-timeline-complete">
                <span className="approval-timeline-dot"><CheckIcon /></span>
                <div>
                  <strong>Request received</strong>
                  <p>Withdrawal request entered the secure queue.</p>
                </div>
                <small>10:42 AM</small>
              </div>
              <div className="approval-timeline-row approval-timeline-complete">
                <span className="approval-timeline-dot"><CheckIcon /></span>
                <div>
                  <strong>Compliance cleared</strong>
                  <p>Destination and account checks completed successfully.</p>
                </div>
                <small>10:44 AM</small>
              </div>
              <div className="approval-timeline-row approval-timeline-complete">
                <span className="approval-timeline-dot"><CheckIcon /></span>
                <div>
                  <strong>Approval granted</strong>
                  <p>The $600.00 release was approved by Goblin Guard.</p>
                </div>
                <small>10:45 AM</small>
              </div>
              <div className="approval-timeline-row approval-timeline-current">
                <span className="approval-timeline-dot"><span /></span>
                <div>
                  <strong>Payout scheduled</strong>
                  <p>Your bank is expected to receive the funds within 1–2 business days.</p>
                </div>
                <small>Next</small>
              </div>
            </div>
          </div>

          <aside className="panel approval-side-panel">
            <div className="approval-side-heading">
              <span className="eyebrow">Release status</span>
              <h2>On its way</h2>
            </div>

            <div className="approval-status-card">
              <div className="approval-status-icon"><CheckIcon /></div>
              <div>
                <span>Status</span>
                <strong>Approved</strong>
                <p>Released to the payment rail</p>
              </div>
            </div>

            <div className="approval-breakdown">
              <div className="approval-breakdown-row">
                <span>Gross withdrawal</span>
                <strong>{formatMoney(600)}</strong>
              </div>
              <div className="approval-breakdown-row">
                <span>Network fee</span>
                <strong>{formatMoney(0)}</strong>
              </div>
              <div className="approval-breakdown-row approval-breakdown-total">
                <span>Amount released</span>
                <strong>{formatMoney(600)}</strong>
              </div>
            </div>

            <div className="approval-security-note">
              <div className="approval-security-icon"><ShieldIcon /></div>
              <div>
                <strong>Protected by Goblin Guard</strong>
                <p>This receipt is tied to your verified account and destination.</p>
              </div>
            </div>

            <button className="secondary-button approval-history-button" type="button" onClick={() => navigate('/withdraw')}>
              <WalletIcon />
              View withdrawal history
            </button>
          </aside>
        </div>

        <div className="approval-footer">
          <span>Secure receipt · Goblin Capital</span>
          <span>Need help? Contact the Private Wealth Desk.</span>
        </div>
      </div>
    </section>
  );
}

export default WithdrawalApproved;
