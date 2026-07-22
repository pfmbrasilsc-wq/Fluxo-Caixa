export type TransactionMode = 1 | -1;

export interface Transaction {
  id?: string;
  monthIndex?: number; // 0..11
  sheetName: string; // 'Jan', 'Fev', ...
  rowIndex?: number;
  date: string; // YYYY-MM-DD or DD/MM/YYYY
  account: string; // Conta, Cartão or Centro Custo
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  recurrence: number;
  mode: TransactionMode; // 1 = Receita, -1 = Despesa
  costCenter?: string;
}

export interface AccountItem {
  name: string; // e.g. CEF, BB, MPg, WAL
  description: string; // e.g. Caixa Econômica Federal
  balance: number;
}

export interface CardItem {
  name: string; // e.g. ELO, VISA
  description: string;
  balance: number;
}

export interface CostCenter {
  name: string;
  description?: string;
  associatedCard?: string;
  balance: number;
}

export interface CategoryItem {
  name: string;
  subcategories: string[];
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export interface FinancialData {
  spreadsheet: SpreadsheetInfo;
  accounts: string[];
  accountItems: AccountItem[];
  cards: string[];
  cardItems: CardItem[];
  costCenters: CostCenter[];
  categories: CategoryItem[];
  monthsData: Record<string, Transaction[]>; // key: 'Jan', 'Fev', ...
}

export interface MonthMetrics {
  month: string;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  costCentersBalanceTotal: number;
  categoryExpenses: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export interface UserAuth {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
}
