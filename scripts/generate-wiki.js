#!/usr/bin/env node
/**
 * generate-wiki.js
 *
 * Coleta a documentação do repositório (AGENTS.md, MODOS_OPERACAO.md, README.md)
 * e usa a API da Anthropic (Claude) para gerar/atualizar as páginas do GitHub Wiki.
 *
 * Variáveis de ambiente esperadas:
 *   ANTHROPIC_API_KEY  — chave da API Anthropic
 *   WIKI_DIR           — caminho local para o repositório do wiki (clonado pelo workflow)
 *   GITHUB_REPOSITORY  — owner/repo (preenchido automaticamente pelo GitHub Actions)
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const WIKI_DIR = process.env.WIKI_DIR || path.join(__dirname, "..", "wiki-out");
const REPO_ROOT = path.join(__dirname, "..");
const MODULES_ROOT = path.join(REPO_ROOT, "modules", "controleonline");
const ANTHROPIC_MODEL = "claude-opus-4-5";

if (!ANTHROPIC_API_KEY) {
  console.error("ERRO: variável ANTHROPIC_API_KEY não definida.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers de leitura de arquivos
// ---------------------------------------------------------------------------

/** Lê um arquivo de texto; retorna string vazia se não existir. */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

/**
 * Percorre recursivamente um diretório e retorna objetos { file, content }
 * para todos os arquivos AGENTS.md encontrados.
 */
