import React, { useState, useEffect, useCallback } from 'react';
import { SpreadsheetInfo, FinancialData, Transaction } from './types';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { MetricsCards } from './components/MetricsCards';
import { CategoryChart } from './components/CategoryChart';
import { TransactionsList } from './components/TransactionsList';
import { CostCentersView } from './components/CostCentersView';
import { TransactionModal } from './components/TransactionModal';
import { CATEGORY_COLORS, COLOR_PALETTE } from './utils/formatters';
import { EMPTY_FINANCIAL_DATA } from './utils/sampleData';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function App() {
  const DEFAULT_SPREADSHEET: SpreadsheetInfo = {
    id: 'script-web-app',
    name: 'Planilha Fluxo Caixa (traco.e.sc@gmail.com)',
    url: 'https://script.google.com/macros/s/AKfycbzYG1XzUO_kxbkL5Jafzah9aJgBM3a-D7DBLY2hYG8prmw0HqFKhathEBBYcDjdGwbg/exec',
  };

  const [spreadsheet] = useState<SpreadsheetInfo>(DEFAULT_SPREADSHEET);
  const [financialData, setFinancialData] = useState<FinancialData>(EMPTY_FINANCIAL_DATA);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default month to current real month
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[currentMonthIndex] || 'Jul');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledCC, setPrefilledCC] = useState<{ name: string; card: string } | null>(null);

  // Fetch financial data directly from Apps Script Web App
  const fetchFinancialData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const res = await fetch('/api/sheets/data?spreadsheetId=script-web-app');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao carregar dados da planilha.');
      }
      const data: FinancialData = await res.json();
      setFinancialData(data);
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Erro ao ler a planilha.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleCreateNewTransaction = async (formData: {
    date: string;
    account: string;
    category: string;
    subcategory: string;
    description: string;
    amount: number;
    recurrence: number;
    mode: 1 | -1;
    costCenter?: string;
  }) => {
    const res = await fetch('/api/sheets/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetId: 'script-web-app',
        ...formData,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Erro ao gravar lançamento na planilha.');
    }

    await fetchFinancialData();
  };

  const openModalForCostCenter = (ccName: string, card: string) => {
    setPrefilledCC({ name: ccName, card });
    setIsModalOpen(true);
  };

  // Calculate Metrics for selected month
  const currentMonthTransactions: Transaction[] =
    financialData?.monthsData?.[selectedMonth] || [];

  let totalIncome = 0;
  let totalExpense = 0;

  currentMonthTransactions.forEach((t) => {
    if (t.mode === 1) {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  });

  const costCentersList = financialData?.costCenters || [];
  const costCentersBalanceTotal = costCentersList.reduce(
    (sum, cc) => sum + (cc.balance || 0),
    0
  );

  const adjustedTotalExpense = totalExpense + costCentersBalanceTotal;
  const currentBalance = totalIncome - adjustedTotalExpense;

  // Calculate Category Expenses Distribution
  const categoryMap: Record<string, number> = {};
  currentMonthTransactions.forEach((t) => {
    if (t.mode === -1) {
      const cat = t.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    }
  });

  if (costCentersBalanceTotal > 0) {
    categoryMap['Centros de Custo'] = costCentersBalanceTotal;
  }

  const categoryTotalSum = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const categoryExpenses = Object.entries(categoryMap).map(
    ([category, amount], idx) => ({
      category,
      amount,
      percentage: categoryTotalSum > 0 ? (amount / categoryTotalSum) * 100 : 0,
      color:
        CATEGORY_COLORS[category] ||
        (category === 'Centros de Custo' ? '#f59e0b' : COLOR_PALETTE[idx % COLOR_PALETTE.length]),
    })
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <Header
        spreadsheet={spreadsheet}
        onRefresh={fetchFinancialData}
        isRefreshing={isLoadingData}
      />

      {/* Month Selector Tabs */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        monthsList={MONTH_NAMES}
      />

      {/* Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between font-medium">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchFinancialData}
              className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Loading overlay when reading web app data */}
        {isLoadingData && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center space-x-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Lendo dados em tempo real da sua planilha...</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <MetricsCards
          totalIncome={totalIncome}
          totalExpense={adjustedTotalExpense}
          currentBalance={currentBalance}
          costCentersBalanceTotal={costCentersBalanceTotal}
          selectedMonth={selectedMonth}
        />

        {/* Cost Centers Row */}
        {costCentersList.length > 0 && (
          <CostCentersView
            costCenters={costCentersList}
            onNewTransactionForCC={openModalForCostCenter}
          />
        )}

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Donut Chart */}
          <div className="lg:col-span-5">
            <CategoryChart data={categoryExpenses} selectedMonth={selectedMonth} />
          </div>

          {/* Transactions History List */}
          <div className="lg:col-span-7">
            <TransactionsList
              transactions={currentMonthTransactions}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB) for New Transaction */}
      <button
        onClick={() => {
          setPrefilledCC(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl ring-4 ring-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Novo Lançamento (+)"
        id="fab-add-transaction"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Transaction Form Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledCC(null);
        }}
        onSubmit={handleCreateNewTransaction}
        accounts={financialData?.accounts || ['Banco do Brasil', 'Itaú', 'NuBank']}
        cards={financialData?.cards || ['Cartão NuBank', 'Cartão XP']}
        costCenters={financialData?.costCenters || []}
        categories={financialData?.categories || []}
        prefilledCostCenter={prefilledCC}
      />
    </div>
  );
}
