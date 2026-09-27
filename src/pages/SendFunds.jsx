import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';

const RECIPIENT = 'Q7M4-X9D2-K8A1';
const SEND_AMOUNT = 1700;

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function SendFunds() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(String(SEND_AMOUNT));
  const [recipient, setRecipient] = useState(RECIPIENT);
  const [confirmed, setConfirmed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const numericAmount = Number(amount) || 0;
  const fee = 2.5; // illustrative flat network fee
  const totalDebit = numericAmount + fee;
  const senderBalance = 46176;
  const insufficient = totalDebit > senderBalance;

  const handleSend = (e) => {
    e.preventDefault();
    if (!confirmed) {
      setError('Please confirm the recipient details before sending.');
      return;
    }
    if (insufficient) {
      setError('Insufficient funds for this transfer.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Sender desk"
        title="Send funds"
        description="Transfer assets internally to another Goblin account."
      />

      {sent ? (
        <article className="panel success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Transfer complete</h2>
          <p>
            You have sent <strong>{fmt(numericAmount)}</strong> to <strong>{recipient}</strong>.
            The funds have been credited to the recipient's account.
          </p>
          <div className="transfer-details">
            <div className="detail-row">
              <span>Recipient</span>
              <strong>{recipient}</strong>
            </div>
            <div className="detail-row">
              <span>Amount sent</span>
              <strong>{fmt(numericAmount)}</strong>
            </div>
            <div className="detail-row">
              <span>Network fee</span>
              <strong>{fmt(fee)}</strong>
            </div>
            <div className="detail-row total">
              <span>Total debited</span>
              <strong>{fmt(totalDebit)}</strong>
            </div>
          </div>
          <button className="primary-button" type="button" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </article>
      ) : (
        <div className="split-grid">
          <form className="panel send-form" onSubmit={handleSend}>
            <div className="form-block">
              <label className="field-label" htmlFor="send-amount">
                Amount (USD)
              </label>
              <div className="amount-input">
                <span className="currency-prefix">$</span>
                <input
                  id="send-amount"
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
                {[100, 500, 1000, 1700].map((q) => (
                  <button type="button" key={q} className="chip" onClick={() => setAmount(String(q))}>
                    {fmt(q)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-block">
              <label className="field-label" htmlFor="send-recipient">
                Recipient ID
              </label>
              <input
                id="send-recipient"
                type="text"
                className="text-input"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
              />
              <p className="field-hint">Internal Goblin account identifier.</p>
            </div>

            <div className="form-block recipient-confirm">
              <label className="confirm-label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span>
                  I confirm this is the correct recipient: <strong>{recipient}</strong>
                </span>
              </label>
            </div>

            {error && <p className="status-message error">{error}</p>}

            <button type="submit" className="primary-button full-width">
              Send {fmt(numericAmount)}
            </button>
          </form>

          <aside className="panel send-summary">
            <SectionHeader eyebrow="Overview" title="Transfer summary" />
            <div className="balance-hero">
              <span>Sender balance</span>
              <div className="balance-value-row">
                <strong>{fmt(senderBalance)}</strong>
                <span className="balance-delta positive-text">+3.4%</span>
              </div>
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Recipient</span>
                <strong>{recipient}</strong>
              </div>
              <div className="summary-row">
                <span>Amount to send</span>
                <strong>{fmt(numericAmount)}</strong>
              </div>
              <div className="summary-row">
                <span>Network fee</span>
                <strong>{fmt(fee)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total debited</span>
                <strong>{fmt(totalDebit)}</strong>
              </div>
              <div className="summary-row">
                <span>Remaining balance</span>
                <strong>{fmt(senderBalance - totalDebit)}</strong>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default SendFunds;