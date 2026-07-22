import React, { useState, useEffect } from 'react';
import { CategoryItem, CostCenter } from '../types';
import { X, Plus, Calendar, DollarSign, Tag, CreditCard, RefreshCw, CheckCircle2, Target, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    date: string;
    account: string;
    category: string;
    subcategory: string;
    description: string;
    amount: number;
    recurrence: number;
    mode: 1 | -1;
    costCenter?: string;
  }) => Promise<void>;
  accounts: string[];
  cards: string[];
  costCenters: CostCenter[];
  categories: CategoryItem[];
  prefilledCostCenter?: { name: string; card: string } | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  cards,
  costCenters,
  categories,
  prefilledCostCenter,
}) => {
  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [mode, setMode] = useState<1 | -1>(-1); // Default Expense
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState(1);
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Combine account options: Contas, Cartões, and Cost Centers
  const allAccountOptions = [
    ...accounts,
    ...cards,
    ...costCenters.map((cc) => `Centro: ${cc.name}`),
  ];

  // Set default account & category on load or open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (prefilledCostCenter) {
        setSelectedCostCenter(prefilledCostCenter.name);
        setSelectedAccount(prefilledCostCenter.card || cards[0] || accounts[0] || '');
      } else {
        setSelectedCostCenter('');
        if (!selectedAccount) {
          setSelectedAccount(accounts[0] || cards[0] || '');
        }
      }

      if (!selectedCategory && categories.length > 0) {
        setSelectedCategory(categories[0].name);
        if (categories[0].subcategories.length > 0) {
          setSelectedSubcategory(categories[0].subcategories[0]);
        }
      }
    }
  }, [isOpen, prefilledCostCenter, accounts, cards, categories]);

  // Update subcategories when category changes
  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    const cat = categories.find((c) => c.name === catName);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0]);
    } else {
      setSelectedSubcategory('');
    }
  };

  // Handle Cost Center toggle
  const handleCostCenterChange = (ccName: string) => {
    setSelectedCostCenter(ccName);
    if (ccName) {
      const cc = costCenters.find((c) => c.name === ccName);
      if (cc && cc.associatedCard) {
        setSelectedAccount(cc.associatedCard);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numVal = parseFloat(amount.replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      setErrorMsg('Informe um valor numérico válido maior que zero.');
      return;
    }

    if (!selectedAccount) {
      setErrorMsg('Selecione uma Conta, Cartão ou Centro de Custo.');
      return;
    }

    if (!selectedCategory) {
      setErrorMsg('Selecione uma Categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        account: selectedAccount,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        description,
        amount: numVal,
        recurrence: Math.max(1, recurrence),
        mode,
        costCenter: selectedCostCenter || undefined,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setRecurrence(1);
      setSelectedCostCenter('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao salvar lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.name === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Novo Lançamento Financeiro</h3>
              <p className="text-xs text-slate-500 font-medium">Sincronização instantânea no Google Sheets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Mode Selector (Receita vs Despesa) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMode(-1)}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                mode === -1
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Despesa (-1)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode(1)}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                mode === 1
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Receita (+1)</span>
            </button>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Account / Card Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              Conta / Cartão / Origem
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              {allAccountOptions.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Center Association (Optional) */}
          {costCenters.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  Vincular a um Centro de Custo?
                </label>
                {selectedCostCenter && (
                  <button
                    type="button"
                    onClick={() => setSelectedCostCenter('')}
                    className="text-[10px] text-amber-700 hover:text-amber-900 underline font-semibold"
                  >
                    Remover Vínculo
                  </button>
                )}
              </div>

              <select
                value={selectedCostCenter}
                onChange={(e) => handleCostCenterChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="">Nenhum (Lançamento Convencional)</option>
                {costCenters.map((cc) => (
                  <option key={cc.name} value={cc.name}>
                    {cc.name} (Cartão: {cc.associatedCard || 'Nenhum'})
                  </option>
                ))}
              </select>

              {selectedCostCenter && (
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  * O saldo do Centro de Custo '{selectedCostCenter}' será atualizado e a conta gravada será o cartão associado ({selectedAccount}).
                </p>
              )}
            </div>
          )}

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategoria</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="">Nenhuma / Geral</option>
                {currentCategoryObj?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Supermercado Semanal, Salário, Compra no Crédito"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Recurrences / Installments */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Recorrências / N° de Parcelas
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                {recurrence === 1 ? '1x (Único)' : `${recurrence} parcelas/meses`}
              </span>
            </div>

            <input
              type="number"
              min="1"
              max="60"
              value={recurrence}
              onChange={(e) => setRecurrence(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
            />

            {recurrence > 1 && (
              <p className="text-[11px] text-indigo-700 mt-1.5 flex items-center gap-1 font-medium bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                O lançamento será replicado automaticamente nos próximos {recurrence} meses na mesma data no Google Sheets.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sincronizando com Google Sheets...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Salvar na Planilha</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
