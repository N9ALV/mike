# Repurposing Mike for Investing and Wealth Creation

## Executive summary

Mike can be repurposed into an AI investing and wealth-creation operating system much faster than building a new product from scratch. The existing codebase already contains the core primitives needed for an investment research and portfolio intelligence product:

- authenticated users and profiles
- projects/workspaces
- document upload, storage, conversion, extraction, display, download, and versioning
- project-scoped chats
- streaming AI responses
- reusable assistant and tabular workflows
- tabular review across many documents
- generated DOCX outputs
- collaboration and sharing
- configurable model-provider support

The current legal-specific behaviour should be treated as a domain layer, not as the product's permanent identity. The valuable foundation is the workflow architecture: documents, projects, AI chat, reusable workflows, extraction tables, versioned outputs, and collaboration.

That maps naturally to investment research, portfolio construction, decision journaling, due diligence, memo generation, and ongoing monitoring.

The recommended first product is not an AI trading bot or stock picker. The strongest first wedge is an AI investment research workspace that helps users analyse documents and data, compare opportunities, create investment memos, maintain theses, and improve decision discipline.

## Current codebase strengths

### 1. Projects as research workspaces

The existing `projects` model can become `portfolios`, `strategies`, or `research_spaces`. It already supports ownership, shared access, documents, chats, tabular reviews, folders, and per-project access checks.

Investment-oriented mappings:

- `projects` -> portfolios, strategies, research spaces, due diligence rooms
- `project_subfolders` -> research folders such as Equities, ETFs, Crypto, Real Estate, Private Deals, Macro, Tax, Retirement, Insurance, Estate Planning
- `shared_with` -> advisor/client/family/team sharing

Example workspaces:

- My Long-Term Portfolio
- AI Infrastructure Basket
- Retirement Plan
- Private Deal Diligence
- Macro Watchlist
- Real Estate Pipeline
- Tax-Aware Rebalancing
- Family Wealth Binder

### 2. Documents as filings, statements, memos, decks, and reports

The existing document system is one of the strongest reusable components. It supports PDFs, DOCX, DOC, object storage, document versions, converted PDF display, access control, and downloads.

Investment-oriented document types:

- broker statements
- bank statements
- portfolio reports
- 10-Ks and 10-Qs
- annual reports
- earnings-call transcripts
- investor presentations
- sell-side reports, where licensing permits
- fund letters
- ETF/fund prospectuses
- pitch decks
- real estate offering memoranda
- tax documents
- personal financial plans
- insurance policies
- estate documents
- operating agreements and private-placement materials

Investing is document-heavy. This is a meaningful advantage because many AI investing tools focus only on tickers and prices, while underweighting document ingestion and evidence-backed reasoning.

### 3. Chat as the investment research co-pilot

The existing chat backend already supports authenticated chats, project-scoped chats, document context, workflow context, persisted messages, annotations/events, and streaming AI responses.

Repurpose the assistant from a legal assistant to an investment research assistant.

Suggested positioning:

> You are an investment research assistant. You help users analyse securities, portfolios, financial documents, valuation, risk, and wealth-planning decisions. You separate facts from assumptions, quantify uncertainty where possible, cite source material, and avoid unsupported personalised financial advice.

The current legal system prompt should be replaced. Its useful pattern is strong citation discipline and tool-driven document access, but the legal drafting and contract-specific instructions should be removed.

### 4. Workflows as investing playbooks

The workflow system is highly reusable. Investing benefits from repeatable process, and workflows can encode process discipline.

Recommended system workflows:

- Analyze a public company
- Build a bull/base/bear thesis
- Extract risks from a 10-K
- Summarize an earnings call
- Compare companies
- Generate an investment memo
- Review portfolio risk
- Assess dividend sustainability
- Analyze an ETF or fund
- Underwrite a real estate deal
- Review a private company investment
- Draft an investment policy statement
- Run a tax-loss harvesting review
- Prepare a quarterly wealth review
- Create a sell/trim/hold checklist
- Build a watchlist thesis

### 5. Tabular review as a comparison matrix engine

The existing tabular review system is especially valuable. It already runs column prompts across documents and stores generated cell content. That can become a matrix engine for comparing companies, funds, deals, assets, and documents.

Use cases:

