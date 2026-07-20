import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';

function CreateWallet() {
  const navigate = useNavigate();

  return (
    <section className="page-grid create-wallet-page">
      <div className="create-wallet-card">
        <div className="create-wallet-header">
          <div className="security-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Non-Custodial</span>
          </div>
          <SectionHeader
            eyebrow="Secure Wallet"
            title="Create Your Investment Wallet"
            description="Generate a secure, non-custodial wallet to manage your investment assets."
          />
        </div>

        <div className="wallet-features">
          <div className="wallet-feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="feature-content">
              <strong>Self-Custodied</strong>
              <p>You control your private keys. Goblin never has access to your funds.</p>
            </div>
          </div>
          <div className="wallet-feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="feature-content">
              <strong>DeFi Wallet</strong>
              <p>Built for fast, low-cost transactions and DeFi integration.</p>
            </div>
          </div>
          <div className="wallet-feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className="feature-content">
              <strong>Global Access</strong>
              <p>Access your portfolio from anywhere in the world, 24/7.</p>
            </div>
          </div>
        </div>

        <div className="create-wallet-cta">
          <button
            type="button"
            className="primary-button full-width"
            onClick={() => navigate('/wallet-funding')}
          >
            Continue to Cash Balance
          </button>
        </div>
      </div>
    </section>
  );
}

export default CreateWallet;
