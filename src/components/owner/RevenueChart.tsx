import React from 'react';
import { useApp } from '../../context/AppContext';

interface MonthBar {
  label: string;
  year: number;
  month: number;
  total: number;
}

export const RevenueChart: React.FC = () => {
  const { bookings } = useApp();

  const paidBookings = bookings.filter((b) => b.status === 'Pagado');
  const totalPaidRevenue = paidBookings.reduce((acc, b) => acc + b.price, 0);

  const now = new Date();
  const months: MonthBar[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleDateString('es-AR', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      total: 0,
    };
  });

  paidBookings.forEach((b) => {
    if (!b.date) return;
    const [year, month] = b.date.split('-').map(Number);
    if (!year || !month) return;
    const bar = months.find((m) => m.year === year && m.month === month);
    if (bar) bar.total += b.price;
  });

  const maxTotal = Math.max(...months.map((m) => m.total), 0);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#6ffbbe]/20 rounded-full blur-xl"></div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          INGRESOS TOTALES
        </h3>
        <div className="flex items-end justify-between mt-2">
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d]">
            $ {totalPaidRevenue.toLocaleString('es-AR')}
          </h2>
          <div className="flex items-center text-[#006c49] font-bold text-xs bg-[#10b981]/15 px-2.5 py-1 rounded-md">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span className="ml-1">{paidBookings.length} pagos</span>
          </div>
        </div>
      </div>

      {paidBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-6 h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <span className="material-symbols-outlined text-2xl text-gray-300 mb-1">bar_chart</span>
          <p className="text-[11px] font-semibold text-gray-500">Sin ingresos por el momento</p>
        </div>
      ) : (
        <div className="flex items-end gap-1.5 mt-6 h-20 w-full">
          {months.map((m, i) => {
            const height = maxTotal > 0 ? Math.max((m.total / maxTotal) * 100, 5) : 5;
            const isLast = i === months.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div className="w-full flex-1 flex items-end relative group/bar">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isLast
                        ? 'bg-[#006c49] shadow-[0_0_8px_rgba(0,108,73,0.4)]'
                        : 'bg-[#bdd6ff] hover:bg-[#476083]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold transition-opacity whitespace-nowrap z-10">
                    $ {m.total.toLocaleString('es-AR')}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 font-semibold">{m.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
