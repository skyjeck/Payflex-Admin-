import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/layout/AdminLayout';

export default function KycPage({ activeTab, setActiveTab, handleLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal State
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [customReason, setCustomReason] = useState('Blurry or unreadable document uploaded');

  // Map frontend status filter to API backend status enum
  const mapFilterToApiStatus = (filter) => {
    switch (filter) {
      case 'pending':
        return 'PENDING';
      case 'approved':
        return 'VERIFIED';
      case 'rejected':
        return 'REJECTED';
      case 'unverified':
        return 'UNVERIFIED';
      default:
        return '';
    }
  };

  // 1. Fetch KYC Applications from Backend API
  const fetchKycApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const apiStatus = mapFilterToApiStatus(statusFilter);

      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(apiStatus && { status: apiStatus }),
      });

      const response = await fetch(`http://localhost:4000/api/admin/kyc?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 && handleLogout) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load KYC applications');
      }

      // Sandbox Identity Validator
      const validateIdentityString = (idString) => {
        if (!idString || idString === 'N/A') return 'N/A';
        // Sandbox rule: 11 digit numbers are MATCHED
        const is11Digits = /^\d{11}$/.test(idString);
        return is11Digits ? 'MATCHED' : 'NOT MATCHED';
      };

      // Map raw backend user documents into UI display format without dummy values
     const mappedList = (data.users || []).map((user) => {
  const kycDetails = user.kycDetails || {};

  // Resolve submission date (prefers kycDetails.submittedAt, falls back to user.createdAt)
  const rawDate = kycDetails.submittedAt || user.createdAt;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  // Comprehensive fallback resolution for document URLs and identity numbers
  const resolvedSelfie =
    kycDetails.selfieUrl ||
    kycDetails.liveSelfieUrl ||
    kycDetails.selfie ||
    user.selfieUrl ||
    user.liveSelfieUrl ||
    user.selfie ||
    null;

  const resolvedDoc =
    kycDetails.docUrl ||
    kycDetails.documentUrl ||
    kycDetails.idDocumentUrl ||
    kycDetails.idCardUrl ||
    kycDetails.documentImage ||
    user.docUrl ||
    user.documentUrl ||
    user.idDocumentUrl ||
    user.idCardUrl ||
    user.documentImage ||
    null;

  const resolvedBvn = kycDetails.bvn || user.bvn || user.bvnNumber || 'N/A';
  const resolvedNin = kycDetails.nin || user.nin || user.ninNumber || 'N/A';

  return {
    id: user._id,
    userId: user._id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    bvn: resolvedBvn,
    nin: resolvedNin,
    
    // Tier calculations
    currentTier: user.currentTier 
      ? `Tier ${user.currentTier}` 
      : user.kycTier > 1 
      ? `Tier ${user.kycTier - 1}` 
      : 'Tier 1',
    targetTier: kycDetails.targetTier 
      ? `Tier ${kycDetails.targetTier}` 
      : user.kycTier 
      ? `Tier ${user.kycTier}` 
      : 'N/A',

    // Key fixes for schema property mismatches:
    docType: kycDetails.docType || kycDetails.documentType || user.docType || user.documentType || 'Identity Document',
    docNumber: kycDetails.docNumber || kycDetails.documentNumber || user.docNumber || user.documentNumber || 'N/A',
    submittedAt: formattedDate,

    // Verification & AI details
    faceMatchScore: kycDetails.faceMatchScore ?? user.faceMatchScore ?? null,
    bvnStatus: kycDetails.bvnStatus || validateIdentityString(resolvedBvn),
    ninStatus: kycDetails.ninStatus || validateIdentityString(resolvedNin),
    status: user.kycStatus === 'VERIFIED' ? 'approved' : user.kycStatus?.toLowerCase() || 'pending',
    rejectionReason: kycDetails.rejectionReason || user.rejectionReason || '',

    // Supporting document links
    selfieUrl: resolvedSelfie,
    docUrl: resolvedDoc,
  };
});
      setKycList(mappedList);
      setPagination(data.pagination || { total: 0, pages: 1, limit: 10 });
    } catch (err) {
      console.error('Fetch KYC Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, handleLogout]);

  useEffect(() => {
    fetchKycApplications();
  }, [fetchKycApplications]);

  // 2. API Call: Approve KYC Application
  const handleApprove = async (id) => {
    const toastId = toast.loading('Approving KYC application...');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/kyc/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: id, action: 'APPROVE' }),
      });

      if (response.status === 401 && handleLogout) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to approve KYC application.');
      }

      setKycList((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'approved', currentTier: item.targetTier, rejectionReason: '' }
            : item
        )
      );
      setSelectedKyc((prev) =>
        prev && prev.id === id
          ? { ...prev, status: 'approved', currentTier: prev.targetTier, rejectionReason: '' }
          : prev
      );
      toast.success('KYC application approved successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Approval Failed', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. API Call: Reject KYC Application
  const handleReject = async (id) => {
    const toastId = toast.loading('Rejecting KYC application...');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/kyc/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: id, action: 'REJECT', rejectionReason: customReason }),
      });

      if (response.status === 401 && handleLogout) {
        handleLogout();
        return;
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reject KYC application.');
      }

      setKycList((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'rejected', rejectionReason: customReason }
            : item
        )
      );
      setSelectedKyc((prev) =>
        prev && prev.id === id
          ? { ...prev, status: 'rejected', rejectionReason: customReason }
          : prev
      );
      toast.success('KYC application rejected.', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Rejection Failed', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Client-side search filtering across loaded records
  const filteredKyc = kycList.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bvn.includes(searchQuery)
    );
  });

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--payflex-primary)' }}></i>
            KYC & Compliance Verification
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)', margin: '0.25rem 0 0 0' }}>
            Biometric identity verification, facial recognition checks, and automated NIBSS/NIN validation audit.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved & Verified' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--payflex-border)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? 'var(--payflex-primary)' : 'var(--payflex-surface)',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--payflex-text-primary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <strong>Error loading applications:</strong> {error}
        </div>
      )}

      {/* Verification Pipeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--payflex-surface)', borderRadius: '12px' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--payflex-primary)' }}></i>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--payflex-text-secondary)' }}>Loading KYC applications from database...</p>
          </div>
        ) : filteredKyc.length > 0 ? (
          filteredKyc.map((kyc) => (
            <div
              key={kyc.id}
              style={{
                backgroundColor: 'var(--payflex-surface)',
                border: '1px solid var(--payflex-border)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              {/* Applicant Info & Liveness Thumbnail */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                <div style={{ position: 'relative' }}>
                  {kyc.selfieUrl ? (
                    <img
                      src={kyc.selfieUrl}
                      alt={kyc.name}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--payflex-border)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--payflex-icon-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--payflex-text-muted)',
                        fontSize: '1.2rem',
                        border: '2px solid var(--payflex-border)',
                      }}
                    >
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}

                  {kyc.faceMatchScore !== null && (
                    <span
                      title={`Biometric Match: ${kyc.faceMatchScore}%`}
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        backgroundColor: kyc.faceMatchScore >= 80 ? '#16a34a' : '#dc2626',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: '800',
                        padding: '1px 5px',
                        borderRadius: '8px',
                      }}
                    >
                      {kyc.faceMatchScore}%
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--payflex-text-primary)' }}>
                    {kyc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)' }}>
                    {kyc.email} • {kyc.phone}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--payflex-text-muted)', marginTop: '2px' }}>
                    ID: {kyc.id} • Submitted {kyc.submittedAt}
                  </div>
                </div>
              </div>

              {/* Document & Tier Requested */}
              <div style={{ minWidth: '180px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--payflex-text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                  Document Type
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--payflex-text-primary)', marginTop: '2px' }}>
                  {kyc.docType}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--payflex-primary)', fontWeight: '700', marginTop: '2px' }}>
                  Upgrade: {kyc.currentTier} ➔ {kyc.targetTier}
                </div>
              </div>

              {/* Automated AI Validation Status Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem' }}>
                  <span style={{ color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>BVN Registry:</span>
                  <span style={{ fontWeight: '700', color: kyc.bvnStatus === 'MATCHED' ? '#16a34a' : 'var(--payflex-text-primary)' }}>
                    {kyc.bvnStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem' }}>
                  <span style={{ color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>NIN Verification:</span>
                  <span style={{ fontWeight: '700', color: kyc.ninStatus === 'MATCHED' ? '#16a34a' : 'var(--payflex-text-primary)' }}>
                    {kyc.ninStatus}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    backgroundColor:
                      kyc.status === 'approved'
                        ? '#dcfce7'
                        : kyc.status === 'pending'
                        ? '#fef3c7'
                        : '#fee2e2',
                    color:
                      kyc.status === 'approved'
                        ? '#15803d'
                        : kyc.status === 'pending'
                        ? '#b45309'
                        : '#991b1b',
                  }}
                >
                  {kyc.status}
                </span>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => setSelectedKyc(kyc)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--payflex-border)',
                    backgroundColor: 'var(--payflex-surface)',
                    color: 'var(--payflex-text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <i className="fa-solid fa-microscope" style={{ color: 'var(--payflex-primary)' }}></i>
                  Audit & Inspect
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'var(--payflex-surface)',
              borderRadius: '12px',
              border: '1px solid var(--payflex-border)',
              color: 'var(--payflex-text-secondary)',
            }}
          >
            <i className="fa-solid fa-folder-open" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--payflex-text-muted)' }}></i>
            <p style={{ margin: 0, fontWeight: '600' }}>No KYC submissions found in this view.</p>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--payflex-border)', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--payflex-border)', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Side-by-Side Biometric & Document Inspection Modal */}
      {selectedKyc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--payflex-surface)',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              border: '1px solid var(--payflex-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--payflex-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Compliance Inspection Suite — {selectedKyc.id}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--payflex-text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Applicant: <strong>{selectedKyc.name}</strong> ({selectedKyc.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedKyc(null)}
                style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--payflex-text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Split Comparison View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Left Column: Biometric Facial Match */}
              <div style={{ backgroundColor: 'var(--payflex-icon-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--payflex-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--payflex-text-secondary)', marginBottom: '0.75rem' }}>
                  Biometric Facial Comparison
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    {selectedKyc.selfieUrl ? (
                      <img
                        src={selectedKyc.selfieUrl}
                        alt="Live Selfie"
                        style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '2px solid var(--payflex-primary)' }}
                      />
                    ) : (
                      <div style={{ width: '110px', height: '110px', borderRadius: '10px', backgroundColor: 'var(--payflex-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--payflex-border)', color: 'var(--payflex-text-muted)' }}>
                        No Selfie
                      </div>
                    )}
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--payflex-text-secondary)', display: 'block', marginTop: '4px' }}>
                      Live Selfie
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    {selectedKyc.docUrl ? (
                      <img
                        src={selectedKyc.docUrl}
                        alt="Extracted Photo"
                        style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '10px', border: '2px solid var(--payflex-border)' }}
                      />
                    ) : (
                      <div style={{ width: '110px', height: '110px', borderRadius: '10px', backgroundColor: 'var(--payflex-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--payflex-border)', color: 'var(--payflex-text-muted)' }}>
                        No ID Photo
                      </div>
                    )}
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--payflex-text-secondary)', display: 'block', marginTop: '4px' }}>
                      ID Photo
                    </span>
                  </div>
                </div>

                {/* Score Bar */}
                <div style={{ backgroundColor: 'var(--payflex-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--payflex-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <span>AI Facial Match Confidence</span>
                    <span style={{ color: (selectedKyc.faceMatchScore ?? 0) >= 80 ? '#16a34a' : '#dc2626' }}>
                      {selectedKyc.faceMatchScore !== null ? `${selectedKyc.faceMatchScore}%` : 'N/A'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${selectedKyc.faceMatchScore || 0}%`,
                        height: '100%',
                        backgroundColor: (selectedKyc.faceMatchScore ?? 0) >= 80 ? '#16a34a' : '#dc2626',
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scanned Document & Verification Data */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--payflex-text-secondary)', marginBottom: '0.5rem' }}>
                  Uploaded {selectedKyc.docType}
                </div>

                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--payflex-border)', marginBottom: '1rem', height: '160px', backgroundColor: 'var(--payflex-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedKyc.docUrl ? (
                    <img
                      src={selectedKyc.docUrl}
                      alt="Document Scan"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ color: 'var(--payflex-text-muted)', fontSize: '0.85rem' }}>No Document Uploaded</div>
                  )}
                </div>

                {/* Extracted Record Comparison */}
                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: 'var(--payflex-icon-bg)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>BVN Number:</span>
                    <span style={{ fontWeight: '700' }}>{selectedKyc.bvn}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: 'var(--payflex-icon-bg)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>NIN Number:</span>
                    <span style={{ fontWeight: '700' }}>{selectedKyc.nin}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: 'var(--payflex-icon-bg)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--payflex-text-secondary)', fontWeight: '600' }}>Target Limit Tier:</span>
                    <span style={{ fontWeight: '800', color: 'var(--payflex-primary)' }}>{selectedKyc.targetTier}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Feedback Select */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--payflex-text-secondary)' }}>
                Rejection Note / Feedback Reason (if rejecting)
              </label>
              <select
                disabled={selectedKyc.status === 'approved' || selectedKyc.status === 'rejected'}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--payflex-border)',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--payflex-surface)',
                  color: 'var(--payflex-text-primary)',
                  opacity: selectedKyc.status === 'approved' || selectedKyc.status === 'rejected' ? 0.6 : 1,
                }}
              >
                <option value="Blurry or unreadable document uploaded">Blurry or unreadable document uploaded</option>
                <option value="Expired government identification document">Expired government identification document</option>
                <option value="Facial mismatch between selfie and ID photo">Facial mismatch between selfie and ID photo</option>
                <option value="Name mismatch against official BVN registry">Name mismatch against official BVN registry</option>
                <option value="Invalid NIN slip format">Invalid NIN slip format</option>
              </select>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--payflex-border)', paddingTop: '1rem' }}>
              <button
                disabled={actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected'}
                onClick={() => handleReject(selectedKyc.id)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  opacity: (actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected') ? 0.5 : 1,
                  cursor: (actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected') ? 'not-allowed' : 'pointer',
                }}
              >
                {selectedKyc.status === 'rejected' ? 'Rejected' : actionLoading ? 'Processing...' : 'Reject Identification'}
              </button>

              <button
                disabled={actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected'}
                onClick={() => handleApprove(selectedKyc.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--payflex-primary)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  opacity: (actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected') ? 0.5 : 1,
                  cursor: (actionLoading || selectedKyc.status === 'approved' || selectedKyc.status === 'rejected') ? 'not-allowed' : 'pointer',
                }}
              >
                {selectedKyc.status === 'approved' ? 'Approved & Granted' : actionLoading ? 'Processing...' : `Approve & Grant ${selectedKyc.targetTier}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}