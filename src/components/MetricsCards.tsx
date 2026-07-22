import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardsProps {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  costCentersBalanceTotal: number;
  selectedMonth: string;
  selectedYear: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalIncome,
  totalExpense,
  selectedMonth,
  selectedYear,
}) => {
  const monthMovement = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Receitas do mês */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Receitas do mês ({selectedMonth}/{selectedYear})
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight flex items-center gap-1">
            {formatCurrency(totalIncome)}
            <ArrowUpRight className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Somatório das receitas na aba Lançamentos
          </div>
        </div>
      </div>

      {/* 2. Despesas do mês */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Despesas do mês ({selectedMonth}/{selectedYear})
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight flex items-center gap-1">
            {formatCurrency(totalExpense)}
            <ArrowDownRight className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Somatório das despesas na aba Lançamentos
          </div>
        </div>
      </div>

      {/* 3. Movimentação do mês */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Movimentação do mês ({selectedMonth}/{selectedYear})
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Calculator className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              monthMovement >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(monthMovement)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Receitas do mês - Despesas do mês
          </div>
        </div>
      </div>
    </div>
  );
};

