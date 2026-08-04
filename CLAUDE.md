# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> `../CLAUDE.md` (Second Brain protocol) also applies. `README.md` is the long-form reference in pt-BR — its "Notas de segurança" section predates `_auth.mjs` and is stale (passwords are scrypt-hashed now).

## Commands

```bash
npm install
npm run dev          # Vite only, http://localhost:5173 — funciona, mas as chamadas de API vão pra :8888
npx netlify dev      # full-stack: Functions em :8888 + front. Precisa de DATABASE_URL no .env
npm run build        # tsc -b && vite build  → dist/
npm run lint
npm test             # node tests/auth.test.mjs — único teste, sem framework
npm run preview
```

Sem script de typecheck isolado: o `tsc -b` mora dentro do `build`.
`npm test` é um arquivo só de `assert` — para rodar "um teste", rode o arquivo e leia qual assert falhou.

## Arquitetura

SPA React (hash routing, sem react-router) + Netlify Functions + PostgreSQL. Sem SPA redirects no servidor porque tudo é `#/rota`.

**Roteamento vive em `src/App.tsx:1870`** (`function App`): lê `window.location.hash`, e `/login-admin`, `/consulta-status-cpf` e `/admin*` são delegados inteiros pro `DashboardApp`. Qualquer coisa fora disso renderiza a landing (seções empilhadas). Dentro do `DashboardApp`, `getHashPath()`/`navigateHash()` fazem o mesmo trabalho de novo.

**Dois arquivos monolíticos, de propósito:** `src/App.tsx` (~1.9k linhas, site público) e `src/DashboardApp.tsx` (~1.8k, admin). Todas as seções/telas são componentes no mesmo arquivo. Não parta em vinte arquivos sem pedido explícito.

**`functionsBase` está duplicado** nos dois (`App.tsx:47`, `DashboardApp.tsx:101`): `import.meta.env.DEV ? 'http://localhost:8888/.netlify/functions' : '/.netlify/functions'`. Mexeu em um, mexa no outro.

### Backend (`netlify/functions/`)

Handlers ESM `.mjs` no estilo antigo (`export async function handler(event)`), cada um com seu helper `json()` local e CORS `*`.

- **`_db.mjs`** — pool `pg` + **todo o schema**. A primeira `query()` roda a migração idempotente (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, triggers de `updated_at`, seed do admin), guardada por `initPromise` contra corrida. **Não existe diretório de migrations: mudança de schema é edit aqui.**
- **`_auth.mjs`** — auth escrita à mão, só `node:crypto`. Sem lib de JWT, sem bcrypt.
  - Token: `<id>.<nome em base64url>.<exp>.<hmac-sha256>`, TTL 8h, assinado com `ADMIN_TOKEN_SECRET`. Sem o segredo tudo **falha fechado** (`isAuthConfigured()` → 503 no login, 401 nas escritas, GET só devolve dados públicos).
  - O nome do admin viaja **dentro** do token assinado — por isso o `actor` do audit log não sai do corpo do POST (que é forjável).
  - Senhas: `scrypt$<salt>$<hash>`. `verifyPassword` aceita o legado em texto puro e devolve `needsRehash`; quem loga com legado é reescrito hasheado na hora (`auth-login.mjs`, `dashboard.mjs`). Comparações via `timingSafeEqual`.
- **`dashboard.mjs`** — endpoint único do admin. `GET` sem token → só parceiros/ofertas (zero PII); `GET` com token → tudo. `POST` despacha por `payload.action`; **tudo exceto `adminLogin` exige `verifyAdmin(event)`**. Nova operação administrativa = novo branch de `action` + `pushAudit(actor, ...)`.
- `register.mjs` (cadastro público, novo entra `ATIVO`; re-cadastro **não** toca `status`, para não desfazer inativação manual), `status.mjs` (consulta por CPF em `registrations` → `vida_accounts` → `vida_dependents`), `auth-login.mjs` (CPF + senha).

### Convenções de dados

IDs do front são prefixados e desmontados nos mappers: `stu-` (registrations), `usr-` (vida_accounts), `prt-`, `ofr-`, `dep-`, `log-`. Escritas fazem `Number(String(id).replace('prt-',''))`.
`'NO_AUTH'` é o sentinela de senha para registro criado pelo admin (sem login próprio).
Região `IAP` é exibida como `FAP` (`formatRegionLabel`).
`src/dashboardData.ts` ainda exporta seeds/mocks (`initialStudents`, `initialPartners`…) — os dados reais vêm da API; o que importa ali são os **tipos compartilhados** (`StudentStatus`, `PartnerRecord`, …).

## Gotchas

- **`fallbackPartners` em `App.tsx:131` é a fonte da verdade visual da rede.** `mergePartnersWithFallback` casa linha do banco com entrada hardcoded pela chave `categoria|dígitos do telefone` (senão telefone, senão nome normalizado) e **os campos do fallback ganham do banco**; parceiro que só existe no fallback é anexado. Telefone divergente entre banco e fallback = **card duplicado**. O array `offers` (`App.tsx:162`) é 100% hardcoded, junto com as artes em `public/IMG/`.
- **`netlify.toml` na raiz é essencial** (`publish = "dist"`). Sem ele o deploy por upload publica a raiz do repo e o site morre com MIME `application/octet-stream` em `/src/main.tsx`. Validação pós-deploy: `curl -s https://euplus.com.br/ | grep assets/index`.
- **PWA com `registerType: 'prompt'` + `ReloadPrompt.tsx` é decisão, não descuido**: com `autoUpdate` a aba aberta continuava no bundle velho. `public/IMG/**` está fora do precache (`globIgnores`).
- **Tailwind é paleta semântica dark-only** (`surface`, `on-surface`, `surface-container`, `primary`, `secondary`, `on-primary`…) em `tailwind.config.js`. Use os tokens, não hex cru. Fontes: `font-headline` (Epilogue), `font-body`/`font-label` (Inter).
- `translate="no" className="notranslate"` nas raízes e o par `NO_TRANSLATE_BEAUTY_TEXT`/`isBeautyText` existem porque o Google Translate destruía a cópia. Não remova.
- `readApiBody()` (nos dois arquivos do front) detecta resposta HTML e converte em erro legível — é o sintoma de function não servida (rodou `npm run dev` sem `netlify dev`).
- Comentários `ponytail:` marcam simplificação deliberada com teto conhecido. Leia antes de "consertar".

## Estilo

UI, mensagens de erro e comentários do backend em **pt-BR** — acompanhe. Sem ponto e vírgula, aspas simples, componentes em `function`, helpers em arrow const. Validação de entrada nas Functions é sempre `String(x || '').trim()` + `onlyDigits` + checagem de CPF com 11 dígitos.

## Env

`DATABASE_URL` (obrigatório, SSL `rejectUnauthorized: false`), `ADMIN_TOKEN_SECRET` (obrigatório pro painel; sem ele falha fechado), `ADMIN_SEED_PASSWORD` (sem ela o seed do admin é ignorado — nenhuma senha padrão é criada), `ADMIN_SEED_EMAIL`. No Netlify, `ADMIN_TOKEN_SECRET` precisa estar no escopo **Functions**.
