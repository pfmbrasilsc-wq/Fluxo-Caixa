import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { google } from "googleapis";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Google Apps Script Web App Integration
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYG1XzUO_kxbkL5Jafzah9aJgBM3a-D7DBLY2hYG8prmw0HqFKhathEBBYcDjdGwbg/exec";

async function fetchFromAppsScript() {
  console.log("Fetching financial data from Google Apps Script Web App...");
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "GET",
    headers: { "Accept": "application/json" },
    redirect: "follow"
  });
  if (!response.ok) {
    throw new Error(`Apps Script GET error ${response.status}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function postToAppsScript(payload: any) {
  console.log("Posting transaction to Google Apps Script Web App:", payload);
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow"
  });
  if (!response.ok) {
    throw new Error(`Apps Script POST error ${response.status}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: true, message: text };
  }
}

function normalizeAppsScriptData(raw: any) {
  if (!raw || typeof raw !== "object") return null;

  if (raw.monthsData) {
    return {
      spreadsheet: {
        id: "script-web-app",
        name: "Planilha Fluxo Caixa (Google Apps Script)",
        url: APPS_SCRIPT_URL
      },
      accounts: raw.accounts || ["Banco do Brasil", "Itaú", "NuBank", "Carteira (Dinheiro)"],
      cards: raw.cards || ["Cartão NuBank", "Cartão XP", "Cartão Itaú"],
      costCenters: raw.costCenters || [],
      categories: raw.categories || [
        { name: 'Moradia', subcategories: ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Manutenção'] },
        { name: 'Alimentação', subcategories: ['Supermercado', 'Feira', 'Restaurantes', 'Delivery', 'Lanches'] },
        { name: 'Transporte', subcategories: ['Combustível', 'Uber/Taxi', 'Manutenção', 'IPVA/Seguro', 'Transporte Público'] },
        { name: 'Saúde', subcategories: ['Farmácia', 'Plano de Saúde', 'Consultas', 'Exames'] },
        { name: 'Lazer & Estilo de Vida', subcategories: ['Viagens', 'Cinema/Streaming', 'Hobbies', 'Roupas'] },
        { name: 'Educação & Trabalho', subcategories: ['Cursos', 'Livros', 'Softwares', 'Materiais'] },
        { name: 'Receitas & Rendimentos', subcategories: ['Salário', 'Freelance', 'Rendimentos', 'Bônus', 'Outros'] },
        { name: 'Investimentos', subcategories: ['Ações', 'Tesouro Direto', 'Cripto', 'Reserva de Emergência'] }
      ],
      monthsData: raw.monthsData
    };
  }

  if (Array.isArray(raw)) {
    const monthsData: Record<string, any[]> = {
      Jan: [], Fev: [], Mar: [], Abr: [], Mai: [], Jun: [],
      Jul: [], Ago: [], Set: [], Out: [], Nov: [], Dez: []
    };
    raw.forEach((t: any, idx: number) => {
      const month = t.sheetName || t.month || "Jul";
      if (!monthsData[month]) monthsData[month] = [];
      monthsData[month].push({
        id: t.id || `script-${idx}`,
        sheetName: month,
        date: t.date || "",
        account: t.account || "",
        category: t.category || "Outros",
        subcategory: t.subcategory || "",
        description: t.description || "",
        amount: Math.abs(parseFloat(t.amount || 0)),
        recurrence: parseInt(t.recurrence || "1", 10) || 1,
        mode: parseInt(t.mode || "-1", 10) === 1 ? 1 : -1
      });
    });

    return {
      spreadsheet: {
        id: "script-web-app",
        name: "Planilha Fluxo Caixa (Google Apps Script)",
        url: APPS_SCRIPT_URL
      },
      accounts: ["Banco do Brasil", "Itaú", "NuBank", "Carteira (Dinheiro)"],
      cards: ["Cartão NuBank", "Cartão XP", "Cartão Itaú"],
      costCenters: [],
      categories: [
        { name: 'Moradia', subcategories: ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Manutenção'] },
        { name: 'Alimentação', subcategories: ['Supermercado', 'Feira', 'Restaurantes', 'Delivery', 'Lanches'] },
        { name: 'Transporte', subcategories: ['Combustível', 'Uber/Taxi', 'Manutenção', 'IPVA/Seguro', 'Transporte Público'] },
        { name: 'Saúde', subcategories: ['Farmácia', 'Plano de Saúde', 'Consultas', 'Exames'] },
        { name: 'Lazer & Estilo de Vida', subcategories: ['Viagens', 'Cinema/Streaming', 'Hobbies', 'Roupas'] },
        { name: 'Educação & Trabalho', subcategories: ['Cursos', 'Livros', 'Softwares', 'Materiais'] },
        { name: 'Receitas & Rendimentos', subcategories: ['Salário', 'Freelance', 'Rendimentos', 'Bônus', 'Outros'] },
        { name: 'Investimentos', subcategories: ['Ações', 'Tesouro Direto', 'Cripto', 'Reserva de Emergência'] }
      ],
      monthsData
    };
  }

  return raw;
}

function getOAuth2Client(req?: express.Request) {
  const clientId = process.env.CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do Google OAuth2 (CLIENT_ID / CLIENT_SECRET) não configuradas. Por favor, conclua a autorização de OAuth.");
  }

  // Construct absolute callback URL dynamically from request or env
  let protocol = "https";
  let host = req?.headers?.host;
  if (req) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    if (typeof forwardedProto === "string") {
      protocol = forwardedProto.split(",")[0].trim();
    } else if (req.protocol) {
      protocol = req.protocol;
    }
  }

  const baseUrl = host ? `${protocol}://${host}` : (process.env.APP_URL || `http://localhost:${PORT}`);
  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// --------------------------------------------------
// AUTHENTICATION ROUTES
// --------------------------------------------------

app.get("/api/auth/url", (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req);
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
    });

    res.json({ url });
  } catch (error: any) {
    console.error("Error generating Auth URL:", error);
    res.status(500).json({ error: error.message || "Failed to generate Auth URL" });
  }
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).send("Código de autorização ausente.");
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);

    res.cookie("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "none"
    });

    // Send simple HTML script to close popup or redirect back to main app
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticado com Sucesso</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 3rem; margin-bottom: 1rem; color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h2>Autenticação Concluída!</h2>
            <p>Conexão com o Google Drive realizada com sucesso. Você já pode fechar esta janela.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
                setTimeout(() => window.close(), 1200);
              } else {
                setTimeout(() => window.location.href = '/', 1200);
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Callback OAuth error:", error);
    res.status(500).send(`Erro ao processar autenticação: ${error.message}`);
  }
});

