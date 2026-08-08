import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { MemberDashboard } from './pages/MemberDashboard';
import { MembersPage } from './pages/MembersPage';
import { TreasuryPage } from './pages/TreasuryPage';
import { FinancialReportsPage } from './pages/FinancialReportsPage';
import { PledgesPage } from './pages/PledgesPage';
import { AssetsPage } from './pages/AssetsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { GalleryPage } from './pages/GalleryPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-amber-400 flex flex-col items-center justify-center font-sans space-y-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Bidii SDA System...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  const isAdmin = user.role !== 'MEMBER';

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return isAdmin ? 'Executive Dashboard' : 'Member Portal';
      case 'members':
      case 'my-profile':
        return 'Church Members Registry';
      case 'treasury':
      case 'my-contributions':
        return 'Treasury & Digital Receipts';
      case 'reports':
        return 'Financial Analytics & Audit Reports';
      case 'pledges':
      case 'my-pledges':
        return 'Pledge Tracker & Commitments';
      case 'assets':
        return 'Church Asset Inventory';
      case 'announcements':
        return 'Church Bulletin & Announcements';
      case 'gallery':
        return 'Church Photo Gallery';
      case 'audit-logs':
        return 'Security Audit Logs';
      case 'settings':
        return 'System Configuration & MySQL Export';
      default:
        return 'Bidii SDA Church';
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard navigateTo={setCurrentTab} />
        ) : (
          <MemberDashboard />
        );
      case 'members':
      case 'my-profile':
        return <MembersPage />;
      case 'treasury':
      case 'my-contributions':
        return <TreasuryPage />;
      case 'reports':
        return <FinancialReportsPage />;
      case 'pledges':
      case 'my-pledges':
        return <PledgesPage />;
      case 'assets':
        return <AssetsPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return isAdmin ? (
          <AdminDashboard navigateTo={setCurrentTab} />
        ) : (
          <MemberDashboard />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
