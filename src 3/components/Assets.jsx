import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';

function Assets() {
  const navigate = useNavigate();
  const balance = 50000;
  const goldThreshold = 50000;
  const remaining = 0;
  const progress = Math.min(((goldThreshold - remaining) / goldThreshold) * 100, 100);
  const [goldTierActivated, setGoldTierActivated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleActivate = () => {
    setGoldTierActivated(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/create-wallet');
    }, 1500);
  };

  return (
    <article className="panel wide-panel assets-panel">
      <SectionHeader
        eyebrow="Portfolio overview"
        title="Your assets"
        description="Current holdings and tier progression."
      />
      {showToast && (
        <div className="gold-toast">
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Congratulations! Your Gold Tier has been activated. Redirecting to wallet setup...
        </div>
      )}
      <div className="assets-body">
        <div className="assets-balance-block">
          <div className="assets-balance-label">Total balance</div>
          <div className="assets-balance-value">${balance.toLocaleString()}</div>
        </div>

        <div className={`assets-tier-block gold-tier-action ${goldTierActivated ? 'gold-active' : ''}`}>
          <div className="tier-header">
            <div className="tier-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Gold Tier</span>
            </div>
            <span className="tier-progress-text">{progress.toFixed(1)}%</span>
          </div>

          <div className="tier-progress-bar gold-tier-bar">
            <span
              className="tier-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="tier-footer">
            <span className="tier-remaining">
              <strong>${remaining.toLocaleString()}</strong> to unlock Gold Tier
            </span>
            <span className="tier-threshold">Threshold: ${goldThreshold.toLocaleString()}</span>
          </div>

          <button
            className={`gold-tier-activate ${goldTierActivated ? 'activated' : ''}`}
            type="button"
            onClick={handleActivate}
            disabled={goldTierActivated}
          >
            {goldTierActivated ? (
              <>
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Gold Tier Activated
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Activate Gold Tier now
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default Assets;
