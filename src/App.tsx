import React, { useState, useEffect, useCallback } from 'react';
import { SpreadsheetInfo, FinancialData, Transaction } from './types';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { MetricsCards } from './components/MetricsCards';
import { CategoryChart } from './components/CategoryChart';
import { TransactionsList } from './components/TransactionsList';
import { CostCentersView } from './components/CostCentersView';
import { BalancesPanel } from './components/BalancesPanel';
import { TransactionModal } from './components/TransactionModal';
import { CATEGORY_COLORS, COLOR_PALETTE } from './utils/formatters';
import { EMPTY_FINANCIAL_DATA } from './utils/sampleData';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

function parseDateParts(dateStr: string): { day: number; monthIndex: number; year: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();

  // YYYY-MM-DD
  let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    const year = parseInt(m[1], 10);
    const monthIndex = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    if (year > 1900 && monthIndex >= 0 && monthIndex < 12) {
      return { day, monthIndex, year };
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthIndex = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    if (year > 1900 && monthIndex >= 0 && monthIndex < 12) {
      return { day, monthIndex, year };
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return { day: d.getDate(), monthIndex: d.getMonth(), year: d.getFullYear() };
  }

  return null;
}

export default function App() {
  const DEFAULT_SPREADSHEET: SpreadsheetInfo = {
    id: 'script-web-app',
    name: 'Planilha Fluxo Caixa (traco.e.sc@gmail.com)',
    url: 'https://script.google.com/macros/s/AKfycbxD3ogFVncbXFBygxsQATYHt_RBInmu0n4sDzBs_NCc6hQSqRmHYvO60PKS5aNJJHIU/exec',
  };

  const [spreadsheet] = useState<SpreadsheetInfo>(DEFAULT_SPREADSHEET);
  const [financialData, setFinancialData] = useState<FinancialData>(EMPTY_FINANCIAL_DATA);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default month and year to current real date
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[currentMonthIndex] || 'Jul');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledCC, setPrefilledCC] = useState<{ name: string; card: string } | null>(null);

  // Fetch financial data directly from Apps Script Web App
  const fetchFinancialData = useCallback(async (monthToFetch?: string, yearToFetch?: number) => {
    setIsLoadingData(true);
    setError(null);
    const targetMonth = monthToFetch || selectedMonth;
    const targetYear = yearToFetch || selectedYear;
    try {
      const res = await fetch(`/api/sheets/data?spreadsheetId=script-web-app&sheetName=Lançamentos&aba=Lançamentos&mes=${targetMonth}&month=${targetMonth}&ano=${targetYear}&year=${targetYear}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        console.warn('Fetch returned status:', res.status);
        setFinancialData(EMPTY_FINANCIAL_DATA);
        return;
      }

      const data = await res.json();
      if (data && typeof data === 'object' && data.monthsData) {
        setFinancialData(data);
      } else if (Array.isArray(data) && data.length > 0) {
        let rows = data;
        if (Array.isArray(data[0])) {
          const headers = data[0].map((h: any) => String(h || "").trim());
          rows = data.slice(1).map((row: any[]) => {
            const itemObj: Record<string, any> = {};
            if (Array.isArray(row)) {
              headers.forEach((header: string, colIdx: number) => {
                itemObj[header] = row[colIdx];
              });
            }
            return itemObj;
          });
        }

        const updated = { ...EMPTY_FINANCIAL_DATA };
        rows.forEach((t: any, idx: number) => {
          const dateStr = String(t.Data || t.date || t.data || '');
          if (!dateStr) return;
          const monthIndex = parseDateParts(dateStr)?.monthIndex ?? 6;
          const monthName = MONTH_NAMES[monthIndex] || 'Jul';
          let rawAmount = t.Valor !== undefined ? t.Valor : (t.amount !== undefined ? t.amount : (t.valor !== undefined ? t.valor : 0));
          if (typeof rawAmount === 'string') {
            rawAmount = rawAmount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
          }
          const numAmount = Math.abs(parseFloat(rawAmount) || 0);

          let mode: 1 | -1 = -1;
          const rawMode = t.Modo !== undefined ? t.Modo : (t.mode !== undefined ? t.mode : t.modo);
          if (rawMode === 1 || rawMode === '1' || String(rawMode).toLowerCase() === 'receita' || t.tipo === 'Receita') {
            mode = 1;
          } else if (rawMode === -1 || rawMode === '-1' || String(rawMode).toLowerCase() === 'despesa' || t.tipo === 'Despesa') {
            mode = -1;
          }

          if (!updated.monthsData[monthName]) updated.monthsData[monthName] = [];
          updated.monthsData[monthName].push({
            id: t.id || `client-${idx}`,
            sheetName: 'Lançamentos',
            date: dateStr,
            account: String(t.Conta || t.account || t.conta || 'CEF'),
            category: String(t.Categoria || t.category || t.categoria || 'Geral'),
            subcategory: String(t.SubCategoria || t.Subcategoria || t.subcategory || ''),
            description: String(t.Descricao || t.Descrição || t.description || 'Lançamento'),
            amount: numAmount,
            recurrence: parseInt(String(t.Rec_Parc || t.recurrence || 1), 10) || 1,
            mode,
          });
        });
        setFinancialData(updated);
      } else {
        setFinancialData(EMPTY_FINANCIAL_DATA);
      }
    } catch (err: any) {
      console.warn('Data fetch warning, falling back to clean state:', err);
      setFinancialData(EMPTY_FINANCIAL_DATA);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchFinancialData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, fetchFinancialData]);

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
        sheetName: 'Lançamentos',
        aba: 'Lançamentos',
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

  // Extract all transactions and filter strictly by transaction date (month and year)
  const allTransactions: Transaction[] = [];
  if (financialData?.monthsData) {
    Object.values(financialData.monthsData).forEach((list) => {
      if (Array.isArray(list)) {
        allTransactions.push(...list);
      }
    });
  }

  const selectedMonthIndex = MONTH_NAMES.indexOf(selectedMonth);

  const currentMonthTransactions = allTransactions.filter((t) => {
    const parts = parseDateParts(t.date);
    if (parts) {
      return parts.monthIndex === selectedMonthIndex && parts.year === selectedYear;
    }
    // Fallback if date is missing/invalid: check sheetName
    return t.sheetName === selectedMonth;
  });

  let totalIncome = 0;
  let totalExpense = 0;

  currentMonthTransactions.forEach((t) => {
    if (t.mode === 1) {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  });

  // Cost Centers have a single persistent record for all months of the year
  const costCentersList = financialData?.costCenters || [];
  const costCentersBalanceTotal = costCentersList.reduce(
    (sum, cc) => sum + (cc.balance || 0),
    0
  );

  const adjustedTotalExpense = totalExpense + costCentersBalanceTotal;
  const currentBalance = totalIncome - adjustedTotalExpense;

  // Calculate Category Expenses Distribution for current month and year
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
        onRefresh={() => fetchFinancialData(selectedMonth, selectedYear)}
        isRefreshing={isLoadingData}
      />

      {/* Month & Year Selector Navigation */}
      <MonthSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelectMonth={setSelectedMonth}
        onSelectYear={setSelectedYear}
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
              onClick={() => fetchFinancialData(selectedMonth, selectedYear)}
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
          selectedYear={selectedYear}
        />

        {/* Consolidated Balances Panel (Accounts, Cards, Cost Centers, Realized Month Balance) */}
        <BalancesPanel
          accounts={financialData?.accounts && financialData.accounts.length > 0 ? financialData.accounts : ['CEF', 'BB', 'MPg', 'WAL']}
          accountItems={financialData?.accountItems}
          cards={financialData?.cards || ['ELO', 'VISA']}
          cardItems={financialData?.cardItems}
          costCenters={costCentersList}
          currentMonthTransactions={currentMonthTransactions}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* Cost Centers Row (Single record across all months) */}
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
            <CategoryChart
              data={categoryExpenses}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>

          {/* Transactions History List */}
          <div className="lg:col-span-7">
            <TransactionsList
              transactions={currentMonthTransactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
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