- public company comparison
- ETF/fund comparison
- earnings transcript comparison
- real estate deal comparison
- private investment due diligence
- portfolio holding review
- insurance-policy comparison
- tax-document extraction
- fund-letter synthesis

Example public company columns:

- business description
- revenue growth
- gross margin
- operating margin
- free-cash-flow margin
- net cash/debt
- valuation multiple
- management quality
- moat
- key risks
- bull case
- bear case
- catalysts
- kill criteria

Example real estate columns:

- purchase price
- NOI
- cap rate
- occupancy
- debt terms
- DSCR
- rent growth assumption
- exit cap assumption
- sponsor track record
- sensitivity downside
- key risks

### 6. DOCX generation as investment memo/report generation

The existing document-generation layer can become a memo and report generator.

Potential outputs:

- investment memo
- portfolio review
- risk report
- due diligence memo
- quarterly family wealth report
- personal investment policy statement
- real estate underwriting memo
- exit checklist
- why-I-bought / why-I-sold decision record
- watchlist review

The tracked-editing functionality is less central for investing than for legal drafting, but versioned outputs and editable reports are still useful.

## Product direction

The product should be positioned as:

> An AI investment research and wealth operating system that turns documents, data, and decisions into a repeatable investment process.

Avoid positioning it as:

> An AI stock picker.

The former is defensible, useful, and safer. The latter invites regulatory, trust, and performance problems.

## Product versions

### Version A: Investment research assistant

This is the best first pivot.

Core features:

- upload filings, transcripts, decks, reports, and statements
- ask cited questions against uploaded material
- run research workflows
- compare companies, funds, or deals in tables
- generate investment memos
- save thesis, risks, and conclusions
- maintain a decision journal

This version uses most of the existing codebase as-is.

### Version B: Portfolio intelligence cockpit

More ambitious, but strategically stronger.

Additional features:

- manual or brokerage-imported holdings
- price and fundamental data
- allocation dashboards
- performance analytics
- concentration risk
- scenario analysis
- rebalancing drift
- watchlists and alerts
- position-level thesis tracking

This requires a new financial data layer.

### Version C: Wealth creation OS

Broadest version.

Additional features:

- net worth tracking
- cash-flow planning
- tax-aware decision support
- real estate/private-investment tracking
- retirement simulations
- insurance and estate-document analysis
- family/advisor collaboration
- quarterly wealth reports

This is strategically interesting but should come after Version A or Version B.

## Target operating stack

Use the stack already available instead of introducing a new hosting platform for the first release.

### Supabase responsibilities

Supabase should remain the system of record for:

- authentication
- user profiles and model settings
- projects/research workspaces
- documents and document metadata
- workflows/playbooks
- chats and assistant messages
- tabular review state
- theses
- decision journal entries
- securities, market data, portfolios, and holdings when those layers are added

Supabase Row Level Security should protect direct client access where the frontend reads from Supabase. Backend routes must still perform explicit access checks because the current app uses a server API for most application behaviour.

### Cloudflare responsibilities

Cloudflare should provide the public edge:

- DNS for the product subdomain
- TLS
- WAF and bot protection
- Cloudflare Access for private prototype or internal beta access
- R2 object storage for original uploads, converted PDFs, generated DOCX files, and exports
- optional caching for static assets
- optional Pages or Workers hosting later if the frontend build is proven compatible

Cloudflare Workers should not be on the critical path for document conversion because the app needs LibreOffice. Keep conversion in the Node backend on Contabo unless a separate conversion service is introduced.

### Contabo responsibilities

Contabo should host the runtime pieces that need a normal server:

- backend Express API
- Next.js frontend for the first prototype, unless Cloudflare Pages is explicitly chosen after build verification
- LibreOffice document conversion
- background ingestion jobs
- scheduled market-data and filing sync jobs
- health checks and application logs
- local temporary file processing before upload to R2

Use a process manager such as systemd or PM2, or a small Docker Compose setup, but avoid Kubernetes-scale orchestration for the MVP.

### Recommended MVP topology

```text
User browser
  -> Cloudflare DNS/TLS/WAF/Access
  -> Contabo frontend
  -> Contabo backend API
  -> Supabase Auth/Postgres
  -> Cloudflare R2
  -> Model providers
```

Recommended public routes:

- `https://research.<domain>` or `https://invest.<domain>` for the frontend
- `https://research-api.<domain>` or `/api` reverse-proxied to the backend
- private beta protected by Cloudflare Access until product/legal copy is settled