app.get("/api/auth/me", async (req, res) => {
  const tokensCookie = req.cookies.google_tokens;
  if (!tokensCookie) {
    // Default to connected via Apps Script Web App for traco.e.sc@gmail.com
    return res.json({
      isAuthenticated: true,
      email: "traco.e.sc@gmail.com",
      name: "traco.e.sc@gmail.com",
      picture: undefined
    });
  }

  try {
    const tokens = JSON.parse(tokensCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    res.json({
      isAuthenticated: true,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    });
  } catch (error) {
    res.json({ isAuthenticated: false });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("google_tokens", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json({ success: true });
});

// Helper middleware to get authenticated client
function getAuthClientFromReq(req: express.Request) {
  const tokensCookie = req.cookies.google_tokens;
  if (!tokensCookie) {
    throw new Error("Não autenticado no Google.");
  }

  const tokens = JSON.parse(tokensCookie);
  const oauth2Client = getOAuth2Client(req);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// --------------------------------------------------
// GOOGLE DRIVE & SHEETS ENDPOINTS
// --------------------------------------------------

// Search for existing spreadsheet "Fluxo Caixa"
app.get("/api/sheets/find", async (req, res) => {
  try {
    const auth = getAuthClientFromReq(req);
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: "name = 'Fluxo Caixa' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: "files(id, name, webViewLink, createdTime)",
      orderBy: "createdTime desc"
    });

    const files = response.data.files || [];
    res.json({ files });
  } catch (error: any) {
    console.error("Error finding spreadsheet:", error);
    res.status(500).json({ error: error.message || "Erro ao buscar planilha no Drive" });
  }
});

// Auto-connect: Find most recent "Fluxo Caixa" or return null if none
app.post("/api/sheets/auto-connect", async (req, res) => {
  try {
    const auth = getAuthClientFromReq(req);
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: "name = 'Fluxo Caixa' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: "files(id, name, webViewLink, createdTime)",
      orderBy: "createdTime desc"
    });

    const files = response.data.files || [];
    if (files.length > 0) {
      const file = files[0];
      return res.json({
        id: file.id,
        name: file.name,
        url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`
      });
    }

    res.json({ id: null });
  } catch (error: any) {
    console.error("Auto-connect error:", error);
    res.status(500).json({ error: error.message || "Erro no auto-connect" });
  }
});

// Create a new "Fluxo Caixa" spreadsheet with full architecture
app.post("/api/sheets/create", async (req, res) => {
  try {
    const auth = getAuthClientFromReq(req);
    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // Define all sheet tabs
    const sheetTitles = [
      ...MONTH_NAMES,
      "Contas",
      "Cartão",
      "Centro Custo",
      "Categorias"
    ];

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "Fluxo Caixa"
        },
        sheets: sheetTitles.map((title) => ({
          properties: { title }
        }))
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error("Falha ao gerar ID da planilha.");
    }

    // Populate Headers for Month Sheets
    const headerRow = ["Data", "Conta", "Categoria", "Subcategoria", "Descrição", "Valor", "Recorrências", "Modo"];
    const monthUpdates = MONTH_NAMES.map((month) => ({
      range: `${month}!A1:H1`,
      values: [headerRow]
    }));

    // Auxiliary data defaults
    const contasData = [
      ["Conta"],
      ["Banco do Brasil"],
      ["Itaú"],
      ["NuBank"],
      ["Carteira (Dinheiro)"]
    ];

    const cartaoData = [
      ["Cartão"],
      ["Cartão NuBank"],
      ["Cartão XP"],
      ["Cartão Itaú"]
    ];

    const centroCustoData = [
      ["Centro Custo", "Cartão Associado", "Saldo"],
      ["Viagem Férias", "Cartão XP", "0"],
      ["Reforma Casa", "Cartão NuBank", "0"],
      ["Projeto Pessoal", "Banco do Brasil", "0"]
    ];

    const categoriasData = [
      ["Categoria", "Subcategorias"],
      ["Moradia", "Aluguel, Condomínio, Energia, Água, Internet, Manutenção"],
      ["Alimentação", "Supermercado, Feira, Restaurantes, Delivery, Lanches"],
      ["Transporte", "Combustível, Uber/Taxi, Manutenção, IPVA/Seguro, Transporte Público"],
      ["Saúde", "Farmácia, Plano de Saúde, Consultas, Exames"],
      ["Lazer & Estilo de Vida", "Viagens, Cinema/Streaming, Hobbies, Roupas"],
      ["Educação & Trabalho", "Cursos, Livros, Softwares, Materiais"],
      ["Receitas & Rendimentos", "Salário, Freelance, Rendimentos, Bônus, Outros"],
      ["Investimentos", "Ações, Tesouro Direto, Cripto, Reserva de Emergência"]
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          ...monthUpdates,
          { range: "Contas!A1:A5", values: contasData },
          { range: "Cartão!A1:A4", values: cartaoData },
          { range: "Centro Custo!A1:C4", values: centroCustoData },
          { range: "Categorias!A1:B9", values: categoriasData }
        ]
      }
    });

    const fileMeta = await drive.files.get({
      fileId: spreadsheetId,
      fields: "id, name, webViewLink"
    });

    res.json({
      id: spreadsheetId,
      name: fileMeta.data.name || "Fluxo Caixa",
      url: fileMeta.data.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    });
  } catch (error: any) {
    console.error("Error creating spreadsheet:", error);
    res.status(500).json({ error: error.message || "Erro ao criar planilha no Drive" });
  }
});

// Fetch full financial data from spreadsheet or Google Apps Script Web App
app.get("/api/sheets/data", async (req, res) => {
  const { spreadsheetId } = req.query;

  // Always attempt Google Apps Script Web App if requested or default
  if (!spreadsheetId || spreadsheetId === "script-web-app" || spreadsheetId === "default") {
    try {
      const rawData = await fetchFromAppsScript();
      const normalized = normalizeAppsScriptData(rawData);
      if (normalized) {
        return res.json(normalized);
      }
    } catch (scriptErr: any) {
      console.warn("Apps Script fetch error, falling back:", scriptErr.message);
    }
  }

  try {
    const targetSheetId = String(spreadsheetId || '');
    const auth = getAuthClientFromReq(req);
    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // Get metadata & web view link
    const fileMeta = await drive.files.get({
      fileId: targetSheetId,
      fields: "id, name, webViewLink"
    });

    // Batch read all tabs
    const ranges = [
      ...MONTH_NAMES.map((m) => `${m}!A2:H500`),
      "Contas!A2:A100",
      "Cartão!A2:A100",
      "Centro Custo!A2:C100",
      "Categorias!A2:B100"
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: targetSheetId,
      ranges
    });

    const valueRanges = response.data.valueRanges || [];

    // Parse Month Transactions
    const monthsData: Record<string, any[]> = {};
    MONTH_NAMES.forEach((m, idx) => {
      const rows = valueRanges[idx]?.values || [];
      monthsData[m] = rows
        .filter((r) => r.length >= 5 && r[0]) // valid row with date
        .map((r, rowIndex) => {
          const rawAmount = parseFloat(String(r[5] || "0").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
          const rawRecurrence = parseInt(String(r[6] || "1").trim(), 10) || 1;
          const rawMode = parseInt(String(r[7] || "-1").trim(), 10) || -1;

          return {
            id: `${m}-${rowIndex + 2}`,
            sheetName: m,
            rowIndex: rowIndex + 2,
            date: String(r[0] || ""),
            account: String(r[1] || ""),
            category: String(r[2] || "Outros"),
            subcategory: String(r[3] || ""),
            description: String(r[4] || ""),
            amount: Math.abs(rawAmount),
            recurrence: rawRecurrence,
            mode: rawMode === 1 ? 1 : -1
          };
        });
    });

    // Offset index for auxiliary tabs
    const offset = MONTH_NAMES.length;
    const accountsRows = valueRanges[offset]?.values || [];
    const cardsRows = valueRanges[offset + 1]?.values || [];
    const costCenterRows = valueRanges[offset + 2]?.values || [];
    const categoryRows = valueRanges[offset + 3]?.values || [];

    const accounts = accountsRows.map((r) => String(r[0] || "")).filter(Boolean);
    const cards = cardsRows.map((r) => String(r[0] || "")).filter(Boolean);

    const costCenters = costCenterRows
      .map((r) => ({
        name: String(r[0] || ""),
        associatedCard: String(r[1] || ""),
        balance: parseFloat(String(r[2] || "0").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0
      }))
      .filter((c) => c.name);

    const categories = categoryRows
      .map((r) => ({
        name: String(r[0] || ""),
        subcategories: String(r[1] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      }))
      .filter((c) => c.name);

    res.json({
      spreadsheet: {
        id: targetSheetId,
        name: fileMeta.data.name || "Fluxo Caixa",
        url: fileMeta.data.webViewLink || `https://docs.google.com/spreadsheets/d/${targetSheetId}`
      },
      accounts: accounts.length ? accounts : ["Banco do Brasil", "Itaú", "NuBank", "Carteira"],
      cards: cards.length ? cards : ["Cartão NuBank", "Cartão XP"],
      costCenters,
      categories,
      monthsData
    });
  } catch (error: any) {
    console.warn("Error reading spreadsheet via Drive API, trying Apps Script Web App...", error.message);
    try {
      const rawData = await fetchFromAppsScript();
      const normalized = normalizeAppsScriptData(rawData);
      if (normalized) {
        return res.json(normalized);
      }
    } catch (fallbackErr: any) {
      console.error("Apps script fallback failed:", fallbackErr.message);
    }
    res.status(500).json({ error: error.message || "Erro ao ler dados da planilha" });
  }
});

