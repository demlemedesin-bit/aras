-- Tarihçe (yıl yıl gelişmeler). Çok dilli alanlar jsonb: {"tr":"..","en":".."}.
create table if not exists public.site_history (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  img text,
  sort int not null default 0,
  active boolean not null default true
);
alter table public.site_history enable row level security;
drop policy if exists "public read" on public.site_history;
create policy "public read" on public.site_history for select to anon, authenticated using (true);

-- Mevcut kısa tarihçe metinlerini (tl.1..3) başlangıç içeriği olarak taşı.
insert into public.site_history (year, title, sort)
select coalesce(s.value->>'tr', ''), coalesce(h.value, '{}'::jsonb), n.i
from (values (1),(2),(3)) as n(i)
join public.site_texts s on s.ns = 't' and s.key = 'tl.' || n.i || 's'
join public.site_texts h on h.ns = 't' and h.key = 'tl.' || n.i || 'h'
where not exists (select 1 from public.site_history);
