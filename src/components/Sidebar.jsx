import { useAuth } from '../context/AuthContext.jsx';

const baseNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'stocks', label: 'Top Stocks', icon: '↗' },
  { id: 'deposits', label: 'Fixed Deposit', icon: '◔' },
  { id: 'stakepool', label: 'Stakepool', icon: '✦' },
  { id: 'launchpad', label: 'Launchpad', icon: '⚡' },
  { id: 'withdraw', label: 'Withdraw', icon: '↘' },
  { id: 'profile', label: 'Profile', icon: '◉' },
];

function Sidebar({ activePage, onChangePage }) {
  const { isAdmin } = useAuth();
  const navItems = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Admin', icon: '⚙' }]
    : baseNavItems;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <div>
          <strong>$Goblin</strong>
          <span>Investment OS</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activePage === item.id ? 'nav-item active' : 'nav-item'}
            onClick={() => onChangePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <span className="status-dot" />
        <div>
          <strong>Goblin Guard</strong>
          <p>Risk engine online</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
