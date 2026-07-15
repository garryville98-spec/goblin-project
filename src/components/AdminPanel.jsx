import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AdminUsers from './AdminUsers.jsx';

function AdminPanel() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="page-grid">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(167,139,250,0.12)',
          border: '1px solid rgba(167,139,250,0.35)',
          borderRadius: '10px',
          color: '#cbb8ff',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Admin panel
      </div>
      <AdminUsers />
    </section>
  );
}

export default AdminPanel;
