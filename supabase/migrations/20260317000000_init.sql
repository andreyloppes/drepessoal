-- Schema para DRE Pessoal — persistência no Supabase
-- Copie e rode no SQL Editor do Supabase

-- Tabela de transações
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  date timestamptz not null,
  recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  is_credit_card boolean default false,
  created_at timestamptz default now()
);

-- Tabela de metas
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline timestamptz not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  category text not null check (category in ('emergency', 'investment', 'purchase', 'debt', 'other')),
  created_at timestamptz default now()
);

-- Tabela de orçamentos por categoria
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  category text not null unique,
  "limit" numeric not null,
  created_at timestamptz default now()
);

-- Tabela de configurações do usuário
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

-- Inserir configurações padrão
insert into settings (key, value) values
  ('initial_balance', '0'),
  ('credit_card_due_day', '10'),
  ('monthly_cost', '4500'),
  ('emergency_months', '6'),
  ('current_savings', '4500')
on conflict (key) do nothing;
