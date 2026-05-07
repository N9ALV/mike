-- Mike one-shot Supabase schema
-- Based on supabase-migration.sql plus the later backend/migrations/*.sql files.
-- Use this for a fresh Supabase database. Existing deployments should continue
-- to apply the incremental migration files instead.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- User profiles
-- ---------------------------------------------------------------------------

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  organisation text,
  tier text not null default 'Free',
  message_credits_used integer not null default 0,
  credits_reset_date timestamptz not null default (now() + interval '30 days'),
  tabular_model text not null default 'gemini-3-flash-preview',
  claude_api_key text,
  gemini_api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_user
  on public.user_profiles(user_id);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
exception when others then
  -- Never block signup if the profile insert fails.
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Projects and documents
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  cm_number text,
  visibility text not null default 'private',
  shared_with jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user
  on public.projects(user_id);

create index if not exists projects_shared_with_idx
  on public.projects using gin (shared_with);

create table if not exists public.project_subfolders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id text not null,
  name text not null,
  parent_folder_id uuid references public.project_subfolders(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_subfolders_project
  on public.project_subfolders(project_id);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id text not null,
  filename text not null,
  file_type text,
  size_bytes integer not null default 0,
  page_count integer,
  structure_tree jsonb,
  status text not null default 'pending',
  folder_id uuid references public.project_subfolders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documents_user_project
  on public.documents(user_id, project_id);

create index if not exists idx_documents_project_folder
  on public.documents(project_id, folder_id);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null,
  pdf_storage_path text,
  source text not null default 'upload',
  version_number integer,
  display_name text,
  created_at timestamptz not null default now(),
  constraint document_versions_source_check
    check (source = any (array[
      'upload'::text,
      'user_upload'::text,
      'assistant_edit'::text,
      'user_accept'::text,
      'user_reject'::text,
      'generated'::text
    ]))
);

create index if not exists document_versions_document_id_idx
  on public.document_versions(document_id, created_at desc);

create index if not exists document_versions_doc_vnum_idx
  on public.document_versions(document_id, version_number);

alter table public.documents
  add column if not exists current_version_id uuid
  references public.document_versions(id) on delete set null;

create table if not exists public.document_edits (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chat_message_id uuid,
  version_id uuid not null references public.document_versions(id) on delete cascade,
  change_id text not null,
  del_w_id text,
  ins_w_id text,
  deleted_text text not null default '',
  inserted_text text not null default '',
  context_before text,
  context_after text,
  status text not null default 'pending'
    check (status = any (array[
      'pending'::text,
      'accepted'::text,
      'rejected'::text
    ])),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists document_edits_document_id_idx
  on public.document_edits(document_id, created_at desc);

create index if not exists document_edits_message_id_idx
  on public.document_edits(chat_message_id);

create index if not exists document_edits_version_id_idx
  on public.document_edits(version_id);

-- ---------------------------------------------------------------------------
-- Workflows
-- ---------------------------------------------------------------------------

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  title text not null,
  type text not null,
  prompt_md text,
  columns_config jsonb,
  practice text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_workflows_user
  on public.workflows(user_id);

create table if not exists public.hidden_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  workflow_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, workflow_id)
);

create index if not exists idx_hidden_workflows_user
  on public.hidden_workflows(user_id);

create table if not exists public.workflow_shares (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  shared_by_user_id text not null,
  shared_with_email text not null,
  allow_edit boolean not null default false,
  created_at timestamptz not null default now(),
  constraint workflow_shares_workflow_email_unique
    unique(workflow_id, shared_with_email)
);

create index if not exists workflow_shares_workflow_id_idx
  on public.workflow_shares(workflow_id);

create index if not exists workflow_shares_email_idx
  on public.workflow_shares(shared_with_email);

-- ---------------------------------------------------------------------------
-- Assistant chats
-- ---------------------------------------------------------------------------

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id text not null,
  title text,
  created_at timestamptz not null default now()
);

create index if not exists idx_chats_user
  on public.chats(user_id);

create index if not exists idx_chats_project
  on public.chats(project_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null,
  content jsonb,
  files jsonb,
  annotations jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_chat
  on public.chat_messages(chat_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'document_edits_chat_message_id_fkey'
      and conrelid = 'public.document_edits'::regclass
  ) then
    alter table public.document_edits
      add constraint document_edits_chat_message_id_fkey
      foreign key (chat_message_id)
      references public.chat_messages(id)
      on delete set null;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tabular reviews
-- ---------------------------------------------------------------------------

create table if not exists public.tabular_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id text not null,
  title text,
  columns_config jsonb,
  workflow_id uuid references public.workflows(id) on delete set null,
  practice text,
  shared_with jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tabular_reviews_user
  on public.tabular_reviews(user_id);

create index if not exists idx_tabular_reviews_project
  on public.tabular_reviews(project_id);

create index if not exists tabular_reviews_shared_with_idx
  on public.tabular_reviews using gin (shared_with);

create table if not exists public.tabular_cells (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.tabular_reviews(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  column_index integer not null,
  content text,
  citations jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_tabular_cells_review
  on public.tabular_cells(review_id, document_id, column_index);

create table if not exists public.tabular_review_chats (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.tabular_reviews(id) on delete cascade,
  user_id text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tabular_review_chats_review_idx
  on public.tabular_review_chats(review_id, updated_at desc);

create index if not exists tabular_review_chats_user_idx
  on public.tabular_review_chats(user_id);

create table if not exists public.tabular_review_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.tabular_review_chats(id) on delete cascade,
  role text not null,
  content jsonb,
  annotations jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tabular_review_chat_messages_chat_idx
  on public.tabular_review_chat_messages(chat_id, created_at);

-- ---------------------------------------------------------------------------
-- Investment research domain
-- ---------------------------------------------------------------------------

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
