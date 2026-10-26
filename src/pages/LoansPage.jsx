import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../components/layout/AdminLayout';
import LoanTable from '../components/loans/LoanTable';
import LoanDetailModal from '../components/loans/LoanDetailModal';

export default function LoansPage({ activeTab, setActiveTab, adminToken, adminUser, handleLogout }) {
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

  // Handler: Approve and Disburse Loan
  const handleApproveAndDisburse = async (loanId, approvalData = {}) => {
    const toastId = toast.loading('Processing approval & disbursing funds...');
    setIsProcessing(true);

    try {
      const payload = (typeof approvalData === 'object' && approvalData !== null && !('nativeEvent' in approvalData))
        ? approvalData
        : {};

      const response = await fetch(`http://localhost:4000/api/admin/loans/${loanId}/approve-disburse`, {
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

      const disbursedAmount = data.loan?.amount ? `₦${data.loan.amount.toLocaleString()} ` : '';
      toast.success(`Loan approved and ${disbursedAmount}disbursed successfully!`, { id: toastId });

      setSelectedApplicant(null);
      await fetchLoans();
    } catch (err) {
      console.error('Error approving loan:', err);
      toast.error(err.message || 'Something went wrong while processing approval.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Reject Loan Application
  const handleRejectLoan = async (loanId, rejectionReason = '') => {
    const toastId = toast.loading('Rejecting loan application...');
    setIsProcessing(true);

    try {
      const reasonText = typeof rejectionReason === 'string' ? rejectionReason : '';

      const response = await fetch(`http://localhost:4000/api/admin/loans/${loanId}/reject`, {
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

      toast.success('Loan application rejected successfully.', { id: toastId });

      setSelectedApplicant(null);
      await fetchLoans();
    } catch (err) {
      console.error('Error rejecting loan:', err);
      toast.error(err.message || 'Something went wrong while rejecting the loan.', { id: toastId });
    } finally {
      setIsProcessing(false);
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

  return (
    <AdminLayout
      activeTab={activeTab || 'loans'}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      adminUser={adminUser}
      handleLogout={handleLogout}
    >
      {/* Custom Styled Toast Provider */}
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

      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Loan Applications</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)' }}>
          Review, approve, disburse, and manage all credit requests.
        </p>
      </div>

      {/* State Indicators */}
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--payflex-text-secondary)' }}>
          Loading loans...
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
        />
      )}

      {/* Review Modal */}
      <LoanDetailModal
        loan={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        onApprove={(data) => handleApproveAndDisburse(selectedApplicant?.rawId || selectedApplicant?.id, data)}
        onApproveDisburse={(data) => handleApproveAndDisburse(selectedApplicant?.rawId || selectedApplicant?.id, data)}
        onReject={(reason) => handleRejectLoan(selectedApplicant?.rawId || selectedApplicant?.id, reason)}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}