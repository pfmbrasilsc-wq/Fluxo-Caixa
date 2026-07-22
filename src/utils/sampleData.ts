import { FinancialData } from '../types';

export const EMPTY_FINANCIAL_DATA: FinancialData = {
  spreadsheet: null,
  accounts: ['CEF', 'BB', 'MPg', 'WAL'],
  accountItems: [
    { name: 'CEF', description: 'Caixa Econômica Federal', balance: 3901.20 },
    { name: 'BB', description: 'Banco do Brasil', balance: 0.00 },
    { name: 'MPg', description: 'Mercado Pago', balance: 0.00 },
    { name: 'WAL', description: 'Carteira WAL', balance: 25.00 },
  ],
  cards: ['ELO', 'VISA'],
  cardItems: [
    { name: 'ELO', description: 'Cartão ELO', balance: 0.00 },
    { name: 'VISA', description: 'Cartão VISA', balance: 0.00 },
  ],
  costCenters: [
    { name: 'Supermercado', description: 'Supermercado', associatedCard: 'VISA', balance: 0.00 },
    { name: 'Restaurantes', description: 'Restaurantes', associatedCard: 'VISA', balance: 0.00 },
    { name: 'Farmácia', description: 'Farmácia', associatedCard: 'ELO', balance: 0.00 },
    { name: 'Posto', description: 'Posto de Combustível', associatedCard: 'ELO', balance: 0.00 },
  ],
  categories: [
    {
      name: 'Moradia',
      subcategories: ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Manutenção'],
    },
    {
      name: 'Alimentação',
      subcategories: ['Supermercado', 'Feira', 'Restaurantes', 'Delivery', 'Lanches'],
    },
    {
      name: 'Transporte',
      subcategories: ['Combustível', 'Uber/Taxi', 'Manutenção', 'IPVA/Seguro', 'Transporte Público'],
    },
    {
      name: 'Saúde',
      subcategories: ['Farmácia', 'Plano de Saúde', 'Consultas', 'Exames'],
    },
    {
      name: 'Lazer & Estilo de Vida',
      subcategories: ['Viagens', 'Cinema/Streaming', 'Hobbies', 'Roupas'],
    },
    {
      name: 'Educação & Trabalho',
      subcategories: ['Cursos', 'Livros', 'Softwares', 'Materiais'],
    },
    {
      name: 'Receitas & Rendimentos',
      subcategories: ['Salário', 'Freelance', 'Rendimentos', 'Bônus', 'Outros'],
    },
    {
      name: 'Investimentos',
      subcategories: ['Ações', 'Tesouro Direto', 'Cripto', 'Reserva de Emergência'],
    },
  ],
  monthsData: {
    Jan: [], Fev: [], Mar: [], Abr: [], Mai: [], Jun: [],
    Jul: [], Ago: [], Set: [], Out: [], Nov: [], Dez: []
  },
};

export const SAMPLE_FINANCIAL_DATA: FinancialData = EMPTY_FINANCIAL_DATA;
