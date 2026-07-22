import React, { useState } from 'react';
import { AccountItem, CardItem, CostCenter, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Landmark,
  CreditCard,
  Target,
  Calculator,
  ChevronDown,
  ChevronUp,
  Minus,
  Equal,
  Plus,
  Wallet,
} from 'lucide-react';

interface BalancesPanelProps {
  accounts?: string[];
  accountItems?: AccountItem[];
  cards?: string[];
  cardItems?: CardItem[];
  costCenters?: CostCenter[];
  currentMonthTransactions: Transaction[];
  selectedMonth: string;
  selectedYear: number;
}

export const BalancesPanel: React.FC<BalancesPanelProps> = ({
  accounts = ['CEF', 'BB', 'MPg', 'WAL'],
  accountItems = [
    { name: 'CEF', description: 'Caixa Econômica Federal', balance: 3901.20 },
    { name: 'BB', description: 'Banco do Brasil', balance: 0.00 },
    { name: 'MPg', description: 'Mercado Pago', balance: 0.00 },
    { name: 'WAL', description: 'Carteira WAL', balance: 25.00 },
  ],
  cards = ['ELO', 'VISA'],
  cardItems = [
    { name: 'ELO', description: 'Cartão ELO', balance: 0.00 },
    { name: 'VISA', description: 'Cartão VISA', balance: 0.00 },
  ],
  costCenters = [
    { name: 'Supermercado', description: 'Supermercado', associatedCard: 'VISA', balance: 0.00 },
    { name: 'Restaurantes', description: 'Restaurantes', associatedCard: 'VISA', balance: 0.00 },
    { name: 'Farmácia', description: 'Farmácia', associatedCard: 'ELO', balance: 0.00 },
    { name: 'Posto', description: 'Posto de Combustível', associatedCard: 'ELO', balance: 0.00 },
  ],
  currentMonthTransactions,
  selectedMonth,
  selectedYear,
}) => {
  const [showDetails, setShowDetails] = useState(true);

  // 1. Movimentação do Mês (da aba Lançamentos)
  let monthIncome = 0;
  let monthExpense = 0;
  currentMonthTransactions.forEach((t) => {
    if (t.mode === 1) {
      monthIncome += t.amount;
    } else if (t.mode === -1) {
      monthExpense += t.amount;
    }
  });
  const monthMovement = monthIncome - monthExpense;

  // 2. Total das Contas (lido DIRETAMENTE da aba Contas)
  const totalAccountsBalance = accountItems.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );

  // 3. Total dos Cartões (lido DIRETAMENTE da aba Cartao)
  const totalCardsBalance = cardItems.reduce(
    (sum, card) => sum + (card.balance || 0),
    0
  );

  // 4. Total dos Centros de Custo (lido DIRETAMENTE da aba Centro Custo)
  const totalCostCentersBalance = costCenters.reduce(
    (sum, cc) => sum + (cc.balance || 0),
    0
  );

  // 5. Saldo Geral = [Movimentação do Mês] + [Total das Contas] - [Total dos Cartões] - [Total dos Centros de Custo]
  const saldoGeral =
    monthMovement + totalAccountsBalance - totalCardsBalance - totalCostCentersBalance;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Painel de Saldos & Consolidação Geral</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-200">
                {selectedMonth}/{selectedYear}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Fontes reais: Lançamentos do mês, Contas, Cartões e Centros de Custo
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <span>{showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Formula Summary Cards Grid */}
      <div className="p-5 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Movimentação do Mês */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Mov. Mês
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                Lançamentos
              </span>
            </div>
            <div>
              <div
                className={`text-lg font-extrabold tracking-tight ${
                  monthMovement >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(monthMovement)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Receitas - Despesas do Mês
              </p>
            </div>
          </div>

          {/* Card 2: Total das Contas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Saldo Contas
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Aba 'Contas'
              </span>
            </div>
            <div>
              <div
                className={`text-lg font-extrabold tracking-tight ${
                  totalAccountsBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {formatCurrency(totalAccountsBalance)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Soma da coluna Saldo da aba 'Contas'
              </p>
            </div>
          </div>

          {/* Card 3: Total dos Cartões */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-600" />
                Saldo Cartões
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Aba 'Cartao'
              </span>
            </div>
            <div>
              <div className="text-lg font-extrabold text-rose-600 tracking-tight">
                {formatCurrency(totalCardsBalance)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Soma da coluna Saldo da aba 'Cartao'
              </p>
            </div>
          </div>

          {/* Card 4: Total Centros de Custo */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" />
                Centros Custo
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Aba 'Centro Custo'
              </span>
            </div>
            <div>
              <div className="text-lg font-extrabold text-amber-700 tracking-tight">
                {formatCurrency(totalCostCentersBalance)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Soma da coluna Saldo de 'Centro Custo'
              </p>
            </div>
          </div>

          {/* Card 5: Saldo Geral (HERO CARD) */}
          <div className="p-4 rounded-xl bg-indigo-950 text-white border border-indigo-800 flex flex-col justify-between space-y-2 relative overflow-hidden shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Saldo Geral
              </span>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded-md border border-indigo-700">
                Resultado
              </span>
            </div>
            <div>
              <div
                className={`text-xl font-black tracking-tight ${
                  saldoGeral >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(saldoGeral)}
              </div>
              <p className="text-[11px] text-indigo-300 font-medium mt-0.5">
                Mov. + Contas - Cartões - CC
              </p>
            </div>
          </div>
        </div>

        {/* Formula Display Bar */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">
              Fórmula do Saldo Geral:
            </span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 font-bold shadow-2xs flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              Mov. Mês: {formatCurrency(monthMovement)}
            </span>
            <Plus className="w-4 h-4 text-emerald-600" />
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 font-bold shadow-2xs flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              Contas: {formatCurrency(totalAccountsBalance)}
            </span>
            <Minus className="w-4 h-4 text-rose-500" />
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 font-bold shadow-2xs flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-rose-600" />
              Cartões: {formatCurrency(totalCardsBalance)}
            </span>
            <Minus className="w-4 h-4 text-amber-500" />
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 font-bold shadow-2xs flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              Centros Custo: {formatCurrency(totalCostCentersBalance)}
            </span>
            <Equal className="w-4 h-4 text-indigo-600" />
            <span
              className={`px-2.5 py-1 rounded-lg border text-white font-black shadow-2xs ${
                saldoGeral >= 0
                  ? 'bg-emerald-600 border-emerald-700'
                  : 'bg-rose-600 border-rose-700'
              }`}
            >
              Saldo Geral: {formatCurrency(saldoGeral)}
            </span>
          </div>
        </div>

        {/* Detailed Individual Tables */}
        {showDetails && (
          <div className="pt-2 border-t border-slate-200 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabela 1: Saldo das Contas */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    Saldo das Contas ({accountItems.length})
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    Aba 'Contas'
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {accountItems.map((acc) => (
                    <div
                      key={acc.name}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {acc.description || acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Código / Nome: {acc.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                            acc.balance >= 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha Total das Contas */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-700 uppercase tracking-wider">
                    Total das Contas
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg border ${
                      totalAccountsBalance >= 0
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {formatCurrency(totalAccountsBalance)}
                  </span>
                </div>
              </div>

              {/* Tabela 2: Saldo dos Cartões */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-rose-600" />
                    Saldo dos Cartões ({cardItems.length})
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                    Aba 'Cartao'
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {cardItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-medium">
                      Nenhum Cartão cadastrado na aba 'Cartao'.
                    </div>
                  ) : (
                    cardItems.map((card) => (
                      <div
                        key={card.name}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {card.description || card.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Cartão: {card.name}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            {formatCurrency(card.balance)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Linha Total dos Cartões */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-700 uppercase tracking-wider">
                    Total dos Cartões
                  </span>
                  <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-lg">
                    {formatCurrency(totalCardsBalance)}
                  </span>
                </div>
              </div>

              {/* Tabela 3: Saldo dos Centros de Custo */}
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-600" />
                    Saldo dos Centros de Custo ({costCenters.length})
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                    Aba 'Centro Custo'
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {costCenters.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-medium">
                      Nenhum Centro de Custo cadastrado.
                    </div>
                  ) : (
                    costCenters.map((cc) => (
                      <div
                        key={cc.name}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {cc.description || cc.name}
                          </div>
                          {cc.associatedCard && (
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1 font-medium">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>Cartão: {cc.associatedCard}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            {formatCurrency(cc.balance)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Linha Total dos Centros de Custo */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-700 uppercase tracking-wider">
                    Total Centros de Custo
                  </span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg">
                    {formatCurrency(totalCostCentersBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
