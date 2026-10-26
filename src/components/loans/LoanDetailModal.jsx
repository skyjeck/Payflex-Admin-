import React, { useState } from 'react';

export default function LoanDetailModal({ 
  loan, 
  onClose, 
  onApprove, 
  onApproveDisburse, 
  onReject, 
  isProcessing 
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  if (!loan) return null;

  // Status mapping
  const currentStatus = (loan.status || 'pending').toLowerCase();
  const isDisbursed = currentStatus === 'disbursed';
  const isApproved = currentStatus === 'approved';
  const isRejected = currentStatus === 'rejected';

  const isActionDisabled = isProcessing || isDisbursed || isRejected;
  const handleApproveAction = onApprove || onApproveDisburse;

  // Status Badge Styling
  const getStatusBadgeStyle = () => {
    switch (currentStatus) {
      case 'disbursed':
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Disbursed' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' };
      default:
        return { bg: '#FEF3C7', color: '#92400E', label: 'Pending Review' };
    }
  };

  const badge = getStatusBadgeStyle();

  const handleClose = () => {
    setShowApproveConfirm(false);
    setShowRejectInput(false);
    setRejectionReason('');
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={styles.title}>Loan Application Details</h2>
              <span style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <p style={styles.subtitle}>ID: {loan.id}</p>
          </div>
          <button style={styles.closeBtn} onClick={handleClose} disabled={isProcessing}>
            ✕
          </button>
        </div>

        {/* Applicant Profile Card */}
        <div style={styles.applicantCard}>
          <div style={styles.avatar}>{loan.avatar || 'PF'}</div>
          <div>
            <h3 style={styles.applicantName}>{loan.name}</h3>
            <p style={styles.applicantContact}>{loan.email} • {loan.phone}</p>
          </div>
        </div>

        {/* Loan Metrics Grid */}
        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>Loan Amount</span>
            <span style={styles.gridValuePrimary}>₦{Number(loan.amount).toLocaleString()}</span>
          </div>

          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>Monthly EMI</span>
            <span style={styles.gridValue}>₦{Number(loan.monthlyEMI).toLocaleString()}/mo</span>
          </div>

          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>Tenure</span>
            <span style={styles.gridValue}>{loan.tenure} Months</span>
          </div>

          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>Application Date</span>
            <span style={styles.gridValue}>{loan.date}</span>
          </div>
        </div>

        {/* Loan Purpose */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={styles.gridLabel}>Purpose of Loan</span>
          <p style={styles.purposeText}>{loan.purpose || 'Not specified'}</p>
        </div>

        {/* In-Modal Confirmation Banner for Approval */}
        {showApproveConfirm && !isDisbursed && !isRejected && (
          <div style={styles.confirmBanner}>
            <p style={styles.confirmBannerText}>
              <strong>Confirm Disbursement:</strong> Are you sure you want to disburse <strong>₦{Number(loan.amount).toLocaleString()}</strong> to {loan.name}?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                style={styles.confirmBannerApproveBtn}
                onClick={() => handleApproveAction && handleApproveAction()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Disbursing...' : 'Yes, Confirm & Disburse'}
              </button>
              <button
                style={styles.confirmBannerCancelBtn}
                onClick={() => setShowApproveConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Rejection Input */}
        {showRejectInput && !isRejected && !isDisbursed && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={styles.inputLabel}>Reason for Rejection</label>
            <textarea
              placeholder="Provide a clear reason for rejecting this application..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={styles.textarea}
              rows={3}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={handleClose} disabled={isProcessing}>
            Close
          </button>

          {!isDisbursed && !isRejected && !showApproveConfirm && (
            showRejectInput ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => setShowRejectInput(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  style={styles.dangerBtn}
                  onClick={() => onReject(rejectionReason)}
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            ) : (
              <button
                style={styles.outlineDangerBtn}
                onClick={() => {
                  setShowRejectInput(true);
                  setShowApproveConfirm(false);
                }}
                disabled={isProcessing}
              >
                Reject Application
              </button>
            )
          )}

          {!showApproveConfirm && !showRejectInput && (
            <button
              style={{
                ...styles.primaryBtn,
                backgroundColor: isDisbursed ? '#059669' : '#10B981',
                opacity: isActionDisabled ? 0.65 : 1,
                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (!isActionDisabled) {
                  setShowApproveConfirm(true);
                  setShowRejectInput(false);
                }
              }}
              disabled={isActionDisabled}
            >
              {isDisbursed 
                ? '✓ Funds Disbursed' 
                : isProcessing 
                ? 'Processing...' 
                : 'Approve & Disburse'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// Inline Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '540px',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1E293B',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748B',
    margin: '0.25rem 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#94A3B8',
    padding: '0.25rem',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  applicantCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    backgroundColor: '#F8FAFC',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    marginBottom: '1.25rem',
    border: '1px solid #E2E8F0',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.875rem',
  },
  applicantName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0F172A',
  },
  applicantContact: {
    margin: '0.125rem 0 0 0',
    fontSize: '0.8rem',
    color: '#64748B',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.25rem',
    backgroundColor: '#FFFFFF',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
    marginBottom: '0.25rem',
  },
  gridValue: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1E293B',
  },
  gridValuePrimary: {
    fontSize: '1.125rem',
    fontWeight: '800',
    color: '#059669',
  },
  purposeText: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#334155',
  },
  confirmBanner: {
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '10px',
    padding: '0.875rem 1rem',
    marginBottom: '1.25rem',
  },
  confirmBannerText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#065F46',
  },
  confirmBannerApproveBtn: {
    padding: '0.5rem 0.875rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  confirmBannerCancelBtn: {
    padding: '0.5rem 0.875rem',
    borderRadius: '6px',
    border: '1px solid #A7F3D0',
    backgroundColor: '#FFFFFF',
    color: '#065F46',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: '0.375rem',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: '8px',
    border: '1px solid #FCA5A5',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  footer: {
    display: 'flex',
    gap: '0.625rem',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #F1F5F9',
  },
  secondaryBtn: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  outlineDangerBtn: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    border: '1px solid #F87171',
    backgroundColor: '#FFFFFF',
    color: '#DC2626',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '0.625rem 1.125rem',
    borderRadius: '8px',
    border: 'none',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
};