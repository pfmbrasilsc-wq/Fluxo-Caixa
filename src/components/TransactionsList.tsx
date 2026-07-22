import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR, CATEGORY_COLORS } from '../utils/formatters';
import { Search, ArrowUpRight, ArrowDownRight, Layers, CreditCard, Tag, Calendar } from 'lucide-react';

interface TransactionsListProps {
  transactions: Transaction[];
  selectedMonth: string;
  selectedYear: number;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  selectedMonth,
  selectedYear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Filter transactions
  const filtered = transactions.filter((t) => {
    // Type match
    if (filterType === 'income' && t.mode !== 1) return false;
    if (filterType === 'expense' && t.mode !== -1) return false;

    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchSub = (t.subcategory || '').toLowerCase().includes(q);
      const matchAcc = (t.account || '').toLowerCase().includes(q);
      return matchDesc || matchCat || matchSub || matchAcc;
    }

    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Histórico de Lançamentos ({selectedMonth}/{selectedYear})
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Lançamentos com data em {selectedMonth}/{selectedYear} na aba 'Lançamentos'
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
              filterType === 'income'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Receitas</span>
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
              filterType === 'expense'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Despesas</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por descrição, conta, categoria ou subcategoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 space-y-2">
          <Layers className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
          <p>
            {searchTerm.trim()
              ? 'Nenhum lançamento corresponde à busca.'
              : `Nenhum lançamento registrado no mês de ${selectedMonth}/${selectedYear}.`}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filtered.map((item) => {
            const isIncome = item.mode === 1;
            const categoryColor = CATEGORY_COLORS[item.category] || '#64748b';

            return (
              <div
                key={item.id}
                className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                {/* Left side: icon, description & tags */}
                <div className="flex items-start space-x-3 truncate mr-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.description || item.category}
                      </span>
                      {item.recurrence > 1 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          {item.recurrence}x
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500">
                      {/* Date */}
                      <span className="flex items-center space-x-1 text-slate-600 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDateBR(item.date)}</span>
                      </span>

                      <span className="text-slate-300">•</span>

                      {/* Account */}
                      <span className="flex items-center space-x-1 text-slate-700 font-medium">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{item.account}</span>
                      </span>

                      <span className="text-slate-300">•</span>

                      {/* Category */}
                      <span className="flex items-center space-x-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block shadow-2xs"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="text-slate-800 font-semibold">{item.category}</span>
                        {item.subcategory && (
                          <span className="text-slate-500">({item.subcategory})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {isIncome ? 'Receita' : 'Despesa'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
