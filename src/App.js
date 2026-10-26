import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import AdminLogin from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoansPage from './pages/LoansPage';
import KycPage from './pages/KycPage';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionPage';
import RiskRulesPage from './pages/RiskRulesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || null);

  // Safely retrieve and parse adminUser from localStorage
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (err) {
      console.error('Error reading adminUser from localStorage:', err);
      localStorage.removeItem('adminUser');
      return null;
    }
  });

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
    setActiveTab('overview');
    toast.success('Logged out successfully.');
  };

  // Handle successful login
  const handleLoginSuccess = (token, user) => {
    if (!token || !user) {
      console.error('Invalid login response payload:', { token, user });
      return;
    }
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
    toast.success(`Welcome back, ${user.firstName || user.fullName || 'Admin'}!`);
  };

  // Render active page with auth props
  const renderActivePage = () => {
    const pageProps = {
      activeTab,
      setActiveTab,
      adminToken,
      adminUser,
      handleLogout,
    };

    switch (activeTab) {
      case 'overview':
        return <DashboardPage {...pageProps} />;
      case 'loans':
        return <LoansPage {...pageProps} />;
      case 'kyc':
        return <KycPage {...pageProps} />;
      case 'users':
        return <UsersPage {...pageProps} />;
      case 'transactions':
        return <TransactionsPage {...pageProps} />;
      case 'risk':
        return <RiskRulesPage {...pageProps} />;
      case 'settings':
        return <SettingsPage {...pageProps} />;
      default:
        return <DashboardPage {...pageProps} />;
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      {!adminToken || !adminUser ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        renderActivePage()
      )}
    </>
  );
}

export default App;