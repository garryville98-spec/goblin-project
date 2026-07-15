import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Even if the request fails, force a local sign-out by reloading
      // to the login screen.
      window.location.assign('/login');
    }
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Private Wealth Desk</p>
        <h1>$Goblin Capital</h1>
      </div>
      <div className="topbar-actions">
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Header;
