-- Investing and wealth-research domain tables.
-- Apply this to existing Supabase projects that already used 000_one_shot_schema.sql.

create extension if not exists "pgcrypto";

create table if not exists public.securities (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  exchange text,
  asset_class text not null default 'equity',
  currency text,
  country text,
  sector text,
  industry text,
  data_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(symbol, exchange)
);

create index if not exists securities_symbol_idx
  on public.securities(symbol);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  base_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_user_idx
  on public.portfolios(user_id);

create index if not exists portfolios_project_idx
  on public.portfolios(project_id);

create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  security_id uuid references public.securities(id) on delete set null,
  asset_name text not null,
  asset_class text not null default 'unknown',
  quantity numeric,
  cost_basis numeric,
  market_value numeric,
  currency text,
  as_of_date date,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_holdings_portfolio_idx
  on public.portfolio_holdings(portfolio_id);

create table if not exists public.portfolio_transactions (
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
  source text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_transactions_portfolio_idx
  on public.portfolio_transactions(portfolio_id, transaction_date desc);

create table if not exists public.investment_theses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  security_id uuid references public.securities(id) on delete set null,
  title text not null,
  asset_name text,
  thesis_md text not null,
  bull_case_md text,
  base_case_md text,
  bear_case_md text,
  key_risks_md text,
  kill_criteria_md text,
  time_horizon text,
  confidence_score integer check (confidence_score between 1 and 10),
  status text not null default 'active',
  review_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists investment_theses_user_idx
  on public.investment_theses(user_id, created_at desc);

create index if not exists investment_theses_project_idx
  on public.investment_theses(project_id);

create index if not exists investment_theses_review_date_idx
  on public.investment_theses(review_date)
  where review_date is not null;

create table if not exists public.decision_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id uuid references public.projects(id) on delete set null,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  security_id uuid references public.securities(id) on delete set null,
  thesis_id uuid references public.investment_theses(id) on delete set null,
  decision_date date not null default current_date,
  asset_name text,
  action text not null,
  rationale_md text not null,
  valuation_view_md text,
  risks_md text,
  disconfirming_evidence_md text,
  position_sizing_md text,
  review_date date,
  confidence_score integer check (confidence_score between 1 and 10),
  outcome_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decision_journal_entries_user_idx
  on public.decision_journal_entries(user_id, decision_date desc);

create index if not exists decision_journal_entries_project_idx
  on public.decision_journal_entries(project_id);

create index if not exists decision_journal_entries_thesis_idx
  on public.decision_journal_entries(thesis_id);

create index if not exists decision_journal_entries_review_date_idx
  on public.decision_journal_entries(review_date)
  where review_date is not null;