function collectAgentsMd(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectAgentsMd(full));
    } else if (entry.name === "AGENTS.md") {
      const content = readFile(full);
      if (content.trim()) results.push({ file: full, content });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Chamada à API Anthropic
// ---------------------------------------------------------------------------

/**
 * Chama o Claude com um prompt e retorna o texto de resposta.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// Geração de conteúdo de cada página do wiki
// ---------------------------------------------------------------------------

/**
 * Gera a página inicial do wiki com a visão geral do sistema.
 */
async function generateHomePage(rootDocs) {
  const prompt = `Você é um technical writer experiente. Com base na documentação abaixo de um sistema React Native para gestão empresarial (app-community da ControleOnline), gere a página inicial do GitHub Wiki desse projeto em português do Brasil.

A página deve conter:
1. Um parágrafo introdutório claro sobre o que é o sistema
2. A lista de módulos disponíveis com uma linha descritiva de cada um
3. A lista de visões por APP_TYPE (MANAGER, CRM, POS, PPC, SHOP, DELIVERY) com descrição curta
4. Links para outras páginas do wiki usando o formato [[Nome da Página]]
5. Uma seção "Como contribuir" com as convenções do projeto

Use Markdown limpo e linguagem acessível para desenvolvedores.

=== README.md ===
${rootDocs.readme}

=== AGENTS.md (raiz) ===
${rootDocs.agents}

=== MODOS_OPERACAO.md ===
${rootDocs.modosOperacao}
`;

  return callClaude(prompt);
}

/**
 * Gera a página de Modos de Operação a partir do MODOS_OPERACAO.md.
 */
async function generateModosOperacaoPage(modosOperacaoContent) {
  const prompt = `Você é um technical writer experiente. Reescreva o conteúdo abaixo do arquivo MODOS_OPERACAO.md como uma página do GitHub Wiki em português do Brasil.

Mantenha toda a informação, mas torne a linguagem mais clara e acessível para desenvolvedores que estão entrando no projeto. Use títulos, subtítulos, tabelas ou listas onde fizer sentido. Use Markdown limpo.

=== MODOS_OPERACAO.md ===
${modosOperacaoContent}
`;

  return callClaude(prompt);
}

/**
 * Gera a página de convenções e arquitetura do projeto.
 */
async function generateConvencoesPage(agentsContent) {
  const prompt = `Você é um technical writer experiente. Com base nas convenções e regras do projeto abaixo, gere uma página de "Convenções e Arquitetura" para o GitHub Wiki em português do Brasil.

A página deve conter:
1. Princípios gerais de arquitetura
2. Convenções de código e estilo
3. Regras sobre stores vs estado local
4. Regras sobre modularização e componentização
5. Padrões de navegação e roteamento
6. Regras de internacionalização (tradução)
7. Regras de tratamento de erros

Use Markdown limpo com seções bem definidas.

=== AGENTS.md ===
${agentsContent}
`;

  return callClaude(prompt);
}

/**
 * Gera a página de um módulo específico.
 * @param {string} moduleName  nome do módulo (ex: "ui-orders")
 * @param {string} agentsContent conteúdo do AGENTS.md do módulo
 * @param {string} readmeContent conteúdo do README.md do módulo
 */
async function generateModulePage(moduleName, agentsContent, readmeContent) {
  const contextSections = [];
  if (agentsContent.trim())
    contextSections.push(`=== AGENTS.md ===\n${agentsContent}`);
  if (readmeContent.trim())
    contextSections.push(`=== README.md ===\n${readmeContent}`);

  if (!contextSections.length) return null;

  const prompt = `Você é um technical writer experiente. Com base na documentação abaixo do módulo "${moduleName}" de um sistema React Native de gestão empresarial, gere uma página do GitHub Wiki em português do Brasil.

A página deve conter:
1. Descrição clara do que o módulo faz e para quem é destinado
2. Principais funcionalidades
3. Regras de negócio importantes
4. Componentes ou telas principais (se mencionados)
5. Integrações com outros módulos
6. Limitações e o que o módulo NÃO deve fazer
7. Observações para desenvolvedores

Use Markdown limpo e linguagem técnica, mas acessível.

${contextSections.join("\n\n")}
`;

  return callClaude(prompt);
}

// ---------------------------------------------------------------------------
// Escrita no diretório do wiki
// ---------------------------------------------------------------------------

/** Garante que o diretório de saída existe e escreve o arquivo. */
function writeWikiPage(filename, content) {
  if (!fs.existsSync(WIKI_DIR)) fs.mkdirSync(WIKI_DIR, { recursive: true });
  const dest = path.join(WIKI_DIR, filename);
  fs.writeFileSync(dest, content, "utf8");
  console.log(`✓ Página gerada: ${filename}`);
}

// ---------------------------------------------------------------------------
// Ponto de entrada principal
// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 Iniciando geração de wiki...\n");

  // --- Lê documentação raiz ---
  const rootDocs = {
    readme: readFile(path.join(REPO_ROOT, "README.md")),
    agents: readFile(path.join(REPO_ROOT, "AGENTS.md")),
    modosOperacao: readFile(path.join(REPO_ROOT, "MODOS_OPERACAO.md")),
  };

  // --- Coleta AGENTS.md de todos os módulos ---
  const moduleAgentFiles = collectAgentsMd(MODULES_ROOT);

  // Agrupa por módulo de primeiro nível (ui-orders, ui-manager, etc.)
  const moduleMap = {};
  for (const { file, content } of moduleAgentFiles) {
    // Extrai o nome do módulo de primeiro nível relativo a MODULES_ROOT
    const rel = path.relative(MODULES_ROOT, file);
    const moduleName = rel.split(path.sep)[0];
    if (!moduleMap[moduleName]) {
      moduleMap[moduleName] = { agents: "", readme: "" };
    }
    moduleMap[moduleName].agents += `\n${content}`;
  }

  // Lê README.md de cada módulo (quando existir)
  for (const modDir of fs.readdirSync(MODULES_ROOT)) {
    const readme = readFile(
      path.join(MODULES_ROOT, modDir, "README.md")
    );
    if (readme.trim()) {
      if (!moduleMap[modDir]) moduleMap[modDir] = { agents: "", readme: "" };
      moduleMap[modDir].readme = readme;
    }
  }

  // --- Gera página Home ---
  console.log("📄 Gerando Home...");
  const homeContent = await generateHomePage(rootDocs);
  writeWikiPage("Home.md", homeContent);

  // --- Gera página de Modos de Operação ---
  if (rootDocs.modosOperacao.trim()) {
    console.log("📄 Gerando Modos-de-Operacao...");
    const modosContent = await generateModosOperacaoPage(
      rootDocs.modosOperacao
    );
    writeWikiPage("Modos-de-Operacao.md", modosContent);
  }

  // --- Gera página de Convenções ---
  if (rootDocs.agents.trim()) {
    console.log("📄 Gerando Convencoes-e-Arquitetura...");
    const convencoesContent = await generateConvencoesPage(rootDocs.agents);
    writeWikiPage("Convencoes-e-Arquitetura.md", convencoesContent);
  }

  // --- Gera página por módulo ---
  const moduleNames = Object.keys(moduleMap).sort();
  for (const moduleName of moduleNames) {
    const { agents, readme } = moduleMap[moduleName];
    if (!agents.trim() && !readme.trim()) continue;

    console.log(`📄 Gerando módulo: ${moduleName}...`);
    const pageContent = await generateModulePage(moduleName, agents, readme);
    if (pageContent) {
      writeWikiPage(`${moduleName}.md`, pageContent);
    }
  }

  // --- Gera índice de módulos ---
  console.log("📄 Gerando índice de módulos...");
  await generateModulesIndexPage(moduleNames, rootDocs);

  console.log("\n✅ Wiki gerado com sucesso!");
}

/**
 * Gera a página de índice listando todos os módulos.
 */
async function generateModulesIndexPage(moduleNames, rootDocs) {
  const listItems = moduleNames
    .map((m) => `- [[${m}]]`)
    .join("\n");

  const prompt = `Você é um technical writer experiente. Gere uma página de índice de módulos para o GitHub Wiki do app-community (ControleOnline) em português do Brasil.

A página deve conter:
1. Um parágrafo introdutório explicando a arquitetura de módulos compartilhados
2. A lista de módulos abaixo, com uma linha descritiva de cada um baseada no nome e no contexto do sistema
3. Uma nota sobre submodules Git

Use Markdown limpo. Os módulos são:
${listItems}

Contexto geral do sistema:
${rootDocs.agents.slice(0, 2000)}
`;

  const content = await callClaude(prompt);
  writeWikiPage("Modulos.md", content);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
