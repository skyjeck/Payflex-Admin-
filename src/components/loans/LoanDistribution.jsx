import React from 'react';

const LoanDistribution = ({ loans = [] }) => {
  const totalCount = loans.length;

  // Calculate real distribution by loan status/purpose categories
  const statusCounts = loans.reduce((acc, loan) => {
    const status = (loan.status || 'pending').toLowerCase();
    const amount = Number(loan.amount) || 0;
    
    if (!acc[status]) {
      acc[status] = { count: 0, totalAmount: 0 };
    }
    acc[status].count += 1;
    acc[status].totalAmount += amount;
    return acc;
  }, {});

  // Distribution Categories mapped from backend loan status & purposes
  const categories = [
    {
      name: 'Active & Disbursed',
      count: (statusCounts['active']?.count || 0) + (statusCounts['disbursed']?.count || 0),
      amount: (statusCounts['active']?.totalAmount || 0) + (statusCounts['disbursed']?.totalAmount || 0),
      color: 'var(--payflex-primary)',
    },
    {
      name: 'Pending Review',
      count: statusCounts['pending']?.count || 0,
      amount: statusCounts['pending']?.totalAmount || 0,
      color: '#f59e0b',
    },
    {
      name: 'Completed / Repaid',
      count: statusCounts['completed']?.count || 0,
      amount: statusCounts['completed']?.totalAmount || 0,
      color: '#3b82f6',
    },
    {
      name: 'Flagged / Rejected',
      count: (statusCounts['flagged']?.count || 0) + (statusCounts['rejected']?.count || 0),
      amount: (statusCounts['flagged']?.totalAmount || 0) + (statusCounts['rejected']?.totalAmount || 0),
      color: '#ef4444',
    },
  ];

  // Derive recent audit log entry from latest loan
  const latestLoan = loans.length > 0 ? loans[0] : null;

  return (
    <div className="analytics-card">
      <div>
        <h3 className="analytics-title" style={{ marginBottom: '0.25rem' }}>Loan Status & Volume Distribution</h3>
        <p className="analytics-subtitle" style={{ marginBottom: '1.25rem' }}>
          Portfolio breakdown across approval lifecycle stages ({totalCount} total applications)
        </p>

        <div className="distribution-list">
          {categories.map((cat, index) => {
            const percentage = totalCount > 0 ? Math.round((cat.count / totalCount) * 100) : 0;
            return (
              <div key={index}>
                <div className="dist-item-header">
                  <span className="dist-label">{cat.name}</span>
                  <span className="dist-val">
                    {percentage}% (₦{cat.amount.toLocaleString()})
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="audit-log-section">
        <p className="audit-title">Recent System Audit</p>
        <div className="audit-item">
          <span className="audit-dot"></span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {latestLoan ? (
              <>Latest application: <strong>₦{Number(latestLoan.amount).toLocaleString()}</strong> by <i>{latestLoan.name}</i></>
            ) : (
              <>System audit active • All records synced</>
            )}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--payflex-text-muted)' }}>
            Just now
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoanDistribution;