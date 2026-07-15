import { useEffect, useState } from 'react';
import { listUsers } from '../services/db.js';
import SectionHeader from './SectionHeader.jsx';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await listUsers(100);
        if (active) setUsers(data || []);
      } catch (err) {
        if (active) setError(err?.message || 'Failed to load users.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-grid">
      <SectionHeader
        eyebrow="User management"
        title="Newly registered users"
      />

      <div className="panel users-panel">
        {loading && <p className="muted-text">Loading users…</p>}

        {!loading && error && (
          <p className="error-text">Could not load users: {error}</p>
        )}

        {!loading && !error && users.length === 0 && (
          <p className="muted-text">No registered users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>
                      <span className={`role-badge role-${u.role || 'user'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminUsers;
