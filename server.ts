import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

function getMonthFromDate(dateStr: any): string {
  if (!dateStr || typeof dateStr !== "string") return "Jul";
  // YYYY-MM-DD
  let match = dateStr.match(/^\d{4}-(\d{2})-\d{2}/);
  if (match) {
    const monthIdx = parseInt(match[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return MONTH_NAMES[monthIdx];
  }
  // DD/MM/YYYY or DD-MM-YYYY
  match = dateStr.match(/^\d{1,2}[\/\-](\d{1,2})[\/\-]\d{4}/);
  if (match) {
    const monthIdx = parseInt(match[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return MONTH_NAMES[monthIdx];
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return MONTH_NAMES[d.getMonth()];
  }
  return "Jul";
}

// Google Apps Script Web App Integration
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxD3ogFVncbXFBygxsQATYHt_RBInmu0n4sDzBs_NCc6hQSqRmHYvO60PKS5aNJJHIU/exec";

async function fetchFromAppsScript(queryParams?: Record<string, any>) {
  console.log("Fetching financial data from Google Apps Script Web App...", queryParams);
  let targetUrl = APPS_SCRIPT_URL;

  const params = new URLSearchParams();
  params.append("aba", "Lançamentos");
  params.append("sheetName", "Lançamentos");

  if (queryParams && typeof queryParams === "object") {
    for (const [key, val] of Object.entries(queryParams)) {
      if (val !== undefined && val !== null && key !== "spreadsheetId") {
        params.append(key, String(val));
      }
    }
  }

  const queryString = params.toString();
  if (queryString) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "Accept": "application/json" },
      redirect: "follow"
    });

    if (!response.ok) {
      console.warn(`Apps Script GET returned status ${response.status}`);
      return [];
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.warn("Apps Script response was not valid JSON:", text.substring(0, 150));
      return [];
    }
  } catch (err: any) {
    console.error("Error fetching from Apps Script Web App:", err.message);
    return [];
  }
}

async function postToAppsScript(payload: any) {
  const fullPayload = {
    action: "addTransaction",
    sheetName: "Lançamentos",
    aba: "Lançamentos",
    sheet: "Lançamentos",
    ...payload
  };
  console.log("Posting transaction to Google Apps Script Web App:", fullPayload);
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload),
      redirect: "follow"
    });
    if (!response.ok) {
      console.warn(`Apps Script POST returned status ${response.status}`);
      return { success: false, message: `Apps Script status ${response.status}` };
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, message: text };
    }
  } catch (err: any) {
    console.error("Error posting to Apps Script Web App:", err.message);
    return { success: false, error: err.message };
  }
}

