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

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9ff] dark:bg-[#111c2d] text-[#111c2d] font-body">
      {/* Shared Header */}
      <Header
        activeTab={userRole === 'player' ? activeClientTab : activeOwnerSubTab}
        setActiveTab={(tab) => {
          if (userRole === 'player') setActiveClientTab(tab);
          else setActiveOwnerSubTab(tab);
        }}
      />

      {/* Main View Content */}
      <div className="flex-1 pb-20 md:pb-6">
        {userRole === 'owner' ? (
          <OwnerDashboard
            activeOwnerSubTab={activeOwnerSubTab}
            setActiveOwnerSubTab={setActiveOwnerSubTab}
          />
        ) : (
          <>
            {activeClientTab === 'my-bookings' ? (
              <MyBookings />
            ) : activeClientTab === 'favorites' ? (
              <CourtSearch onlyFavorites={true} />
            ) : (
              <CourtSearch />
            )}
          </>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={userRole === 'player' ? activeClientTab : activeOwnerSubTab}
        setActiveTab={(tab) => {
          if (userRole === 'player') setActiveClientTab(tab);
          else setActiveOwnerSubTab(tab);
        }}
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
