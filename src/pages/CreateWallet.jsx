import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';

const WALLET_STORAGE_KEY = 'goblin_wallet_created';

function generateWalletAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

function CreateWallet() {
  const navigate = useNavigate();
  const [step, setStep] = useState('create'); // create | created | welcome
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const alreadyCreated = localStorage.getItem(WALLET_STORAGE_KEY);
    if (alreadyCreated) {
      setStep('welcome');
    }
  }, []);

  const handleCreateWallet = () => {
    const newAddress = generateWalletAddress();
    setWalletAddress(newAddress);
    setStep('created');
  };

  const handleConfirmSaved = () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'true');
    setConfirmed(true);
    setTimeout(() => {
      navigate('/wallet-funding');
    }, 2000);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (step === 'welcome') {
    return (
      <section className="page-grid welcome-page">
        <div className="welcome-card">
          <div className="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1>Welcome to Your Investment Account</h1>
          <p className="welcome-message">
            Your investment wallet has been successfully created. To begin investing, fund your{' '}
            <strong>Cash Balance</strong> with the required minimum amount. Maintaining an adequate balance enables
            efficient portfolio execution, access to investment opportunities, and continued eligibility for
            platform features and advisory services.
          </p>
          <div className="welcome-actions">
            <button
              type="button"
              className="primary-button full-width"
              onClick={() => navigate('/wallet-funding')}
            >
              Fund Your Wallet
            </button>
            <button
              type="button"
              className="ghost-button full-width"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (step === 'created') {
    return (
      <section className="page-grid wallet-created-page">
        <div className="wallet-created-card">
          <div className="wallet-created-header">
            <div className="wallet-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Wallet Created Successfully</h2>
            <p>Your non-custodial Solana wallet has been generated. Save this address securely — you will need it to fund your account.</p>
          </div>

          <div className="wallet-address-display">
            <div className="wallet-address-label">Your Wallet Address</div>
            <div className="wallet-address-box">
              <code className="wallet-address-text">{walletAddress}</code>
              <button className="ghost-button wallet-copy-btn" type="button" onClick={copyAddress}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="security-warning">
            <div className="security-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="security-content">
              <strong>Security Notice</strong>
              <p>This is your personal non-custodial wallet. Goblin does not store your private keys. Save this address in a secure location. Do not share it with anyone.</p>
            </div>
          </div>

          <div className="confirmation-section">
            <label className="confirmation-checkbox">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>I have securely saved my wallet address</span>
            </label>
            <button
              type="button"
              className="primary-button full-width"
              disabled={!confirmed}
              onClick={handleConfirmSaved}
            >
              Continue to Fund Wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

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
            description="Generate a secure, non-custodial Solana wallet to manage your investment assets."
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
              <strong>Solana Native</strong>
              <p>Built on Solana for fast, low-cost transactions and DeFi integration.</p>
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
          <button type="button" className="primary-button full-width create-wallet-btn" onClick={handleCreateWallet}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Create Non-Custodial Wallet
          </button>
          <p className="create-wallet-note">
            By creating a wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}

export default CreateWallet;
