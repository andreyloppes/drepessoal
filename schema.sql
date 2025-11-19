-- Create Transactions Table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  amount numeric not null,
  description text not null,
  date timestamp with time zone not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  payment_method text not null check (payment_method in ('debit', 'credit')),
  installments numeric default 1,
  is_recurring boolean default false,
  recurrence_day numeric
);

-- Create Emergency Fund Table
create table emergency_fund (
  id uuid default gen_random_uuid() primary key,
  current_amount numeric default 0,
  goal_amount numeric default 10000,
  monthly_contribution numeric default 0
);

-- Insert initial row for emergency fund if empty
insert into emergency_fund (current_amount, goal_amount)
select 0, 10000
where not exists (select 1 from emergency_fund);

-- Enable Row Level Security (RLS) but allow public access for this personal app
-- (Ideally we would use Auth, but for simplicity we open it for now)
alter table transactions enable row level security;
create policy "Public access for transactions" on transactions for all using (true);

alter table emergency_fund enable row level security;
create policy "Public access for emergency_fund" on emergency_fund for all using (true);
