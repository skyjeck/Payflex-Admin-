import React from 'react';

const MetricCards = ({ totalPortfolio, activeBorrowers, pendingCount = 0 }) => {
  const formattedPortfolio = totalPortfolio !== undefined && totalPortfolio !== null
    ? `₦${totalPortfolio.toLocaleString()}`
    : '₦485,250,000';

  const formattedBorrowers = activeBorrowers !== undefined && activeBorrowers !== null
    ? activeBorrowers.toLocaleString()
    : '1,420';

  return (
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-header">
          <span>Total Portfolio</span>
          <div className="metric-icon-box" style={{ background: '#e8f5e9', color: '#00c853' }}>
            <i className="fa-solid fa-vault"></i>
          </div>
        </div>
        <div className="metric-value">{formattedPortfolio}</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Active Borrowers</span>
          <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <i className="fa-solid fa-credit-card"></i>
          </div>
        </div>
        <div className="metric-value">{formattedBorrowers}</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Pending Approvals</span>
          <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
        </div>
        <div className="metric-value">{pendingCount}</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span>Default Rate (NPL)</span>
          <div className="metric-icon-box" style={{ background: '#e8f5e9', color: '#009624' }}>
            <i className="fa-solid fa-shield-check"></i>
          </div>
        </div>
        <div className="metric-value">1.4%</div>
      </div>
    </section>
  );
};

export default MetricCards;