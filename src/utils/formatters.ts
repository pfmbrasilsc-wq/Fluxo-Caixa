export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  // If YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#0284c7', // Sky Blue
  Alimentação: '#f59e0b', // Amber
  Transporte: '#8b5cf6', // Violet
  Saúde: '#ef4444', // Red
  'Lazer & Estilo de Vida': '#ec4899', // Pink
  'Educação & Trabalho': '#3b82f6', // Blue
  'Receitas & Rendimentos': '#10b981', // Emerald
  Investimentos: '#06b6d4', // Cyan
  Outros: '#64748b', // Slate
};

export const COLOR_PALETTE = [
  '#0284c7',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#ec4899',
  '#3b82f6',
  '#10b981',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
];
