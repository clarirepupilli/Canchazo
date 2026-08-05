import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyCalendar } from './WeeklyCalendar';
import { BookingsList } from './BookingsList';
import { OwnerReviews } from './OwnerReviews';
import { NewBookingModal } from './NewBookingModal';
import { MyComplexForm } from './MyComplexForm';
import { RevenueChart } from './RevenueChart';

interface OwnerDashboardProps {
  activeOwnerSubTab: string;
  setActiveOwnerSubTab: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  activeOwnerSubTab,
  setActiveOwnerSubTab,
}) => {
  const { currentOwnerComplexName } = useApp();
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  const handleSelectDay = (day: number | null, month?: number) => {
    setSelectedCalendarDay(day);
    setSelectedMonth(day === null ? undefined : month);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#263143]">
      {/* Navigation Drawer (Desktop/Tablet) */}
      <aside className="hidden md:flex flex-col bg-[#f0f3ff] dark:bg-[#263143] shadow-2xl h-full w-72 border-r border-gray-200/20 py-6 shrink-0 z-20">
        {/* Manager Profile Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#6ffbbe] shadow-sm shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDwxHXSt7KvrjRK312LFZ5dZFrkYOkSxDjYpFG12BckhubrpG5P1N5jGiOag75Ju3AVibA2N6PLPGCNhsHjEyYL40r_CuEuqVcqbiPozQB5kwAd4_6Om2eJ2UToHbbPbtcZSynTRfYRWltAeTzEl7S6oxJbOo7kWJfHbxkT7kNsch5IXHYf5teMeQ-GzKuUcyGvZQ-gK0aw9jXiQDa2KgKIEtZ7sH0juUqWKZbo_-lqadtaKpP53A"
              alt="Arena Manager"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-headline text-base font-bold text-[#006c49] dark:text-[#6ffbbe]">
              Arena Manager
            </h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">
              {currentOwnerComplexName}
            </p>
          </div>
        </div>

        {/* Navigation Menu Links (Dashboard, Mi Complejo, Reseñas) */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3">
          <button
            type="button"
            onClick={() => setActiveOwnerSubTab('dashboard')}
            className={`flex items-center gap-3 font-headline text-xs font-bold rounded-xl p-3 transition-all ${
              activeOwnerSubTab === 'dashboard'
                ? 'bg-[#bdd6ff] text-[#445d80] shadow-sm'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined fill">dashboard</span>
            <span>Panel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOwnerSubTab('complex')}
            className={`flex items-center gap-3 font-headline text-xs font-bold rounded-xl p-3 transition-all ${
              activeOwnerSubTab === 'complex'
                ? 'bg-[#bdd6ff] text-[#445d80] shadow-sm'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">domain</span>
            <span>Mi Complejo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveOwnerSubTab('reviews')}
            className={`flex items-center gap-3 font-headline text-xs font-bold rounded-xl p-3 transition-all ${
              activeOwnerSubTab === 'reviews'
                ? 'bg-[#bdd6ff] text-[#445d80] shadow-sm'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">rate_review</span>
            <span>Reseñas</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-12 bg-[#263143]">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header & Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {activeOwnerSubTab === 'complex'
                  ? 'Mi Complejo'
                  : activeOwnerSubTab === 'reviews'
                  ? 'Reseñas de Clientes'
                  : 'Panel de Administración'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#6ffbbe]">
                Vista del Dueño - {currentOwnerComplexName}
              </p>
            </div>

            {/* Nueva Reserva button is strictly on the Panel ('dashboard') view */}
            {activeOwnerSubTab === 'dashboard' && (
              <button
                type="button"
                onClick={() => setShowNewBookingModal(true)}
                className="flex items-center justify-center gap-2 bg-[#006c49] hover:bg-[#10b981] text-white px-5 py-2.5 rounded-full font-headline text-xs font-bold transition-transform active:scale-95 shadow-md self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Nueva Reserva</span>
              </button>
            )}
          </div>

          {/* Conditional Subtab Render */}
          {activeOwnerSubTab === 'complex' ? (
            <MyComplexForm />
          ) : activeOwnerSubTab === 'reviews' ? (
            <div className="max-w-3xl mx-auto">
              <OwnerReviews />
            </div>
          ) : (
            /* Main Panel Bento Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Span 8): Month Calendar & Bookings List */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <WeeklyCalendar
                  selectedDay={selectedCalendarDay}
                  onSelectDay={handleSelectDay}
                />
                <BookingsList
                  selectedDay={selectedCalendarDay}
                  selectedMonth={selectedMonth}
                  onClearDayFilter={() => handleSelectDay(null)}
                />
              </div>

              {/* Right Column (Span 4): Revenue & Reviews */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <RevenueChart />
                <OwnerReviews />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <NewBookingModal onClose={() => setShowNewBookingModal(false)} />
      )}
    </div>
  );
};
