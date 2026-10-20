-- Teklif takibi ve fiyat/stok (servis anahtarı ile yazılır, yalnızca onaylı bayiye sunucuda okunur).
alter table public.submissions
  add column if not exists stage text not null default 'new',
  add column if not exists quote_amount numeric,
  add column if not exists quote_currency text not null default 'TRY',
  add column if not exists internal_note text,
  add column if not exists items jsonb,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.site_prices (
  product_id text primary key,
  price numeric,
  currency text not null default 'TRY',
  unit text not null default 'adet',
  stock text not null default 'in',
  min_qty integer,
  note text,
  updated_at timestamptz not null default now()
);
alter table public.site_prices enable row level security; -- politika yok: yalnızca servis anahtarı erişir
