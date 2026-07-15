import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { launchpadProjects, cryptoPrices, SOL_WALLET } from '../data/marketData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { createLaunchpadAllocation } from '../services/db.js';

const solPrice = cryptoPrices.find((c) => c.symbol === 'SOL')?.price || 0;

function allocationToUsd(allocation) {
  return Number(String(allocation).replace('$', '').replace(',', '')) || 0;
}

function Launchpad() {
  const { user } = useAuth();
  const [detailsProject, setDetailsProject] = useState(null);
  const [depositProject, setDepositProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [generated, setGenerated] = useState(null); // { id, project_name, allocation_amount }
  const [allocError, setAllocError] = useState('');

  const handleJoinSale = (project) => {
    setDepositProject(project);
    setDetailsProject(null);
    setGenerated(null);
    setAllocError('');
  };

  const handleConfirmAllocation = async (project) => {
    if (!user) return;
    setAllocating(true);
    setAllocError('');
    try {
      const amount = allocationToUsd(project.allocation);
      const data = await createLaunchpadAllocation(user.id, project.name, amount);
      setGenerated(data);
    } catch (err) {
      setAllocError(err.message || 'Could not generate allocation.');
    } finally {
      setAllocating(false);
    }
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

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="Launchpad"
        title="Discover Goblin token sales"
        description="Track upcoming launches, allocations, and fundraising progress in one dashboard."
        actionLabel="Submit project"
      />

      <div className="launchpad-grid">
        {launchpadProjects.map((project) => {
          const usd = allocationToUsd(project.allocation);
          const sol = solPrice ? (usd / solPrice).toFixed(2) : null;

          return (
            <article className="panel launch-card" key={project.name}>
              <div className="launch-topline">
                <span>{project.tag}</span>
                <strong>{project.allocation} allocation</strong>
              </div>
              <h3>{project.name}</h3>
              <p>Join the next Goblin-approved token generation event with curated due diligence.</p>
              <div className="progress-label">
                <span>{project.raised} raised</span>
                <strong>{project.target} target</strong>
              </div>
              <div className="mini-bar wide">
                <span style={{ width: `${project.progress}%` }} />
              </div>

              {depositProject === project && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '14px',
                    background: 'rgba(89,255,155,0.06)',
                    border: '1px solid rgba(89,255,155,0.25)',
                    borderRadius: '10px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: '0.92rem' }}>
                    Send <strong>{project.allocation}</strong>
                    {sol ? ` (≈ ${sol} SOL)` : ''} worth of SOL to the Goblin treasury wallet:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <code
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        padding: '8px 10px',
                        background: 'rgba(0,0,0,0.35)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {SOL_WALLET}
                    </code>
                    <button className="ghost-button" type="button" onClick={copyWallet}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    After sending, confirm your deposit to generate your {project.name} allocation ID.
                    Keep your transaction signature as proof of deposit.
                  </p>

                  {!generated && (
                    <button
                      className="primary-button"
                      type="button"
                      style={{ marginTop: '12px', width: '100%' }}
                      disabled={allocating || !user}
                      onClick={() => handleConfirmAllocation(project)}
                    >
                      {allocating ? 'Generating…' : 'Confirm deposit & generate allocation'}
                    </button>
                  )}

                  {allocError && (
                    <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#ff6b6b' }}>{allocError}</p>
                  )}

                  {generated && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        background: 'rgba(89,255,155,0.08)',
                        border: '1px solid rgba(89,255,155,0.35)',
                        borderRadius: '10px',
                      }}
                    >
                      <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                        Allocation ID generated — copy it and use it on the Withdraw page:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <code
                          style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '8px 10px',
                            background: 'rgba(0,0,0,0.35)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {generated.id}
                        </code>
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => navigator.clipboard.writeText(generated.id)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="launch-actions">
                <button className="primary-button" type="button" onClick={() => handleJoinSale(project)}>
                  Join sale
                </button>
                <button className="ghost-button" type="button" onClick={() => setDetailsProject(project)}>
                  Details
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {detailsProject && (
        <div
          onClick={() => setDetailsProject(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0e1116',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#59ff9b',
                }}
              >
                {detailsProject.tag}
              </span>
              <button
                type="button"
                onClick={() => setDetailsProject(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <h2 style={{ margin: '8px 0 4px' }}>{detailsProject.name}</h2>
            <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              {detailsProject.allocation} allocation · {detailsProject.progress}% funded
            </p>

            <p style={{ lineHeight: 1.6, fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)' }}>
              {detailsProject.details}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                margin: '18px 0',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '120px' }}>
                <small style={{ color: 'rgba(255,255,255,0.5)' }}>Raised</small>
                <div style={{ fontWeight: 600 }}>{detailsProject.raised}</div>
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <small style={{ color: 'rgba(255,255,255,0.5)' }}>Target</small>
                <div style={{ fontWeight: 600 }}>{detailsProject.target}</div>
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <small style={{ color: 'rgba(255,255,255,0.5)' }}>Allocation</small>
                <div style={{ fontWeight: 600 }}>{detailsProject.allocation}</div>
              </div>
            </div>

            <button
              className="primary-button"
              type="button"
              style={{ width: '100%' }}
              onClick={() => handleJoinSale(detailsProject)}
            >
              Join sale
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Launchpad;
