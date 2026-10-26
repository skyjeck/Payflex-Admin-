import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/layout/AdminLayout';

export default function TransactionsPage({ activeTab, setActiveTab, adminToken, handleLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyingId, setNotifyingId] = useState(null);

  const token = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

  // Push Notification Reminder handler
  const sendPushReminder = async (record) => {
    setNotifyingId(record.id);
    const toastId = toast.loading(`Sending notification to ${record.user}...`);

    const notificationPayload = {
      userId: record.userId,
      title: 'Pending Loan Attention Required',
      message: `Dear ${record.user}, you have an active loan with a remaining balance of ${record.formattedRemaining}. Please attend to your repayment as soon as possible.`,
      type: 'loan_reminder',
      loanId: record.rawId || record.id,
    };

    try {
      // Step 1: Save notification to the notification collection (appears in user feed)
      const notifResponse = await fetch('http://localhost:4000/api/notifcation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationPayload),
      });

      if (notifResponse.status === 401 && handleLogout) {
        handleLogout();
        return;
      }

      // Step 2: Also trigger the admin push notify endpoint (device push / SMS)
      try {
        await fetch(`http://localhost:4000/api/admin/users/${record.userId}/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(notificationPayload),
        });
      } catch (pushErr) {
        // Non-critical: push delivery failure shouldn't block the success toast
        console.warn('Device push notification secondary call failed:', pushErr);
      }

      if (notifResponse.ok) {
        toast.success(`Notification sent & saved for ${record.user}!`, { id: toastId });
      } else {
        const errData = await notifResponse.json().catch(() => ({}));
        toast.error(errData.message || `Failed to save notification for ${record.user}.`, { id: toastId });
      }
    } catch (err) {
      console.error('Notification send error:', err);
      toast.error(`Could not send notification to ${record.user}. Check your connection.`, { id: toastId });
    } finally {
      setNotifyingId(null);
    }
  };

  const fetchUserTransactionsAndLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch loans & user records from backend
      const response = await fetch('http://localhost:4000/api/admin/loans', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 && handleLogout) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawLoans = Array.isArray(data) ? data : (data.loans || data.data || []);

      // Filter to keep ONLY regular customers (excluding admin accounts)
      const userRecords = rawLoans
        .filter((loan) => {
          const userObj = typeof loan.userId === 'object' && loan.userId !== null ? loan.userId : {};
          const role = (userObj.role || loan.role || 'user').toLowerCase();
          const isAdmin = role === 'admin' || role === 'superadmin';
          return !isAdmin;
        })
        .map((loan) => {
          const userObj = typeof loan.userId === 'object' && loan.userId !== null ? loan.userId : {};
          const name = (userObj.firstName || userObj.lastName)
            ? `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim()
            : (userObj.fullName || loan.fullName || 'Customer');
          const email = userObj.email || loan.email || 'N/A';
          const phone = userObj.phoneNumber || loan.phoneNumber || userObj.phone || 'N/A';

          const loanAmount = Number(loan.amount || 0);
          const amountPaid = Number(loan.amountPaid || 0);
          const totalRepayable = Number(loan.totalRepayment || loanAmount * 1.15 || 0);
          const remainingBalance = Math.max(totalRepayable - amountPaid, 0);

          const dateStr = loan.createdAt 
            ? new Date(loan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A';

          return {
            id: loan._id || loan.id || 'PFX-0000',
            rawId: loan._id,
            userId: userObj._id || loan.userId || 'N/A',
            user: name,
            email: email,
            phone: phone,
            loanCollected: loanAmount,
            amountPaidBack: amountPaid,
            remainingBalance: remainingBalance,
            formattedCollected: `₦${loanAmount.toLocaleString()}`,
            formattedPaidBack: `₦${amountPaid.toLocaleString()}`,
            formattedRemaining: `₦${remainingBalance.toLocaleString()}`,
            status: (loan.status || 'pending').toLowerCase(),
            date: dateStr,
          };
        });

      setRecords(userRecords);
    } catch (err) {
      console.error('Error fetching user loans/transactions:', err);
      setError(err.message || 'Failed to load user financial records.');
      toast.error('Failed to load user records.');
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    fetchUserTransactionsAndLoans();
  }, [fetchUserTransactionsAndLoans]);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      filterType === 'all' || rec.status === filterType;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = records.reduce((sum, r) => sum + r.loanCollected, 0);
  const totalPaidBack = records.reduce((sum, r) => sum + r.amountPaidBack, 0);
  const totalRemaining = records.reduce((sum, r) => sum + r.remainingBalance, 0);

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-wallet" style={{ color: 'var(--payflex-primary)' }}></i>
            User Financial & Wallet Portfolio
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)', margin: '0.25rem 0 0 0' }}>
            Customer account audit: Loan principal collected, total repayments collected, balance outstanding, and push reminders.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'active', 'disbursed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--payflex-border)',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                cursor: 'pointer',
                backgroundColor: filterType === tab ? 'var(--payflex-primary)' : 'var(--payflex-surface)',
                color: filterType === tab ? '#ffffff' : 'var(--payflex-text-primary)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--payflex-surface)', border: '1px solid var(--payflex-border)', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>Total Loans Collected</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--payflex-text-primary)', marginTop: '0.25rem' }}>
            ₦{totalCollected.toLocaleString()}
          </div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--payflex-surface)', border: '1px solid var(--payflex-border)', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>Total Amount Paid Back</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a', marginTop: '0.25rem' }}>
            ₦{totalPaidBack.toLocaleString()}
          </div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--payflex-surface)', border: '1px solid var(--payflex-border)', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>Total Remaining Balance</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706', marginTop: '0.25rem' }}>
            ₦{totalRemaining.toLocaleString()}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--payflex-surface)', borderRadius: '12px', border: '1px solid var(--payflex-border)' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--payflex-primary)' }}></i>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--payflex-text-secondary)' }}>Loading customer financial records...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <strong>Error loading records:</strong> {error}
        </div>
      ) : (
        /* User Financial Table */
        <div style={{ backgroundColor: 'var(--payflex-surface)', border: '1px solid var(--payflex-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--payflex-border)', backgroundColor: 'var(--payflex-icon-bg)', color: 'var(--payflex-text-secondary)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Loan ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer (User)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Loan Collected</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount Paid Back</th>
                <th style={{ padding: '0.85rem 1rem' }}>Remaining Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Push Reminder</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--payflex-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--payflex-primary-dark)' }}>{rec.id}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--payflex-text-primary)' }}>{rec.user}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)' }}>{rec.email} • {rec.phone}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{rec.formattedCollected}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#16a34a' }}>{rec.formattedPaidBack}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: rec.remainingBalance > 0 ? '#d97706' : '#166534' }}>
                      {rec.formattedRemaining}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        backgroundColor: rec.status === 'disbursed' || rec.status === 'active' ? '#dcfce7' : rec.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: rec.status === 'disbursed' || rec.status === 'active' ? '#166534' : rec.status === 'pending' ? '#92400e' : '#991b1b',
                      }}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        disabled={notifyingId === rec.id}
                        onClick={() => sendPushReminder(rec)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: notifyingId === rec.id ? 'not-allowed' : 'pointer',
                          backgroundColor: 'var(--payflex-primary)',
                          color: '#ffffff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <i className="fa-solid fa-bell"></i>
                        {notifyingId === rec.id ? 'Sending...' : 'Push Notify User'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--payflex-text-secondary)' }}>
                    No customer records found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}