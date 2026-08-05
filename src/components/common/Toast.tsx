import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] max-w-sm animate-bounce-short">
      <div className="bg-[#111c2d] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#10b981]/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#10b981] fill">check_circle</span>
        <span className="text-sm font-medium">{toastMessage}</span>
      </div>
    </div>
  );
};
