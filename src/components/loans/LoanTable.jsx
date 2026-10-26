import React, { useState } from 'react';

const LoanTable = ({ loans, onViewApplicant, onApprove, onReject }) => {
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = loans.filter((loan) => {
    const matchesTab = filterTab === 'all' || loan.status === filterTab;
    const matchesSearch =
      loan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-pending">Pending</span>;
      case 'active': return <span className="badge badge-active">Active</span>;
      case 'flagged': return <span className="badge badge-flagged">Flagged</span>;
      default: return null;
    }
  };

  return (
    <section className="table-card">
      <div className="table-top-bar">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Loan Applications</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)' }}>Review pending loan requests</p>
        </div>

        <div className="filter-tabs">
          {['all', 'pending', 'active', 'flagged'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`tab-btn ${filterTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="table-controls">
        <input
          type="text"
          className="search-input"
          style={{ width: '220px' }}
          placeholder="Filter view..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Applicant</th>
              <th>Amount</th>
              <th>Tenure</th>
              <th>Risk</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => (
              <tr key={loan.id}>
                <td style={{ fontWeight: '700', color: 'var(--payflex-primary-dark)' }}>{loan.id}</td>
                <td>
                  <div style={{ fontWeight: '700' }}>{loan.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--payflex-text-muted)' }}>{loan.email}</div>
                </td>
                <td style={{ fontWeight: '700' }}>₦{loan.amount.toLocaleString()}</td>
                <td>{loan.tenure} Months</td>
                <td><span className="badge" style={{ background: '#f1f5f9' }}>{loan.riskGrade}</span></td>
                <td>{getStatusBadge(loan.status)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onViewApplicant(loan)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LoanTable;