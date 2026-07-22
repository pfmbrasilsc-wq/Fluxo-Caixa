import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardsProps {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  costCentersBalanceTotal: number;
  selectedMonth: string;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalIncome,
  totalExpense,
  currentBalance,
  costCentersBalanceTotal,
  selectedMonth,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Saldo Realizado */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Saldo Realizado ({selectedMonth})
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              currentBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(currentBalance)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span>Receitas do Mês - Despesas Totais</span>
          </div>
        </div>
      </div>

      {/* Total Receitas */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Receitas ({selectedMonth})
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
            Entradas e rendimentos confirmados
          </div>
        </div>
      </div>

      {/* Total Despesas */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Despesas ({selectedMonth})
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
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Saídas e Cartões</span>
            {costCentersBalanceTotal > 0 && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 text-[11px] font-semibold">
                <Target className="w-3 h-3 text-amber-600" /> Centros de Custo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
