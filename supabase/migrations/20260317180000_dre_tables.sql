-- Tabelas para o DRE Pessoal app (separadas das tabelas antigas)

create table if not exists dre_transactions (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  type text not null,
  category text not null,
  date timestamptz not null,
  recurring boolean default false,
  recurring_frequency text,
  is_credit_card boolean default false,
  created_at timestamptz default now()
);

create table if not exists dre_goals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline timestamptz not null,
  priority text not null,
  category text not null,
  created_at timestamptz default now()
);

create table if not exists dre_budgets (
  id uuid default gen_random_uuid() primary key,
  category text not null unique,
  budget_limit numeric not null,
  created_at timestamptz default now()
);

create table if not exists dre_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

insert into dre_settings (key, value) values
  ('initial_balance', '0'),
  ('credit_card_due_day', '10'),
  ('monthly_cost', '4500'),
  ('emergency_months', '6'),
  ('current_savings', '4500')
on conflict (key) do nothing;