function normalizeAppsScriptData(raw: any) {
  const baseSpreadsheet = {
    id: "script-web-app",
    name: "Planilha Fluxo Caixa (Google Apps Script)",
    url: APPS_SCRIPT_URL
  };

  const defaultAccountItems = [
    { name: "CEF", description: "Caixa Econômica Federal", balance: 3901.20 },
    { name: "BB", description: "Banco do Brasil", balance: 0.00 },
    { name: "MPg", description: "Mercado Pago", balance: 0.00 },
    { name: "WAL", description: "Carteira WAL", balance: 25.00 },
  ];
  const defaultAccounts = defaultAccountItems.map(a => a.name);

  const defaultCardItems = [
    { name: "ELO", description: "Cartão ELO", balance: 0.00 },
    { name: "VISA", description: "Cartão VISA", balance: 0.00 },
  ];
  const defaultCards = defaultCardItems.map(c => c.name);

  const defaultCostCenters = [
    { name: "Supermercado", description: "Supermercado", associatedCard: "VISA", balance: 0.00 },
    { name: "Restaurantes", description: "Restaurantes", associatedCard: "VISA", balance: 0.00 },
    { name: "Farmácia", description: "Farmácia", associatedCard: "ELO", balance: 0.00 },
    { name: "Posto", description: "Posto de Combustível", associatedCard: "ELO", balance: 0.00 },
  ];

  const defaultCategories = [
    { name: 'Moradia', subcategories: ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Manutenção'] },
    { name: 'Alimentação', subcategories: ['Supermercado', 'Feira', 'Restaurantes', 'Delivery', 'Lanches'] },
    { name: 'Transporte', subcategories: ['Combustível', 'Uber/Taxi', 'Manutenção', 'IPVA/Seguro', 'Transporte Público'] },
    { name: 'Saúde', subcategories: ['Farmácia', 'Plano de Saúde', 'Consultas', 'Exames'] },
    { name: 'Lazer & Estilo de Vida', subcategories: ['Viagens', 'Cinema/Streaming', 'Hobbies', 'Roupas'] },
    { name: 'Educação & Trabalho', subcategories: ['Cursos', 'Livros', 'Softwares', 'Materiais'] },
    { name: 'Receitas & Rendimentos', subcategories: ['Salário', 'Freelance', 'Rendimentos', 'Bônus', 'Outros'] },
    { name: 'Investimentos', subcategories: ['Ações', 'Tesouro Direto', 'Cripto', 'Reserva de Emergência'] }
  ];

  const monthsData: Record<string, any[]> = {
    Jan: [], Fev: [], Mar: [], Abr: [], Mai: [], Jun: [],
    Jul: [], Ago: [], Set: [], Out: [], Nov: [], Dez: []
  };

  if (!raw) {
    return {
      spreadsheet: baseSpreadsheet,
      accounts: defaultAccounts,
      accountItems: defaultAccountItems,
      cards: defaultCards,
      cardItems: defaultCardItems,
      costCenters: defaultCostCenters,
      categories: defaultCategories,
      monthsData
    };
  }

  // Extract items array from raw response
  let itemsArray: any[] = [];
  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      // 2D Matrix Array: [ ["Data","Conta","Categoria","SubCategoria","Descricao","Valor","Rec_Parc","Modo"], [...] ]
      const headers = raw[0].map((h: any) => String(h || "").trim());
      itemsArray = raw.slice(1).map((row: any[]) => {
        const itemObj: Record<string, any> = {};
        if (Array.isArray(row)) {
          headers.forEach((header: string, colIdx: number) => {
            itemObj[header] = row[colIdx];
          });
        }
        return itemObj;
      });
    } else {
      itemsArray = raw;
    }
  } else if (typeof raw === "object") {
    let sourceData = raw.data || raw.result || raw.transactions || raw.items;
    if (Array.isArray(sourceData) && sourceData.length > 0) {
      if (Array.isArray(sourceData[0])) {
        const headers = sourceData[0].map((h: any) => String(h || "").trim());
        itemsArray = sourceData.slice(1).map((row: any[]) => {
          const itemObj: Record<string, any> = {};
          if (Array.isArray(row)) {
            headers.forEach((header: string, colIdx: number) => {
              itemObj[header] = row[colIdx];
            });
          }
          return itemObj;
        });
      } else {
        itemsArray = sourceData;
      }
    } else if (raw.monthsData && typeof raw.monthsData === "object") {
      Object.keys(monthsData).forEach(m => {
        monthsData[m] = Array.isArray(raw.monthsData[m]) ? raw.monthsData[m] : [];
      });
      return {
        spreadsheet: baseSpreadsheet,
        accounts: raw.accounts || defaultAccounts,
        cards: raw.cards || defaultCards,
        costCenters: raw.costCenters || [],
        categories: raw.categories || defaultCategories,
        monthsData
      };
    }
  }

  const dynamicAccountsSet = new Set<string>(defaultAccounts);

  itemsArray.forEach((t: any, idx: number) => {
    if (!t || typeof t !== "object") return;
    const dateStr = String(t.Data || t.date || t.data || "");
    if (!dateStr) return;

    // Infer month dynamically from date string
    const month = getMonthFromDate(dateStr);

    let rawAmount = t.Valor !== undefined ? t.Valor : (t.amount !== undefined ? t.amount : (t.valor !== undefined ? t.valor : 0));
    if (typeof rawAmount === "string") {
      rawAmount = rawAmount.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    }
    const numAmount = Math.abs(parseFloat(rawAmount) || 0);

    let mode: 1 | -1 = -1;
    const rawMode = t.Modo !== undefined ? t.Modo : (t.mode !== undefined ? t.mode : t.modo);
    if (rawMode === 1 || rawMode === "1" || String(rawMode).toLowerCase() === "receita" || t.tipo === "Receita" || t.type === "income") {
      mode = 1;
    } else if (rawMode === -1 || rawMode === "-1" || String(rawMode).toLowerCase() === "despesa" || t.tipo === "Despesa" || t.type === "expense") {
      mode = -1;
    } else if (parseFloat(rawAmount) > 0 && rawMode === undefined) {
      mode = 1;
    }

    const account = String(t.Conta || t.account || t.conta || "").trim();
    if (account) dynamicAccountsSet.add(account);

    const category = String(t.Categoria || t.category || t.categoria || "Outros").trim();
    const subcategory = String(t.SubCategoria || t.Subcategoria || t.subcategory || t.subcategoria || "").trim();
    const description = String(t.Descricao || t.Descrição || t.description || t.descricao || "").trim();
    const rawRec = t.Rec_Parc !== undefined ? t.Rec_Parc : (t.recurrence !== undefined ? t.recurrence : (t.recorrencia !== undefined ? t.recorrencia : 1));

    if (!monthsData[month]) monthsData[month] = [];

    monthsData[month].push({
      id: t.id || `script-${idx}`,
      sheetName: "Lançamentos",
      date: dateStr,
      account: account || "Outras",
      category: category || "Geral",
      subcategory: subcategory,
      description: description || "Lançamento",
      amount: numAmount,
      recurrence: parseInt(String(rawRec), 10) || 1,
      mode
    });
  });

  let accountItems = defaultAccountItems;
  if (typeof raw === "object" && raw) {
    if (Array.isArray(raw.accountItems)) accountItems = raw.accountItems;
    else if (Array.isArray(raw.contas) && raw.contas.length > 0) {
      accountItems = raw.contas.map((c: any) => ({
        name: String(c.Conta || c.name || c.conta || "").trim(),
        description: String(c.Descricao || c.Descrição || c.description || c.name || "").trim(),
        balance: parseFloat(String(c.Saldo || c.saldo || c.balance || 0).replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0,
      }));
    }
  }

  let cardItems = defaultCardItems;
  if (typeof raw === "object" && raw) {
    if (Array.isArray(raw.cardItems)) cardItems = raw.cardItems;
    else if (Array.isArray(raw.cartoes) && raw.cartoes.length > 0) {
      cardItems = raw.cartoes.map((c: any) => ({
        name: String(c.Conta || c.Cartão || c.name || "").trim(),
        description: String(c.Descricao || c.Descrição || c.description || c.name || "").trim(),
        balance: parseFloat(String(c.Saldo || c.saldo || c.balance || 0).replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0,
      }));
    }
  }

  let costCenters = defaultCostCenters;
  if (typeof raw === "object" && raw) {
    if (Array.isArray(raw.costCenters) && raw.costCenters.length > 0) costCenters = raw.costCenters;
    else if (Array.isArray(raw.centroCusto) && raw.centroCusto.length > 0) {
      costCenters = raw.centroCusto.map((cc: any) => ({
        name: String(cc["Centro Custo"] || cc.name || cc.centroCusto || "").trim(),
        description: String(cc.Descricao || cc.Descrição || cc.description || cc.name || "").trim(),
        associatedCard: String(cc["Cartao Associado"] || cc.associatedCard || "").trim(),
        balance: parseFloat(String(cc.Saldo || cc.saldo || cc.balance || 0).replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0,
      }));
    }
  }

  return {
    spreadsheet: baseSpreadsheet,
    accounts: Array.from(dynamicAccountsSet),
    accountItems,
    cards: cardItems.map(c => c.name),
    cardItems,
    costCenters,
    categories: (typeof raw === "object" && raw.categories) || defaultCategories,
    monthsData
  };
}

// --------------------------------------------------
// API ENDPOINTS FOR APPS SCRIPT WEB APP
// --------------------------------------------------

app.get("/api/sheets/data", async (req, res) => {
  try {
    const rawData = await fetchFromAppsScript(req.query);
    const normalized = normalizeAppsScriptData(rawData);
    return res.json(normalized);
  } catch (scriptErr: any) {
    console.warn("Apps Script fetch error, returning default data:", scriptErr.message);
    return res.json(normalizeAppsScriptData(null));
  }
});

app.post("/api/sheets/transaction", async (req, res) => {
  try {
    const result = await postToAppsScript({
      action: "addTransaction",
      ...req.body
    });
    return res.json(result);
  } catch (scriptErr: any) {
    console.error("Apps script transaction post error:", scriptErr.message);
    return res.status(500).json({ error: scriptErr.message || "Erro ao enviar lançamento para Apps Script Web App." });
  }
});

// --------------------------------------------------
// VITE MIDDLEWARE & SERVER INITIALIZATION
// --------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
