import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';

export default function RiskRulesPage({ activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rules, setRules] = useState({
    maxLoanAmount: 1000000,
    dtiLimit: 33,
    autoApproveScore: 720,
    baseInterestRate: 4.5,
    enableAutoApproval: true,
    requireBvnMatch: true,
  });

  const handleInputChange = (field, value) => {
    setRules((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Credit Risk & Underwriting Rules</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)', margin: '0.25rem 0 0 0' }}>
          Tune automated risk assessment scoring, DTI constraints, and auto-disbursement limits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Core Engine Parameters */}
        <div style={{ backgroundColor: 'var(--payflex-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--payflex-border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Global Underwriting Thresholds</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
                Maximum Single Loan Cap (₦)
              </label>
              <input
                type="number"
                value={rules.maxLoanAmount}
                onChange={(e) => handleInputChange('maxLoanAmount', Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
                Debt-to-Income (DTI) Cap (%)
              </label>
              <input
                type="number"
                value={rules.dtiLimit}
                onChange={(e) => handleInputChange('dtiLimit', Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
                Auto-Approval Credit Score Cutoff
              </label>
              <input
                type="number"
                value={rules.autoApproveScore}
                onChange={(e) => handleInputChange('autoApproveScore', Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
                Monthly Base Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rules.baseInterestRate}
                onChange={(e) => handleInputChange('baseInterestRate', Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Toggles & Risk Tiers */}
        <div style={{ backgroundColor: 'var(--payflex-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--payflex-border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Automation Controls</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--payflex-icon-bg)' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Enable Automated Approvals</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--payflex-text-secondary)' }}>Auto-approve Low Risk Grade A+ applications</div>
              </div>
              <input
                type="checkbox"
                checked={rules.enableAutoApproval}
                onChange={(e) => handleInputChange('enableAutoApproval', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--payflex-icon-bg)' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Strict BVN Name Matching</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--payflex-text-secondary)' }}>Flag applicants with bank name mismatches</div>
              </div>
              <input
                type="checkbox"
                checked={rules.requireBvnMatch}
                onChange={(e) => handleInputChange('requireBvnMatch', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </label>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => alert('Risk Engine Rules Updated!')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--payflex-primary)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Save Rule Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}