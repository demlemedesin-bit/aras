-- Anahtar kelime sıralama takibi (elle girilir). Yalnızca service role okur/yazar.
create table if not exists public.site_seo_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  page text not null default '/',
  position int,
  prev_position int,
  volume int,
  note text,
  updated_at timestamptz not null default now()
);
alter table public.site_seo_keywords enable row level security;
