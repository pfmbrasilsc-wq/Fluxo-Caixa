import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  selectedYear: number;
  onSelectMonth: (month: string) => void;
  onSelectYear: (year: number) => void;
  monthsList: string[];
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  selectedYear,
  onSelectMonth,
  onSelectYear,
  monthsList,
}) => {
  const now = new Date();
  const currentRealMonthIdx = now.getMonth();
  const currentRealMonthName = monthsList[currentRealMonthIdx] || 'Jul';
  const currentRealYear = now.getFullYear();

  const isCurrentRealMonthAndYear =
    selectedMonth === currentRealMonthName && selectedYear === currentRealYear;

  const currentSelectedMonthIndex = monthsList.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    if (currentSelectedMonthIndex > 0) {
      onSelectMonth(monthsList[currentSelectedMonthIndex - 1]);
    } else {
      // Go to Dez of previous year
      onSelectMonth(monthsList[11]);
      onSelectYear(selectedYear - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentSelectedMonthIndex < 11) {
      onSelectMonth(monthsList[currentSelectedMonthIndex + 1]);
    } else {
      // Go to Jan of next year
      onSelectMonth(monthsList[0]);
      onSelectYear(selectedYear + 1);
    }
  };

  const handleResetToCurrent = () => {
    onSelectMonth(currentRealMonthName);
    onSelectYear(currentRealYear);
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Year & Month Steppers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector Control */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onSelectYear(selectedYear - 1)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
                title="Ano Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-900 tracking-tight">
                Ano: {selectedYear}
              </span>
              <button
                onClick={() => onSelectYear(selectedYear + 1)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
                title="Próximo Ano"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Month Stepper */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-1.5">
                {selectedMonth} / {selectedYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
                title="Próximo Mês"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isCurrentRealMonthAndYear && (
              <button
                onClick={handleResetToCurrent}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all shadow-2xs"
                title="Voltar para Mês e Ano Atual"
              >
                <RotateCcw className="w-3 h-3 text-indigo-600" />
                <span>Hoje ({currentRealMonthName}/{currentRealYear})</span>
              </button>
            )}
          </div>

          {/* Label Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>
              Exibindo Período: <strong className="text-slate-900 font-bold">{selectedMonth} de {selectedYear}</strong>
            </span>
          </div>
        </div>

        {/* Month Buttons Bar */}
        <div className="flex items-center space-x-1 py-1 overflow-x-auto no-scrollbar">
          {monthsList.map((m) => {
            const isSelected = selectedMonth === m;
            const isRealCurrentMonth = currentRealMonthName === m && selectedYear === currentRealYear;

            return (
              <button
                key={m}
                onClick={() => onSelectMonth(m)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{m}</span>
                {isRealCurrentMonth && (
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

