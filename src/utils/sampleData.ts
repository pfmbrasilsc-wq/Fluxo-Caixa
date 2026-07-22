import { FinancialData } from '../types';

export const EMPTY_FINANCIAL_DATA: FinancialData = {
  spreadsheet: null,
  accounts: ['Banco do Brasil', 'Itaú', 'NuBank', 'Carteira (Dinheiro)'],
  cards: ['Cartão NuBank', 'Cartão XP', 'Cartão Itaú'],
  costCenters: [],
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