## Environment and configuration plan

Keep configuration explicit and auditable. The MVP should have three environment surfaces:

- Supabase project: Auth settings, Postgres schema, RLS policies, service role key for server processes only.
- Cloudflare account: DNS records, Access application, R2 bucket, R2 API token, optional cache rules.
- Contabo server: Node/Bun runtime, LibreOffice, app env files, process manager, log rotation, deployment directory.

Minimum backend environment variables:

```text
SUPABASE_URL=
SUPABASE_SECRET_KEY=
R2_ENDPOINT_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
DOWNLOAD_SIGNING_SECRET=
FRONTEND_URL=
```

Minimum frontend environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

The current frontend includes server-side Supabase helpers, so `SUPABASE_SECRET_KEY` may be present in the frontend server process environment when hosted on Contabo. It must never be exposed with a `NEXT_PUBLIC_` prefix or sent to the browser.

Market-data provider keys should be added only when Phase 3 starts. Until then, unsupported price, valuation, and fundamentals requests should be refused or answered only from uploaded source documents with clear caveats.

## Deployment sequence for the existing stack

### Step 1: Private prototype

Goal: run the repurposed product privately with minimal new infrastructure.

Tasks:

- create or select a Supabase project
- run the one-shot schema plus the new thesis and journal migrations
- create a Cloudflare R2 bucket for Mike documents and generated outputs
- deploy backend and frontend on Contabo
- install LibreOffice on Contabo and verify DOC/DOCX/PDF conversion
- put Cloudflare in front of the chosen subdomain
- enable Cloudflare Access for the product while it is still pre-release
- configure model-provider keys
- verify upload, conversion, chat, citations, tabular review, generated memo, thesis save, and decision journal save

Exit criteria:

- a logged-in user can complete the full MVP research loop on the live domain
- uploaded files and generated documents land in R2
- application data lands in Supabase
- Cloudflare Access blocks unauthorised traffic
- backend logs are available on Contabo

### Step 2: Internal beta

Goal: make the product usable by a small group without exposing it as a public advisory product.

Tasks:

- add production disclaimer and non-advice copy
- add basic audit logs for memo generation, thesis creation, and decision journal creation
- add health-check endpoints for frontend and backend
- add automated database backup review for Supabase
- add R2 lifecycle and retention rules
- add error monitoring or at least structured server logs
- add a simple deployment runbook
- document rollback steps

Exit criteria:

- beta users can be added or removed through Supabase Auth and Cloudflare Access
- failures in upload, conversion, chat, or generated output are visible in logs
- a deploy can be rolled back without data loss

### Step 3: Public research workspace

Goal: remove private-beta friction while preserving trust boundaries.

Tasks:

- remove Cloudflare Access only after public signup, terms, and disclaimers are ready
- add rate limits at Cloudflare and backend levels
- add per-user storage and message usage limits
- add billing or manual entitlement controls if needed
- add data-source status pages for market-data providers once Phase 3 starts
- add user-facing data freshness indicators

Exit criteria:

- unauthenticated users can sign up through the intended route
- abuse controls exist before public traffic arrives
- financial-data answers show provenance and timestamps where applicable

## Recommended build sequence

### Phase 1: Domain conversion and rebrand

Goal: create a useful investment research prototype quickly.

Tasks:

- replace the legal system prompt with an investing/wealth prompt
- remove contract-specific and legal-drafting instructions
- preserve and adapt evidence/citation rules
- rename UI labels from legal/project/document review language to investment/research language
- seed investing workflows
- keep projects, documents, chat, workflows, and tabular review mostly unchanged
- add appropriate financial education and non-advice disclaimers

Expected result: a credible AI research workspace powered by existing document and workflow capabilities.

### Phase 2: Investment memo and comparison workflows

Goal: make the product useful for actual research decisions.

Tasks:

- add thesis objects
- add decision journal entries
- add investment memo generation
- add prebuilt tabular comparison templates
- add watchlist/research-space concepts
- add simple ticker metadata
- add memo-to-decision linking

Expected result: users can go from documents and research to a structured investment memo and decision record.

### Phase 3: Market and fundamental data layer

Goal: ground the assistant in current and historical financial data.

Tasks:

