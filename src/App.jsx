import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './components/Dashboard.jsx';
import FixedDeposit from './components/FixedDeposit.jsx';
import Header from './components/Header.jsx';
import Launchpad from './components/Launchpad.jsx';
import Sidebar from './components/Sidebar.jsx';
import StakePool from './components/StakePool.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import TopStocks from './components/TopStocks.jsx';
import UserProfile from './components/UserProfile.jsx';
import Withdraw from './pages/Withdraw.jsx';
import GenerateAllocation from './pages/GenerateAllocation.jsx';
import AllocationId from './pages/AllocationId.jsx';
import CreateWallet from './pages/CreateWallet.jsx';

const pathToPageId = {
  '/dashboard': 'dashboard',
  '/stocks': 'stocks',
  '/deposits': 'deposits',
  '/stakepool': 'stakepool',
  '/launchpad': 'launchpad',
  '/withdraw': 'withdraw',
  '/profile': 'profile',
  '/admin': 'admin',
};

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = pathToPageId[location.pathname] || 'dashboard';

  const handleNavigate = (pageId) => {
    const path = `/${pageId}`;
    navigate(path);
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onChangePage={handleNavigate} />
      <main className="main-panel">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stocks" element={<TopStocks />} />
            <Route path="deposits" element={<FixedDeposit />} />
            <Route path="stakepool" element={<StakePool />} />
            <Route path="launchpad" element={<Launchpad />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="create-wallet" element={<CreateWallet />} />
            <Route path="wallet-funding" element={<GenerateAllocation />} />
            <Route path="generate-allocation-id" element={<AllocationId />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
