import React from 'react';
import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  monthsList: string[];
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onSelectMonth,
  monthsList,
}) => {
  const currentMonthIdx = new Date().getMonth();
  const currentMonthName = monthsList[currentMonthIdx] || 'Jul';

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 py-2.5 overflow-x-auto no-scrollbar">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mr-3 pr-3 border-r border-slate-200 shrink-0">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Mês de Referência:</span>
          </div>

          {monthsList.map((m) => {
            const isSelected = selectedMonth === m;
            const isCurrentMonth = currentMonthName === m;

            return (
              <button
                key={m}
                onClick={() => onSelectMonth(m)}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{m}</span>
                {isCurrentMonth && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-indigo-600'
                    }`}
                    title="Mês Atual"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
