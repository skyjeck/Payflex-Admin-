import React from 'react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  pendingCount = 38, 
  mobileOpen, 
  setMobileOpen,
  handleLogout, // Added handleLogout prop
  adminUser     // Added adminUser prop for dynamic details
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'fa-chart-pie' },
    { id: 'loans', label: 'Loan Applications', icon: 'fa-hand-holding-dollar', badge: pendingCount },
    { id: 'kyc', label: 'KYC Verification', icon: 'fa-users' },
    { id: 'users', label: 'Users', icon: 'fa-users' },
    { id: 'transactions', label: 'Transactions & Wallet', icon: 'fa-money-bill-transfer' },
    { id: 'risk', label: 'Credit Risk & Rules', icon: 'fa-shield-halved' },
    { id: 'settings', label: 'System Settings', icon: 'fa-sliders' },
  ];

  // Helper for avatar initials (defaults to 'SE')
  const getInitials = () => {
    if (!adminUser) return 'SE';
    const first = adminUser.firstName ? adminUser.firstName[0] : '';
    const last = adminUser.lastName ? adminUser.lastName[0] : '';
    return (first + last).toUpperCase() || 'SE';
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div>
        <div className="sidebar-header">
          <div className="brand-box">
            <div className="brand-icon">P</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="brand-title">PayFlex</span>
                <span className="brand-badge">ADMIN</span>
              </div>
              <p className="sidebar-sub">Fintech Operations Hub</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="mobile-toggle icon-btn">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className={`fa-solid ${item.icon}`} style={{ width: '18px' }}></i>
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="badge-count">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer with Admin Info & Logout */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{getInitials()}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700' }}>
              {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Stephen Enemchukwu'}
            </p>
            <p className="sidebar-sub">
              {adminUser?.role === 'admin' ? 'Administrator' : 'Super Administrator'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-button">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;