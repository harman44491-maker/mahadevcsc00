# Mahadev Computer Service Center — Website

Static front-end (HTML/CSS/JS) for a computer & electronics service business,
with **Supabase** as the backend for authentication, database, file storage and realtime chat.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, all service cards, how-it-works |
| `services.html` | Full services catalogue |
| `service-detail.html` | Per-service page + booking form |
| `register.html` | Customer registration |
| `login.html` | Customer login + password reset |
| `dashboard.html` | Customer dashboard — requests, new request, profile |
| `chat.html` | Live chat with document upload |
| `admin-login.html` | Admin login |
| `admin-dashboard.html` | Admin: service requests, stats, chat replies |

## Setup (10 minutes)

### 1. Create a Supabase project
Sign up at supabase.com → **New project**.

### 2. Run this SQL in the Supabase SQL Editor

```sql
-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text, address text,
  role text not null default 'customer',
  created_at timestamptz default now()
);

-- service requests
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  customer_name text, customer_email text, customer_phone text,
  service_id text, service_name text,
  issue text, preferred_date date, address text,
  status text not null default 'new',
  admin_note text,
  created_at timestamptz default now()
);

-- chat messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  sender_id uuid, sender_role text,
  body text, file_url text, file_name text,
  created_at timestamptz default now()
);

-- helper
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- RLS
alter table profiles enable row level security;
alter table service_requests enable row level security;
alter table messages enable row level security;

create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin reads profiles" on profiles for select using (is_admin());

create policy "own requests" on service_requests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admin requests" on service_requests for all using (is_admin());

create policy "own messages" on messages for all
  using (auth.uid() = user_id or auth.uid() = sender_id) with check (auth.uid() = sender_id);
create policy "admin messages" on messages for all using (is_admin());

-- realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table service_requests;
