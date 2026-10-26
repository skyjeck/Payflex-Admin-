import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import MetricCards from '../components/loans/MetricCards';
import RepaymentChart from '../components/loans/RepaymentChart';
import LoanDistribution from '../components/loans/LoanDistribution';
import LoanTable from '../components/loans/LoanTable';
import LoanDetailModal from '../components/loans/LoanDetailModal';

// ─── Sample seed data (replace with real API calls) ──────────────────────────

export default function DashboardPage({ activeTab, setActiveTab, adminUser, adminToken, handleLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loans, setLoans] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  
    const token = adminToken || localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

    useEffect(() => {
      fetchLoans();
    }, []);

    const fetchLoans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/admin/loans', {
        method: 'GET',
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

      const formattedLoans = rawLoans.map((loan) => {
        const userObj = typeof loan.userId === 'object' && loan.userId !== null ? loan.userId : {};
        const name = (userObj.firstName || userObj.lastName)
          ? `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim()
          : (userObj.fullName || loan.fullName || adminUser?.fullName || 'N/A');
        const email = userObj.email || loan.email || adminUser?.email || 'N/A';
        const phone = userObj.phoneNumber || loan.phoneNumber || 'N/A';
        const avatar = name !== 'N/A'
          ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
          : 'PF';

        const formattedDate = loan.createdAt 
          ? new Date(loan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'N/A';

        return {
          id: loan._id || loan.id || 'PFX-0000',
          rawId: loan._id,
          userId: userObj._id || loan.userId || 'N/A',
          name,
          email,
          phone,
          avatar,
          amount: loan.amount || 0,
          interestRate: loan.interestRate || 0,
          tenure: loan.tenureMonths || loan.tenure || 0,
          monthlyEMI: loan.monthlyEMI || 0,
          totalRepayment: loan.totalRepayment || 0,
          amountPaid: loan.amountPaid || 0,
          remainingBalance: loan.remainingBalance || 0,
          purpose: loan.purpose || 'Emergency Business Capital',
          status: (loan.status || 'pending').toLowerCase(),
          date: formattedDate,
          createdAt: loan.createdAt,
        };
      });

      setLoans(formattedLoans);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError(err.message || 'Something went wrong while fetching loans.');
    } finally {
      setIsLoading(false);
    }
  };

    const filteredLoans = loans.filter((loan) => {
    const q = searchQuery.toLowerCase();
    return (
      loan.name.toLowerCase().includes(q) ||
      loan.id.toLowerCase().includes(q) ||
      loan.email.toLowerCase().includes(q) ||
      loan.purpose.toLowerCase().includes(q) ||
      loan.status.toLowerCase().includes(q)
    );
  });


  const handleApprove = async (approvalData = {}) => {
    if (!selectedApplicant) return;
    const targetId = selectedApplicant.rawId || selectedApplicant.id;
    setIsProcessing(true);
    try {
      const payload = (typeof approvalData === 'object' && approvalData !== null && !('nativeEvent' in approvalData))
        ? approvalData
        : {};
      const response = await fetch(`http://localhost:4000/api/admin/loans/${targetId}/approve-disburse`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve and disburse loan.');
      }

      setLoans((prev) =>
        prev.map((l) => (l.rawId === targetId || l.id === targetId ? { ...l, status: 'disbursed' } : l))
      );
      setSelectedApplicant(null);
    } catch (err) {
      alert(`Approval Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (rejectionReason = '') => {
    if (!selectedApplicant) return;
    const targetId = selectedApplicant.rawId || selectedApplicant.id;
    setIsProcessing(true);
    try {
      const reasonText = typeof rejectionReason === 'string' ? rejectionReason : '';
      const response = await fetch(`http://localhost:4000/api/admin/loans/${targetId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: reasonText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject loan application.');
      }

      setLoans((prev) =>
        prev.map((l) => (l.rawId === targetId || l.id === targetId ? { ...l, status: 'rejected' } : l))
      );
      setSelectedApplicant(null);
    } catch (err) {
      alert(`Rejection Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPortfolio = loans.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const activeBorrowers = new Set(loans.filter((l) => l.status === 'active' || l.status === 'disbursed').map((l) => l.userId)).size;
  const pendingCount = loans.filter((l) => l.status === 'pending').length;

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      adminUser={adminUser}
      handleLogout={handleLogout}
    >
      <MetricCards
        totalPortfolio={totalPortfolio}
        activeBorrowers={activeBorrowers}
        pendingCount={pendingCount}
      />

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--payflex-text-secondary)' }}>
          Loading dashboard loans...
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
          <button 
            onClick={fetchLoans} 
            style={{ marginLeft: '1rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#EF4444', fontWeight: '600' }}
          >
            Retry
          </button>
        </div>
      ) : (
        <LoanTable
          loans={filteredLoans}
          onViewApplicant={(loan) => setSelectedApplicant(loan)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="analytics-grid">
        <RepaymentChart loans={loans} />
        <LoanDistribution loans={loans} />
      </div>

      <LoanDetailModal
        loan={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        onApprove={handleApprove}
        onApproveDisburse={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}