// Create new transaction (handles recurrences, installments, cost center logic)
app.post("/api/sheets/transaction", async (req, res) => {
  const {
    spreadsheetId,
    date, // YYYY-MM-DD
    account,
    category,
    subcategory,
    description,
    amount,
    recurrence = 1,
    mode = -1,
    costCenter
  } = req.body;

  if (!spreadsheetId || !date || !account || !amount) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  if (spreadsheetId === "script-web-app" || spreadsheetId === "default") {
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
  }

  try {
    const auth = getAuthClientFromReq(req);
    const sheets = google.sheets({ version: "v4", auth });

    // Parse launch date
    const d = new Date(date + "T12:00:00Z");
    const startMonthIndex = d.getMonth(); // 0..11
    const day = d.getDate();
    const year = d.getFullYear();

    const recurrenceCount = Math.max(1, parseInt(String(recurrence), 10) || 1);
    const numAmount = Math.abs(parseFloat(String(amount)));
    const transactionMode = parseInt(String(mode), 10) === 1 ? 1 : -1;

    // Determine account to store in sheet row
    // If costCenter is provided, look up associated card
    let accountToRecord = account;
    if (costCenter) {
      // Find cost center associated card from sheet if needed
      // Or use costCenter name / associated card
      accountToRecord = account; // Account or associated card
    }

    const addedRows: any[] = [];

    for (let i = 0; i < recurrenceCount; i++) {
      const targetMonthIdx = (startMonthIndex + i) % 12;
      const targetMonthName = MONTH_NAMES[targetMonthIdx];
      
      // Calculate target date
      const targetDateObj = new Date(year, startMonthIndex + i, day);
      const targetDayStr = String(targetDateObj.getDate()).padStart(2, "0");
      const targetMonthStr = String(targetDateObj.getMonth() + 1).padStart(2, "0");
      const targetYearStr = targetDateObj.getFullYear();
      const formattedDateStr = `${targetYearStr}-${targetMonthStr}-${targetDayStr}`;

      // Build row description (add installment info if parcelado > 1)
      let rowDesc = description || "";
      if (recurrenceCount > 1) {
        rowDesc = rowDesc ? `${rowDesc} (${i + 1}/${recurrenceCount})` : `Parcela ${i + 1}/${recurrenceCount}`;
      }

      const rowValues = [
        formattedDateStr,
        accountToRecord,
        category || "Geral",
        subcategory || "",
        rowDesc,
        numAmount,
        recurrenceCount,
        transactionMode
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${targetMonthName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues]
        }
      });

      addedRows.push({
        month: targetMonthName,
        date: formattedDateStr,
        amount: numAmount * transactionMode
      });
    }

    // If cost center is involved, update cost center balance in "Centro Custo" tab
    if (costCenter) {
      try {
        const ccRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Centro Custo!A2:C50"
        });
        const rows = ccRes.data.values || [];
        const rowIndex = rows.findIndex((r) => r[0] === costCenter);
        if (rowIndex !== -1) {
          const currentBalance = parseFloat(String(rows[rowIndex][2] || "0").replace(",", ".")) || 0;
          // Expenses increase cost center accumulated spend/balance or reduce budget
          const newBalance = currentBalance + (numAmount * transactionMode * recurrenceCount);
          const rowNumber = rowIndex + 2;
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Centro Custo!C${rowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[newBalance]]
            }
          });
        }
      } catch (err) {
        console.warn("Could not update cost center balance cell:", err);
      }
    }

    res.json({
      success: true,
      count: recurrenceCount,
      addedRows
    });
  } catch (error: any) {
    console.warn("Error creating transaction via Sheets API, trying Apps Script Web App...", error.message);
    try {
      const result = await postToAppsScript({
        action: "addTransaction",
        ...req.body
      });
      return res.json(result);
    } catch (fallbackErr: any) {
      console.error("Apps Script transaction fallback failed:", fallbackErr.message);
    }
    res.status(500).json({ error: error.message || "Erro ao gravar lançamento na planilha." });
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
