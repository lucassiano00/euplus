# EuPlus

> **Hub de Inteligência Financeira** — plataforma de clube de benefícios/descontos que conecta usuários a uma rede de parceiros locais, com simulador de economia, área administrativa e cadastro com crédito anual.

Site em produção: **https://euplus.com.br**

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rodando localmente](#rodando-localmente)
- [Build e deploy](#build-e-deploy)
- [Banco de dados](#banco-de-dados)
- [Referência das Functions](#referência-das-functions)
- [Rotas do painel admin](#rotas-do-painel-admin)
- [Notas de segurança](#notas-de-segurança)

---

## Visão geral

O EuPlus é uma SPA (Single Page Application) em React + TypeScript servida pela Netlify, com um backend serverless em **Netlify Functions** e banco **PostgreSQL**. O usuário se cadastra, paga o crédito (anual) via Pix e passa a ter acesso à rede de descontos. Um painel administrativo permite gerenciar usuários, parceiros, ofertas e auditoria.

O roteamento é baseado em **hash** (`#/rota`), então não há necessidade de configuração de SPA redirects no servidor.

## Funcionalidades

### Site público (`src/App.tsx`)
- **Hero** com proposta de valor e CTA para o simulador.
- **Simulador de economia** — projeta acúmulo a partir dos gastos mensais.
- **Cadastro** — pessoa física, com pagamento do crédito via Pix; novo cadastro entra como **ATIVO** automaticamente.
- **Rede de parceiros** — filtrável por categoria e região, com card de contato direto (WhatsApp) e/ou mapa (Google Maps embed) por parceiro.
- **Ofertas do dia** — carrossel de promoções.
- **Consulta de status** por CPF.

### Painel administrativo (`src/DashboardApp.tsx`)
- Login administrativo.
- Gestão de **alunos/usuários** (criar, alterar status: ATIVO / INATIVO / PENDENTE / BLOQUEADO).
- Gestão de **parceiros** e **ofertas** (CRUD, flags de exibição no mapa e nas ofertas).
- **Dashboard** com métricas (ativos, pendentes, etc.) e **log de auditoria**.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Estilo | Tailwind CSS 3, PostCSS, Autoprefixer |
| Animação | `motion` (Framer Motion) |
| Ícones | `lucide-react`, `@phosphor-icons/react` |
| Vídeo | `hls.js` |
| Backend | Netlify Functions (Node, ESM `.mjs`) |
| Banco | PostgreSQL (driver `pg`) |
| Hospedagem | Netlify |

## Arquitetura

```
Browser (SPA React)
   │  fetch /.netlify/functions/*
   ▼
Netlify Functions (serverless)
   │  pg Pool
   ▼
PostgreSQL
```

- O frontend chama as funções via `functionsBase` — em produção, `/.netlify/functions`; em dev, `http://localhost:8888/.netlify/functions` (Netlify CLI).
- O schema do banco é criado/migrado de forma idempotente em `netlify/functions/_db.mjs` na primeira query (cria tabelas com `CREATE TABLE IF NOT EXISTS`, adiciona colunas faltantes e triggers de `updated_at`).

## Estrutura do projeto

```
euplus/
├── index.html                 # entry HTML (Vite)
├── netlify.toml               # config de build/deploy (publish=dist, functions)
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx               # bootstrap React
│   ├── App.tsx                # site público (hero, cadastro, parceiros, ofertas)
│   ├── DashboardApp.tsx       # painel administrativo
│   ├── dashboardData.ts       # dados/mocks de apoio do painel
│   ├── index.css / App.css    # estilos globais
│   └── assets/
└── netlify/
    └── functions/
        ├── _db.mjs            # pool pg + criação/migração do schema + seed admin
        ├── register.mjs       # POST cadastro público
        ├── status.mjs         # GET consulta de status por CPF
        ├── auth-login.mjs     # POST login de usuário (CPF + senha)
        └── dashboard.mjs      # GET dados do painel + POST ações administrativas
```

## Variáveis de ambiente

Configure no Netlify (Site settings → Environment variables) e, para dev local, em um arquivo `.env` (não versionado):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | **Sim** | String de conexão PostgreSQL. A conexão usa SSL (`rejectUnauthorized: false`). |
| `ADMIN_SEED_PASSWORD` | Recomendada | Senha do usuário admin semeado. **Se não definida, o seed do admin é ignorado** (nenhuma senha padrão é criada). |
| `ADMIN_SEED_EMAIL` | Não | E-mail do admin semeado. Default: `admin@euplus.com.br`. |

> ⚠️ Nunca commite credenciais. O seed do admin lê a senha de `ADMIN_SEED_PASSWORD` justamente para não deixar segredo no código.

## Rodando localmente

Pré-requisitos: Node 18+ e um PostgreSQL acessível (local ou em nuvem).

```bash
# 1. Instalar dependências
npm install

# 2a. Apenas frontend (sem backend; parceiros caem no fallback estático)
npm run dev               # Vite em http://localhost:5173

# 2b. Full-stack (frontend + Netlify Functions + banco)
#     Requer a Netlify CLI e DATABASE_URL no ambiente/.env
npx netlify dev           # serve funções em http://localhost:8888 e o front em 5173/8888
```

Lint:

```bash
npm run lint
```

## Build e deploy

```bash
npm run build             # tsc -b && vite build  → gera dist/
npm run preview           # serve o build localmente
```

**Deploy (Netlify):** a configuração canônica fica em [`netlify.toml`](netlify.toml):

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
```

> Esse `netlify.toml` na raiz é **essencial**: sem ele, deploys por upload publicam a raiz do repositório em vez de `dist/`, e o site quebra com erro de MIME (`application/octet-stream`) ao carregar `/src/main.tsx`.

Após o deploy, valide:

```bash
curl -s https://euplus.com.br/ | grep assets/index   # deve apontar para o JS buildado
```

## Banco de dados

Tabelas principais (criadas em `_db.mjs`):

- **`registrations`** — cadastros do site público. `status` default `PENDENTE` no schema, mas o `register.mjs` insere novos como `ATIVO`.
- **`admin_users`** — usuários do painel (seed via env).
- **`vida_accounts`** / **`vida_dependents`** — contas e dependentes geridos pelo admin.
- **`partners`** / **`offers`** — rede de parceiros e ofertas.
- **`audit_logs`** — trilha de auditoria das ações administrativas.

Triggers `set_updated_at_timestamp()` mantêm `updated_at` em dia nas tabelas relevantes.

## Referência das Functions

| Endpoint | Método | Descrição |
|---|---|---|
| `/.netlify/functions/register` | `POST` | Cria/atualiza cadastro (`ON CONFLICT (cpf)`). Novo cadastro → `status = ATIVO`. Re-cadastro **não** altera o status (preserva inativação manual do admin). |
| `/.netlify/functions/status?cpf=` | `GET` | Consulta status por CPF (busca em `registrations` e `vida_accounts`). |
| `/.netlify/functions/auth-login` | `POST` | Login de usuário por CPF + senha. |
| `/.netlify/functions/dashboard` | `GET` | Retorna dados agregados do painel (usuários, parceiros, ofertas, auditoria). |
| `/.netlify/functions/dashboard` | `POST` | Ações administrativas via `action`: `adminLogin`, `createStudent`, `updateStudentStatus`, `createVida`, `updateVidaStatus`, `savePartner`, `saveOffer`. |

## Rotas do painel admin

Acessadas via hash a partir de `/#/...`:

- `/login-admin` — login
- `/admin/dashboard` — visão geral e métricas
- `/admin/alunos`, `/admin/alunos/:id` — usuários/alunos
- `/admin/vida` — contas Vida
- `/admin/parceiros`, `/admin/parceiros/novo`, `/admin/parceiros/:id`
- `/admin/ofertas`, `/admin/ofertas/nova`, `/admin/ofertas/:id`
- `/admin/auditoria` — log de auditoria
- `/consulta-status-cpf` — consulta pública de status

## Notas de segurança

- **Senha do admin via env** (`ADMIN_SEED_PASSWORD`) — sem segredo hardcoded.
- **Senhas em texto puro**: usuários e admin são comparados sem hash (`WHERE cpf = $1 AND password = $2`). Para produção real, recomenda-se migrar para hashing (bcrypt/argon2). A coluna `password` de `registrations` tem default fraco (`123456`) usado apenas como placeholder.
- **Endpoint de cadastro público e sem rate-limit**: como o novo cadastro entra como `ATIVO` automaticamente (modelo de cobrança anual), considere captcha/rate-limit e a validação efetiva do pagamento antes de liberar o acesso.
- **CORS**: as funções respondem com `Access-Control-Allow-Origin: *`.

---

Projeto privado — © EuPlus.
