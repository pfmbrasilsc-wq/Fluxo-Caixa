import React, { useState, useEffect } from 'react';
import { UserAuth, SpreadsheetInfo } from '../types';
import { ShieldCheck, FileSpreadsheet, PlusCircle, Lock, ArrowRight, RefreshCw, AlertCircle, X, Sparkles } from 'lucide-react';

interface ConnectGuardProps {
  auth: UserAuth;
  spreadsheet: SpreadsheetInfo | null;
  onLogin: () => void;
  onSelectSpreadsheet: (sheet: SpreadsheetInfo) => void;
  onSpreadsheetCreated: (sheet: SpreadsheetInfo) => void;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const ConnectGuard: React.FC<ConnectGuardProps> = ({
  auth,
  spreadsheet,
  onLogin,
  onSelectSpreadsheet,
  onSpreadsheetCreated,
  isOpen,
  onClose,
  children,
}) => {
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customId, setCustomId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search drive files on auth change when modal is open
  useEffect(() => {
    if (isOpen && auth.isAuthenticated) {
      searchDriveFiles();
    }
  }, [isOpen, auth.isAuthenticated]);

  const searchDriveFiles = async () => {
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/sheets/find');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao buscar planilhas no Google Drive.');
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro de comunicação com o Google Drive.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    setIsCreating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/sheets/create', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao criar planilha no Google Drive.');
      }
      const newSheet = await res.json();
      onSpreadsheetCreated(newSheet);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar planilha.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectCustomId = () => {
    if (!customId.trim()) return;
    const cleanId = customId.trim().replace(/^.*\/d\//, '').replace(/\/.*$/, '');
    onSelectSpreadsheet({
      id: cleanId,
      name: 'Fluxo Caixa',
      url: `https://docs.google.com/spreadsheets/d/${cleanId}`,
    });
    onClose();
  };

  if (!isOpen) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header bar with close button */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              {auth.isAuthenticated ? 'Sincronizar Google Drive' : 'Conectar ao Google Drive'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Fechar e continuar no modo local"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* State 1: Not Authenticated with Google */}
          {!auth.isAuthenticated ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xs">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Conexão Direta com Google Drive
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Conecte sua conta do Google para ler e gravar lançamentos na sua planilha pessoal sem intermediários.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Seus lançamentos ficam 100% gravados na sua própria conta do Google.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Sincronização em tempo real com as 12 abas de meses e centros de custo.</span>
                </div>
              </div>

              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Entrar com Conta Google</span>
              </button>

              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Continuar usando o Modo Local (Demonstração)
              </button>
            </div>
          ) : (
            /* State 2: Authenticated, select or create spreadsheet */
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Conectado como {auth.name || auth.email}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Selecione uma planilha do seu Drive ou crie uma nova planilha oficial "Fluxo Caixa".
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Option A: Drive files list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Planilhas no Google Drive</span>
                  <button
                    onClick={searchDriveFiles}
                    disabled={isSearching}
                    className="hover:text-slate-800 flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSearching ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>Atualizar Lista</span>
                  </button>
                </div>

                {isSearching ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-medium flex items-center justify-center space-x-2 bg-slate-50 rounded-xl border border-slate-200">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Buscando planilhas no seu Google Drive...</span>
                  </div>
                ) : driveFiles.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center space-x-3 truncate mr-2">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {file.id.substring(0, 10)}...
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onSelectSpreadsheet({
                              id: file.id,
                              name: file.name,
                              url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
                            });
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 transition-all shrink-0 shadow-2xs"
                        >
                          <span>Usar Esta</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center font-medium">
                    Nenhuma planilha "Fluxo Caixa" encontrada no seu Drive.
                  </div>
                )}
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold">Ou</span>
                </div>
              </div>

              {/* Option B: Create new Fluxo Caixa spreadsheet */}
              <button
                onClick={handleCreateSpreadsheet}
                disabled={isCreating}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Criando Estrutura Oficial 'Fluxo Caixa'...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4.5 h-4.5" />
                    <span>Criar Nova Planilha 'Fluxo Caixa' no Drive</span>
                  </>
                )}
              </button>

              {/* Option C: Manual ID input */}
              <div className="pt-1">
                <details className="text-xs text-slate-500 cursor-pointer">
                  <summary className="hover:text-slate-800 font-semibold">Informar ID ou URL de Planilha Existente</summary>
                  <div className="mt-2.5 space-y-2">
                    <input
                      type="text"
                      placeholder="Cole o ID da planilha ou URL do Google Sheets"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                    <button
                      onClick={handleConnectCustomId}
                      disabled={!customId.trim()}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs disabled:opacity-50 transition-colors"
                    >
                      Conectar por ID
                    </button>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
