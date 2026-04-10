create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_members (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  invited_by_user_id uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  unique (wallet_id, user_id)
);

create table if not exists public.wallet_invites (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  invited_email text not null,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete cascade,
  name text not null,
  kind text not null default 'cash',
  mask text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#dce9ff',
  kind text not null default 'expense' check (kind in ('expense', 'income', 'saving')),
  group_name text not null default 'General',
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  title text not null,
  amount numeric(14, 2) not null,
  type text not null check (type in ('income', 'expense')),
  notes text,
  source text not null default 'manual',
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_attachments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_extraction_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  raw_input text,
  draft_payload jsonb not null,
  confidence numeric(4, 3),
  created_at timestamptz not null default now()
);

alter table public.accounts add column if not exists wallet_id uuid references public.wallets(id) on delete cascade;
alter table public.categories add column if not exists wallet_id uuid references public.wallets(id) on delete cascade;
alter table public.categories add column if not exists kind text not null default 'expense';
alter table public.categories add column if not exists group_name text not null default 'General';
alter table public.categories add column if not exists sort_order integer not null default 100;
alter table public.transactions add column if not exists wallet_id uuid references public.wallets(id) on delete cascade;

create unique index if not exists accounts_wallet_name_idx on public.accounts(wallet_id, name);
create unique index if not exists categories_wallet_name_idx on public.categories(wallet_id, name);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_members enable row level security;
alter table public.wallet_invites enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_attachments enable row level security;
alter table public.ai_extraction_logs enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "wallets visible to members" on public.wallets;
drop policy if exists "wallet members visible to members" on public.wallet_members;
drop policy if exists "wallet invites visible to related users" on public.wallet_invites;
drop policy if exists "accounts own rows" on public.accounts;
drop policy if exists "categories own rows" on public.categories;
drop policy if exists "transactions own rows" on public.transactions;
drop policy if exists "attachments own rows" on public.transaction_attachments;
drop policy if exists "ai logs own rows" on public.ai_extraction_logs;

create policy "profiles own rows"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "wallets visible to members"
on public.wallets for all
using (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = wallets.id
      and wm.user_id = auth.uid()
  )
)
with check (
  owner_user_id = auth.uid()
  or exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = wallets.id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
);

create policy "wallet members visible to members"
on public.wallet_members for all
using (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = wallet_members.wallet_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = wallet_members.wallet_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
);

create policy "wallet invites visible to related users"
on public.wallet_invites for all
using (
  invited_by_user_id = auth.uid()
  or lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  invited_by_user_id = auth.uid()
);

create policy "accounts own rows"
on public.accounts for all
using (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = accounts.wallet_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = accounts.wallet_id
      and wm.user_id = auth.uid()
  )
);

create policy "categories own rows"
on public.categories for all
using (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = categories.wallet_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = categories.wallet_id
      and wm.user_id = auth.uid()
  )
);

create policy "transactions own rows"
on public.transactions for all
using (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = transactions.wallet_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wallet_members wm
    where wm.wallet_id = transactions.wallet_id
      and wm.user_id = auth.uid()
  )
);

create policy "attachments own rows"
on public.transaction_attachments for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ai logs own rows"
on public.ai_extraction_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
