// Lightweight in-browser mock of the Supabase client used by this app,
// backed by localStorage. It is activated automatically when real Supabase
// env vars are missing or still set to the placeholder values, so the app
// runs end-to-end with no backend. When real credentials are present,
// src/lib/supabase.js uses the real client instead and this file is ignored.

const LS_USERS = 'mock_users';
const LS_SESSION = 'mock_session';
const LS_TABLES = 'mock_tables';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTables() {
  return readJSON(LS_TABLES, {});
}

function getTable(name) {
  const tables = getTables();
  if (!tables[name]) tables[name] = [];
  return tables[name];
}

function saveTable(name, rows) {
  const tables = getTables();
  tables[name] = rows;
  writeJSON(LS_TABLES, tables);
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowISO() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function getUsers() {
  return readJSON(LS_USERS, []);
}

function saveUsers(users) {
  writeJSON(LS_USERS, users);
}

function getSession() {
  return readJSON(LS_SESSION, null);
}

function setSession(session) {
  if (session) writeJSON(LS_SESSION, session);
  else localStorage.removeItem(LS_SESSION);
}

function publicUser(u) {
  return { id: u.id, email: u.email, user_metadata: { name: u.name, role: u.role || 'user' } };
}

function makeSession(u) {
  return { user: publicUser(u), access_token: 'mock-token', token_type: 'bearer' };
}

const auth = {
  async getSession() {
    return { data: { session: getSession() }, error: null };
  },

  onAuthStateChange(cb) {
    // The app reads the session on mount via getSession(), so a no-op
    // subscription is sufficient for the mock.
    return { data: { subscription: { unsubscribe() {} } } };
  },

  async signUp({ email, password, options }) {
    const normalized = (email || '').toLowerCase().trim();
    const users = getUsers();
    if (users.find((u) => u.email === normalized)) {
      return { data: { user: null, session: null }, error: { message: 'User already registered' } };
    }
    const name = options?.data?.name || '';
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
      ? String(import.meta.env.VITE_ADMIN_EMAIL).toLowerCase().trim()
      : null;
    const role = adminEmail && normalized === adminEmail ? 'admin' : 'user';
    const user = { id: uuid(), email: normalized, password, name, role };
    users.push(user);
    saveUsers(users);

    // Mimic the database triggers: auto-create profile + zero balance.
    insertRow('profiles', {
      id: user.id,
      name,
      email: normalized,
      role,
      created_at: nowISO(),
      updated_at: nowISO(),
    });
    insertRow('balances', {
      id: uuid(),
      user_id: user.id,
      available_balance: 0,
      currency: 'USD',
      updated_at: nowISO(),
    });

    const session = makeSession(user);
    setSession(session);
    return { data: { user: publicUser(user), session }, error: null };
  },

  async signInWithPassword({ email, password }) {
    const normalized = (email || '').toLowerCase().trim();
    const user = getUsers().find((u) => u.email === normalized && u.password === password);
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
    const session = makeSession(user);
    setSession(session);
    return { data: { user: publicUser(user), session }, error: null };
  },

  async signOut() {
    setSession(null);
    return { error: null };
  },
};

// ---------------------------------------------------------------------------
// Query builder (from / select / insert / eq / order / limit / single)
// ---------------------------------------------------------------------------
function insertRow(table, row) {
  const rows = getTable(table);
  rows.push(row);
  saveTable(table, rows);
  return row;
}

function execute(state) {
  if (state.insertRows) {
    const rows = getTable(state.table);
    const inserted = state.insertRows.map((r) => {
      const row = { id: uuid(), created_at: nowISO(), ...r };
      rows.push(row);
      return row;
    });
    saveTable(state.table, rows);
    return { data: state.single ? inserted[0] : inserted, error: null };
  }

  let rows = getTable(state.table).slice();
  for (const [col, val] of state.filters) {
    rows = rows.filter((r) => r[col] === val);
  }
  if (state.order) {
    const { col, ascending } = state.order;
    rows.sort((a, b) => {
      if (a[col] < b[col]) return ascending ? -1 : 1;
      if (a[col] > b[col]) return ascending ? 1 : -1;
      return 0;
    });
  }
  if (state.limit != null) rows = rows.slice(0, state.limit);

  if (state.single) {
    if (rows.length === 0) return { data: null, error: { message: 'No rows found' } };
    return { data: rows[0], error: null };
  }
  return { data: rows, error: null };
}

function from(table) {
  const state = { table, filters: [], order: null, limit: null, single: false, insertRows: null };

  const builder = {
    insert(rows) {
      state.insertRows = Array.isArray(rows) ? rows : [rows];
      return builder;
    },
    select() {
      return builder;
    },
    eq(col, val) {
      state.filters.push([col, val]);
      return builder;
    },
    order(col, opts) {
      state.order = { col, ascending: opts?.ascending !== false };
      return builder;
    },
    limit(n) {
      state.limit = n;
      return builder;
    },
    single() {
      state.single = true;
      return builder;
    },
    then(resolve, reject) {
      Promise.resolve()
        .then(() => execute(state))
        .then(resolve)
        .catch(reject);
    },
  };

  return builder;
}

// ---------------------------------------------------------------------------
// RPC (adjust_balance)
// ---------------------------------------------------------------------------
function rpc(fn, params) {
  if (fn === 'adjust_balance') {
    const { p_user_id, p_amount } = params;
    const rows = getTable('balances');
    let idx = rows.findIndex((b) => b.user_id === p_user_id);
    if (idx === -1) {
      // Auto-create a zero balance for convenience in mock mode.
      const created = { id: uuid(), user_id: p_user_id, available_balance: 0, currency: 'USD', updated_at: nowISO() };
      rows.push(created);
      idx = rows.length - 1;
    }
    const bal = rows[idx];
    const newBal = Number(bal.available_balance) + Number(p_amount);
    if (newBal < 0) {
      return Promise.resolve({ data: null, error: { message: 'Insufficient funds' } });
    }
    bal.available_balance = newBal;
    bal.updated_at = nowISO();
    rows[idx] = bal;
    saveTable('balances', rows);
    return Promise.resolve({ data: bal, error: null });
  }
  return Promise.resolve({ data: null, error: { message: `Unknown rpc: ${fn}` } });
}

export function createMockClient() {
  return { auth, from, rpc };
}
