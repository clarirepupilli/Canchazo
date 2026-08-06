import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { CourtSearch } from './components/client/CourtSearch';
import { MyBookings } from './components/client/MyBookings';
import { OwnerDashboard } from './components/owner/OwnerDashboard';

const MainAppContent: React.FC = () => {
  const { userRole } = useApp();
  const [activeClientTab, setActiveClientTab] = useState<string>('search');
  const [activeOwnerSubTab, setActiveOwnerSubTab] = useState<string>('dashboard');
  // Owners can browse as a customer ("client") or manage their complex ("admin").
  const [ownerMode, setOwnerMode] = useState<'client' | 'admin'>('admin');

  const isClientMode = userRole === 'player' || ownerMode === 'client';
  const activeTab = isClientMode ? activeClientTab : activeOwnerSubTab;
  const handleSetTab = (tab: string) => {
    if (isClientMode) setActiveClientTab(tab);
    else setActiveOwnerSubTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] dark:bg-[#111c2d] text-[#111c2d] font-body">
      {/* Shared Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        ownerMode={ownerMode}
        setOwnerMode={setOwnerMode}
      />

      {/* Main View Content */}
      <div className="flex-1 pb-20 md:pb-6">
        {isClientMode ? (
          <>
            {activeClientTab === 'my-bookings' ? (
              <MyBookings />
            ) : activeClientTab === 'favorites' ? (
              <CourtSearch onlyFavorites={true} />
            ) : (
              <CourtSearch />
            )}
          </>
        ) : (
          <OwnerDashboard
            activeOwnerSubTab={activeOwnerSubTab}
            setActiveOwnerSubTab={setActiveOwnerSubTab}
          />
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        ownerMode={ownerMode}
        setOwnerMode={setOwnerMode}
      />

      {/* Shared Auth Modal */}
      <AuthModal />

      {/* Action Toast Notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
