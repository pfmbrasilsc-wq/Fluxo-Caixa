import React from 'react';
import { SpreadsheetInfo } from '../types';
import { Wallet, ExternalLink, FileSpreadsheet, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  spreadsheet: SpreadsheetInfo | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  spreadsheet,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Fluxo Caixa
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Conectado (traco.e.sc@gmail.com)
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Planilha Google Sheets via Web App API
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Atualizar dados da planilha"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>

          {spreadsheet?.url && (
            <a
              href={spreadsheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
              title="Abrir Web App da Planilha"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px]">{spreadsheet.name || 'Planilha Real'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
