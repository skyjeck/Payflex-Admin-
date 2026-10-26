import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  adminUser,
  handleLogout 
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        adminUser={adminUser}
        handleLogout={handleLogout}
      />

      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          onExport={() => alert('Exporting...')}
          onNewDisbursement={() => alert('New Disbursement')}
          adminUser={adminUser}
          handleLogout={handleLogout}
        />

        <main className="dashboard-container">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;