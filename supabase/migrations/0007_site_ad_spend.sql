-- Reklam harcaması (kampanya başına toplam). Yalnızca service role okur/yazar.
create table if not exists public.site_ad_spend (
  campaign text primary key,
  amount numeric not null default 0,
  currency text not null default 'TRY',
  note text,
  updated_at timestamptz not null default now()
);
alter table public.site_ad_spend enable row level security;