- add securities master
- add ticker lookup
- add price history ingestion
- add fundamentals ingestion
- add filing/transcript ingestion
- add deterministic LLM tools for financial data
- add charts and metric displays
- add data timestamps and source metadata

Expected result: the assistant can combine user documents with market and fundamental data.

### Phase 4: Portfolio and risk layer

Goal: evolve from research workspace to wealth cockpit.

Tasks:

- add portfolios
- add holdings
- add transactions
- add allocation views
- add concentration analysis
- add performance analytics
- add scenario and stress testing
- add alerts and review cadences
- add tax-lot awareness where data is available

Expected result: the product supports ongoing portfolio intelligence, not just one-off research.

## New financial data layer

The biggest missing piece is market and financial data. Mike currently has strong document intelligence, but not market intelligence.

Recommended new entities:

```sql
create table public.securities (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  exchange text,
  asset_class text not null,
  currency text,
  country text,
  sector text,
  industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(symbol, exchange)
);

create table public.market_prices (
  id uuid primary key default gen_random_uuid(),
  security_id uuid not null references public.securities(id) on delete cascade,
  price_date date not null,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  adjusted_close numeric,
  volume numeric,
  source text,
  created_at timestamptz not null default now(),
  unique(security_id, price_date, source)
);

create table public.fundamental_snapshots (
  id uuid primary key default gen_random_uuid(),
  security_id uuid not null references public.securities(id) on delete cascade,
  period_end date not null,
  period_type text not null,
  revenue numeric,
  gross_profit numeric,
  operating_income numeric,
  net_income numeric,
  free_cash_flow numeric,
  total_assets numeric,
  total_debt numeric,
  cash_and_equivalents numeric,
  shares_outstanding numeric,
  source text,
  created_at timestamptz not null default now(),
  unique(security_id, period_end, period_type, source)
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  base_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  security_id uuid references public.securities(id) on delete set null,
  asset_name text not null,
  asset_class text not null,
  quantity numeric,
  cost_basis numeric,
  market_value numeric,
  currency text,
  as_of_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  security_id uuid references public.securities(id) on delete set null,
  transaction_date date not null,
  action text not null,
  quantity numeric,
  price numeric,
  fees numeric,
  currency text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.investment_theses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  security_id uuid references public.securities(id) on delete set null,
  title text not null,
  thesis_md text not null,
  bull_case_md text,
  base_case_md text,
  bear_case_md text,
  key_risks_md text,
  kill_criteria_md text,
  time_horizon text,
  confidence_score integer check (confidence_score between 1 and 10),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decision_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  security_id uuid references public.securities(id) on delete set null,
  thesis_id uuid references public.investment_theses(id) on delete set null,
  decision_date date not null default current_date,
  action text not null,
  rationale_md text not null,
  valuation_view_md text,
  risks_md text,
  disconfirming_evidence_md text,
  position_sizing_md text,
  review_date date,
  confidence_score integer check (confidence_score between 1 and 10),
  created_at timestamptz not null default now()
);
```

Additional tables to consider later:

- `security_aliases`
- `filings`
- `earnings_transcripts`
- `watchlists`
- `watchlist_items`
- `valuation_models`
- `valuation_scenarios`
- `scenario_assumptions`
- `risk_snapshots`
- `alerts`
- `net_worth_accounts`
- `cash_flows`
- `tax_lots`

## New LLM tools

The assistant should not answer market-data or fundamentals questions from model memory. It should call deterministic backend tools.

Recommended tool layer:

```ts
get_security_profile(ticker: string)
get_price_history(ticker: string, start_date: string, end_date: string)
get_fundamentals(ticker: string, period?: string)
get_filings(ticker: string, form_type?: string, period?: string)
read_filing(filing_id: string)
get_earnings_transcripts(ticker: string, period?: string)
read_earnings_transcript(transcript_id: string)
get_portfolio_holdings(portfolio_id: string)
calculate_portfolio_allocation(portfolio_id: string)
calculate_portfolio_risk(portfolio_id: string)
screen_securities(criteria: Record<string, unknown>)
compare_securities(tickers: string[], metrics: string[])
run_dcf_model(ticker: string, assumptions: Record<string, unknown>)
run_scenario_analysis(asset_id: string, scenarios: Record<string, unknown>[])
create_investment_memo(input: Record<string, unknown>)
log_decision(input: Record<string, unknown>)
```

Tool outputs should always include:

