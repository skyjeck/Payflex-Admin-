import React from 'react';

const Header = ({ searchQuery, setSearchQuery, onNewDisbursement, onExport, onToggleMobileMenu }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onToggleMobileMenu} className="mobile-toggle icon-btn">
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicants, Loan IDs, BVN..."
          />
        </div>
      </div>

      <div className="header-actions">
        <button onClick={onExport} className="btn btn-secondary">
          <i className="fa-solid fa-file-export"></i>
          <span>Export</span>
        </button>

        <button onClick={onNewDisbursement} className="btn btn-primary">
          <i className="fa-solid fa-plus"></i>
          <span>Disbursement</span>
        </button>

        <button className="icon-btn" style={{ position: 'relative' }}>
          <i className="fa-solid fa-bell"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;