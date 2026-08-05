import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface WeeklyCalendarProps {
  selectedDay: number | null;
  onSelectDay: (day: number | null, month?: number) => void;
}

interface MonthData {
  name: string;
  year: number;
  monthNum: number; // 1-12
  daysCount: number;
  startDayOfWeek: number; // 0 = Mon, 1 = Tue, ..., 5 = Sat, 6 = Sun
}

const generateMonths = (): MonthData[] => {
  const now = new Date();
  const months: MonthData[] = [];
  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = monthDate.getFullYear();
    const monthNum = monthDate.getMonth() + 1;
    const daysCount = new Date(year, monthNum, 0).getDate();
    const startDayOfWeek = (new Date(year, monthNum - 1, 1).getDay() + 6) % 7;
    const rawName = monthDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    months.push({ name, year, monthNum, daysCount, startDayOfWeek });
  }
  return months;
};

const MONTHS: MonthData[] = generateMonths();

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDay, onSelectDay }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const { bookings } = useApp();

  const currentMonth = MONTHS[currentMonthIndex];

  // Helper to count bookings on a specific day number for the current month
  const getBookingsForDay = (dayNum: number) => {
    return bookings.filter((b) => {
      if (b.date) {
        const parts = b.date.split('-');
        if (parts.length === 3) {
          const bMonth = parseInt(parts[1], 10);
          const bDay = parseInt(parts[2], 10);
          return bMonth === currentMonth.monthNum && bDay === dayNum;
        }
      }
      return false;
    });
  };

  const emptyCells = Array.from({ length: currentMonth.startDayOfWeek });
  const dayCells = Array.from({ length: currentMonth.daysCount }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 relative overflow-hidden">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-headline text-base sm:text-lg font-extrabold text-[#006c49] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">calendar_month</span>
            <span>ALMANAQUE DE RESERVAS</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Vista mensual completa • Selecciona un día para ver los turnos
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-gray-100/80 px-2 py-1 rounded-xl text-xs sm:text-sm font-bold text-gray-700">
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentMonthIndex === 0}
              className="p-1 hover:text-[#006c49] disabled:opacity-30 disabled:hover:text-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <span className="px-2 min-w-[120px] text-center">{currentMonth.name}</span>
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => Math.min(MONTHS.length - 1, prev + 1))}
              disabled={currentMonthIndex === MONTHS.length - 1}
              className="p-1 hover:text-[#006c49] disabled:opacity-30 disabled:hover:text-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 uppercase mb-2">
        {WEEKDAY_LABELS.map((lbl, i) => (
          <div key={i} className="py-1">
            {lbl}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {/* Leading empty cells for month offset */}
        {emptyCells.map((_, idx) => (
          <div key={`empty-${idx}`} className="h-9 sm:h-11 rounded-xl bg-transparent"></div>
        ))}

        {/* Day Cells */}
        {dayCells.map((dNum) => {
          const isSelected = selectedDay === dNum;
          const dayBookings = getBookingsForDay(dNum);
          const hasBookings = dayBookings.length > 0;
          const hasPaid = dayBookings.some((b) => b.status === 'Pagado');
          const hasPending = dayBookings.some((b) => b.status === 'Pendiente');
          const hasCanceled = dayBookings.some((b) => b.status === 'Cancelado');

          return (
            <button
              key={dNum}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : dNum, isSelected ? undefined : currentMonth.monthNum)}
              className={`h-9 sm:h-11 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#006c49] text-white shadow-md ring-2 ring-[#006c49] ring-offset-1 scale-105 z-10'
                  : hasBookings
                  ? 'bg-emerald-50/80 text-[#006c49] hover:bg-emerald-100 border border-emerald-200/70'
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <span>{dNum}</span>

              {/* Status Indicator Dots */}
              {hasBookings && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasPaid && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  )}
                  {hasPending && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-500'}`} />
                  )}
                  {hasCanceled && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-red-200' : 'bg-red-500'}`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-medium gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pagado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Cancelado
          </span>
        </div>

        {selectedDay && (
          <span className="text-[#006c49] font-bold">
            Filtrando día {selectedDay} de {currentMonth.name}
          </span>
        )}
      </div>
    </div>
  );
};