- data source
- timestamp or `as_of` date
- currency
- period
- any known limitations

## New system prompt direction

Replace the current legal prompt with an investing prompt that enforces evidence discipline.

Key behaviour rules:

- Separate facts, assumptions, estimates, model outputs, and opinions.
- Use uploaded documents, filings, transcripts, and market-data tools as primary evidence.
- Never invent prices, financial metrics, holdings, or performance numbers.
- Always show the date or period for financial data.
- Explain uncertainty and sensitivity to assumptions.
- Avoid unsupported personalised financial advice.
- When discussing a specific action, frame output as research support unless the product later has compliant advisory infrastructure.
- Cite documents with exact quotes when making claims about document content.
- Cite market/fundamental data with source, period, and retrieval timestamp.
- Present valuation outputs as assumption-driven scenarios, not certainties.
- Encourage decision journals and review dates for material investment decisions.

Suggested system prompt skeleton:

```text
You are an investment research and wealth-planning assistant. You help users analyse securities, funds, portfolios, private investments, real estate deals, financial documents, valuation, risk, and long-term wealth decisions.

You must distinguish facts, assumptions, estimates, model outputs, and opinions. Never fabricate financial data, prices, holdings, performance, filings, or document content. Use available tools for market data, portfolio data, filings, transcripts, and uploaded documents. When data is stale, incomplete, or unavailable, say so clearly.

When making claims about uploaded documents, cite exact source text. When making claims about market or fundamental data, include the source and as-of date. When producing valuation or scenario analysis, explicitly list assumptions and sensitivity to those assumptions.

You are not a substitute for a licensed financial, tax, or legal adviser. Provide educational research support and decision frameworks. Do not guarantee returns or present uncertain outcomes as facts.
```

## Portfolio analytics roadmap

Start simple, then add complexity.

### Initial analytics

- holdings by asset
- allocation by asset class
- allocation by sector
- allocation by geography
- allocation by currency
- top holdings concentration
- cash percentage
- realized/unrealized gain where cost basis exists
- simple portfolio return
- benchmark comparison if benchmark is configured

### Intermediate analytics

- drawdown
- volatility
- beta
- correlation matrix
- factor exposure
- dividend/income projection
- rebalancing drift
- liquidity buckets
- tax-lot view
- position overlap across ETFs/funds

### Advanced analytics

- Monte Carlo retirement projections
- stress testing
- inflation/rate shock scenarios
- recession scenario
- AI-bubble unwind scenario
- currency shock scenario
- private-asset liquidity scenario
- tax-aware rebalancing
- withdrawal sequencing

## Decision journal

A decision journal is a high-value differentiator because it makes the product about process improvement, not just information retrieval.

Every material investment decision should support:

- date
- asset/security/deal
- action: buy, sell, trim, add, hold, avoid, watch
- thesis
- variant perception
- valuation view
- expected return range
- time horizon
- key risks
- disconfirming evidence
- kill criteria
- position sizing rationale
- confidence score
- review date
- follow-up outcome

Future assistant behaviour:

- remind the user when a review date is reached
- compare new evidence with the original thesis
- identify thesis drift
- flag when kill criteria may have been triggered
- summarize what the user got right or wrong over time

Example assistant follow-up:

> Your original thesis was margin expansion and AI-driven revenue acceleration. Since then, revenue beat expectations, but margins compressed and capex increased. The thesis is partially intact but the FCF component has weakened. Do you want to revise, hold, reduce, or move this to watch-only?

## Domain-specific tabular templates

### Public equity template

- Business description
- Revenue growth
- Gross margin
- Operating margin
- Free-cash-flow margin
- Net cash/debt
- Valuation multiple
- Management quality
- Moat
- Customer concentration
- Geographic exposure
- Regulatory risk
- Bull case
- Base case
- Bear case
- Catalysts
- Kill criteria

### ETF/fund template

- Expense ratio
- AUM
- Liquidity
- Holdings concentration
- Sector exposure
- Geographic exposure
- Turnover
- Historical drawdown
- Dividend yield
- Tax efficiency
- Overlap with existing portfolio
- Key risks

### Real estate deal template

- Purchase price
- NOI
- Cap rate
- Occupancy
- Debt terms
- DSCR
- Rent growth assumption
- Exit cap assumption
- Sponsor track record
- Market risk
- Sensitivity downside
- Liquidity constraints
- Key legal/structural risks

