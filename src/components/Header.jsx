import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      read: false,
      title: 'Internal Transfer',
      message: 'You have received an internal transfer of $1,700 from X704-P2D4-K7A8. The funds have been credited to your account.',
      time: 'Just now',
      amount: '+$1,700',
    },
  ]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Even if the request fails, force a local sign-out by reloading
      // to the login screen.
      window.location.assign('/login');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      // Mark all as read when the dropdown is opened
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Private Wealth Desk</p>
        <h1>$Goblin Capital</h1>
      </div>
      <div className="topbar-actions">
        <div className="notification-wrapper">
          <button
            className="notification-bell"
            type="button"
            aria-label="Notifications"
            onClick={handleToggleNotifications}
          >
            <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notifications</span>
                <span className="notification-count">{unreadCount} new</span>
              </div>
              <div className="notification-list">
                {notifications.map((n) => (
                  <div className={`notification-item ${n.read ? 'read' : 'unread'}`} key={n.id}>
                    <div className="notification-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1v22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="notification-body">
                      <div className="notification-title-row">
                        <strong>{n.title}</strong>
                        <span className="notification-amount">{n.amount}</span>
                      </div>
                      <p>{n.message}</p>
                      <small>{n.time}</small>
                    </div>
                    {!n.read && <span className="notification-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Header;
