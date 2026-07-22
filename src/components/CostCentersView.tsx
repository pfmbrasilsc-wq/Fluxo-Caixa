import React from 'react';
import { CostCenter } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Target, CreditCard, Plus, ShieldAlert } from 'lucide-react';

interface CostCentersViewProps {
  costCenters: CostCenter[];
  onNewTransactionForCC: (costCenterName: string, card: string) => void;
}

export const CostCentersView: React.FC<CostCentersViewProps> = ({
  costCenters,
  onNewTransactionForCC,
}) => {
  if (costCenters.length === 0) return null;

  const totalCCBalance = costCenters.reduce((sum, cc) => sum + (cc.balance || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Centros de Custo</h3>
            <p className="text-xs text-slate-500 font-medium">
              Saldos acumulados por projeto/objetivo (Tratados como Despesas)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Acumulado</span>
          <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
            {formatCurrency(totalCCBalance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {costCenters.map((cc) => (
          <div
            key={cc.name}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cc.name}
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>{cc.associatedCard || 'Cartão Padrão'}</span>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-2 py-0.5 rounded-lg shadow-2xs">
                {formatCurrency(cc.balance)}
              </span>
            </div>

            <button
              onClick={() => onNewTransactionForCC(cc.name, cc.associatedCard)}
              className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 hover:border-indigo-200 flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lançar p/ {cc.name}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