### Private company template

- Business model
- Revenue quality
- Gross margin
- Burn rate
- Runway
- Customer concentration
- TAM claim quality
- Competitive landscape
- Founder/team quality
- Cap table issues
- Liquidation preference
- Exit path
- Key risks

### Personal wealth review template

- Net worth
- Cash runway
- Asset allocation
- Concentration risk
- Debt/liabilities
- Insurance gaps
- Tax issues
- Estate planning gaps
- Retirement trajectory
- Action items

## Frontend changes

The frontend can retain much of its structure but should introduce investment-specific screens.

Recommended screens:

- Dashboard: net worth, allocation, watchlist, alerts, recent decisions
- Portfolio page: holdings, risk, performance, allocation, linked theses
- Asset page: price chart, fundamentals, filings, documents, thesis, notes
- Research workspace: documents, chat, comparison tables, memos
- Investment memo builder
- Decision journal
- Watchlists
- Scenario lab
- Alerts and review dates
- Data source settings
- Compliance/disclaimer settings

Label changes:

- Projects -> Workspaces, Portfolios, or Research Spaces
- Documents -> Research Documents or Source Documents
- Tabular Review -> Comparison Matrix or Research Matrix
- Workflows -> Playbooks
- Chats -> Research Chats
- Generated Documents -> Memos/Reports

## Backend route additions

Existing route groups can remain. Add investment route groups alongside them:

```ts
app.use('/securities', securitiesRouter);
app.use('/market-data', marketDataRouter);
app.use('/filings', filingsRouter);
app.use('/portfolios', portfoliosRouter);
app.use('/holdings', holdingsRouter);
app.use('/transactions', transactionsRouter);
app.use('/watchlists', watchlistsRouter);
app.use('/theses', thesesRouter);
app.use('/valuations', valuationsRouter);
app.use('/risk', riskRouter);
app.use('/alerts', alertsRouter);
app.use('/journal', decisionJournalRouter);
```

For the first Contabo-hosted MVP, these routes should remain in the existing Express backend. A later Cloudflare Worker API layer may be useful for lightweight public endpoints, but the core authenticated application API should stay close to the Supabase service role key, document conversion pipeline, and scheduled jobs.

## Data-source considerations

Potential data sources, subject to licensing, budget, and reliability:

- SEC EDGAR for US filings
- company investor-relations pages for reports and decks
- market-data vendors for prices and fundamentals
- FRED for macro data
- exchange or broker integrations where appropriate
- user-uploaded statements for portfolio reconstruction
- manual CSV imports for holdings and transactions

Important implementation rule: store source metadata and timestamps on every imported data point.

### Data source rollout with the current stack

Phase 1 should not require a market-data vendor. It should work from uploaded source documents and user-entered thesis or journal data.

Phase 3 can add provider-specific ingestion jobs on Contabo:

- scheduled price-history import
- scheduled fundamentals import
- SEC filing metadata import
- transcript or investor-presentation import where licensing allows
- portfolio CSV import

Each ingestion job should write normalised rows to Supabase and store raw source payloads or generated artefacts in R2 when retention is allowed. All assistant tools that read this data must return source, period, currency, and retrieval timestamp.

## Compliance and trust boundaries

This product should initially operate as research and education software, not as a registered advisory platform.

Important boundaries:

- Do not guarantee returns.
- Do not present model outputs as certainties.
- Do not fabricate performance or valuation metrics.
- Do not provide personalised buy/sell instructions without appropriate compliance infrastructure.
- Distinguish general research from personalised advice.
- Log sources and assumptions.
- Show timestamps and data provenance.
- Require user confirmation before logging major decisions.

Trust UX requirements:

- show source links or document citations
- show data freshness
- show assumptions
- show scenario ranges
- show confidence and uncertainty
- make it easy to inspect the evidence behind a conclusion

## MVP specification

### MVP name

AI Investment Research Workspace

### MVP user story

A user creates a research workspace, uploads source documents, asks cited questions, runs investment workflows, compares opportunities in a matrix, generates an investment memo, and logs a decision.

### MVP features

- create research workspace
- upload PDFs, DOCX, and DOC files
- ask questions against source documents
- run prebuilt investing workflows
- build comparison matrices
- generate investment memos
- create thesis entries
- create decision journal entries
- share workspace with another user

### MVP non-goals

- real-time trading
- brokerage execution
- guaranteed recommendations
- fully automated portfolio management
- complex tax optimisation
- real-time market-data dependence

### MVP success criteria

- user can complete a full investment research loop from source documents to memo
- assistant responses cite document evidence where applicable
- comparison matrix produces useful structured outputs
- generated memo has coherent bull/base/bear framing and risk discussion
- user can save a thesis and decision journal entry
- no market-data hallucination occurs because unsupported data requests are refused or routed to deterministic tools

## Implementation checklist

### Infrastructure checklist

- [ ] Choose the product subdomain.
- [ ] Create or select the Supabase project.
- [ ] Create the Cloudflare R2 bucket.
- [ ] Create a least-privilege R2 API token for the backend.
- [ ] Configure Cloudflare DNS for frontend and backend routes.
- [ ] Configure Cloudflare Access for private prototype access.
- [ ] Provision the Contabo deployment directory.
- [ ] Install Node/Bun and LibreOffice on Contabo.
- [ ] Configure backend and frontend env files on Contabo.
- [ ] Configure systemd, PM2, or Docker Compose process management.
- [ ] Configure log rotation and a basic health-check URL.
- [ ] Document deployment and rollback commands.

### Immediate code changes

- [x] Add new investing system prompt.
- [ ] Rename legal-facing labels in the frontend.
- [x] Seed investing workflows.
- [x] Seed investing tabular templates.
- [x] Add thesis table migration.
- [x] Add decision journal table migration.
- [x] Add backend routes for theses and journal entries.
- [x] Add frontend pages/components for theses and journal.
- [x] Add investment memo DOCX workflow.
- [x] Add compliance/disclaimer copy.
- [ ] Add upload/conversion smoke test against the Contabo plus R2 setup.
- [ ] Add live-domain smoke test covering login, workspace creation, upload, chat, tabular review, memo generation, thesis save, and journal save.

### Next layer

- [x] Add securities table.
- [ ] Add ticker lookup.
- [ ] Add market-data ingestion abstraction.
- [ ] Add basic price chart.
- [ ] Add fundamentals table.
- [ ] Add financial-data LLM tools.
- [ ] Add data provenance metadata.

### Portfolio layer

- [x] Add portfolios table.
- [x] Add holdings table.
- [x] Add transactions table.
- [ ] Add CSV import.
- [ ] Add allocation dashboard.
- [ ] Add concentration analysis.
- [ ] Add portfolio review workflow.

## Highest-leverage reusable components

Ranked by usefulness for the pivot:

1. Document upload, storage, extraction, display, and versioning
2. Project/workspace model
3. Chat with document context
4. Workflow system
5. Tabular review/extraction engine
6. DOCX/report generation
7. Supabase auth/profile model
8. Sharing/collaboration
9. Model-provider abstraction
10. R2/S3 storage and download pipeline

## Main risks

### Financial-data correctness

Market prices, fundamentals, holdings, and performance must come from tools and databases, not model memory.

### Regulatory/compliance scope

The product should start as research, education, and decision-support software. Personalized financial advice requires careful legal and regulatory review.

### Data licensing

Prices, fundamentals, analyst reports, and transcripts may have usage and redistribution restrictions.

### Trust

Investing users will not tolerate opaque answers. The product must show sources, timestamps, assumptions, and uncertainty.

### Scope creep

Wealth creation can mean investing, budgeting, taxes, retirement, real estate, business ownership, estate planning, and more. Start with investment research plus portfolio intelligence.

## Recommended first milestone

Build the AI Investment Research Workspace first.

The first release should let a user:

1. create a research workspace;
2. upload filings, transcripts, decks, PDFs, or reports;
3. ask cited questions;
4. run a company/deal analysis workflow;
5. produce a comparison matrix;
6. generate an investment memo;
7. save a thesis;
8. log a decision.

This uses the strongest existing parts of Mike and postpones the hardest new dependencies, especially real-time financial data and brokerage integration.

## Strategic conclusion

Mike already has the skeleton of a serious investment research and wealth-intelligence product. The fastest path is to treat the current legal assistant as one domain implementation and replace it with an investing domain layer.

The durable product should not be a chatbot. It should be a system of record for investment reasoning: source documents, market data, assumptions, theses, decisions, memos, portfolio exposures, and review loops.
