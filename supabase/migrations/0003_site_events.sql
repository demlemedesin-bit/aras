-- Etkileşim olayları (katalog, telefon, bölüm görüntüleme) + veri temizliği.
alter table public.site_views add column if not exists kind text not null default 'view';
alter table public.site_views add column if not exists name text;
create index if not exists site_views_kind_ts_idx on public.site_views (kind, ts desc);

create or replace function public.site_analytics(p_days int default 14)
returns jsonb
language sql
stable
set search_path = public
as $$
  with cur as (
    select * from site_views where kind = 'view' and ts >= now() - make_interval(days => p_days)
  ), prev as (
    select * from site_views
    where kind = 'view' and ts >= now() - make_interval(days => p_days * 2) and ts < now() - make_interval(days => p_days)
  ), ev as (
    select * from site_views where kind in ('event', 'section') and ts >= now() - make_interval(days => p_days)
  ), days as (
    select d::date as day from generate_series(
      (now() at time zone 'Europe/Istanbul')::date - (p_days - 1),
      (now() at time zone 'Europe/Istanbul')::date, interval '1 day') d
  ), daily as (
    select days.day,
           count(distinct c.vid) as visitors,
           count(c.id) as views
    from days
    left join cur c on (c.ts at time zone 'Europe/Istanbul')::date = days.day
    group by days.day order by days.day
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'visitors', (select count(distinct vid) from cur),
      'views', (select count(*) from cur),
      'today_visitors', (select count(distinct vid) from cur where (ts at time zone 'Europe/Istanbul')::date = (now() at time zone 'Europe/Istanbul')::date),
      'today_views', (select count(*) from cur where (ts at time zone 'Europe/Istanbul')::date = (now() at time zone 'Europe/Istanbul')::date)
    ),
    'prev', jsonb_build_object('visitors', (select count(distinct vid) from prev), 'views', (select count(*) from prev)),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'visitors', visitors, 'views', views) order by day), '[]') from daily),
    'pages', (select coalesce(jsonb_agg(x), '[]') from (select path, count(*) views, count(distinct vid) visitors from cur group by path order by count(*) desc limit 8) x),
    'referrers', (select coalesce(jsonb_agg(x), '[]') from (select coalesce(nullif(referrer, ''), 'Doğrudan') ref, count(distinct vid) visitors from cur group by 1 order by 2 desc limit 8) x),
    'countries', (select coalesce(jsonb_agg(x), '[]') from (select coalesce(nullif(country, ''), '—') country, count(distinct vid) visitors from cur group by 1 order by 2 desc limit 8) x),
    'devices', (select coalesce(jsonb_agg(x), '[]') from (select coalesce(device, 'desktop') device, count(distinct vid) visitors from cur group by 1 order by 2 desc) x),
    'langs', (select coalesce(jsonb_agg(x), '[]') from (select coalesce(lang, '—') lang, count(distinct vid) visitors from cur group by 1 order by 2 desc) x),
    'events', (select coalesce(jsonb_agg(x), '[]') from (select name, count(*) total, count(distinct vid) visitors from ev where kind = 'event' group by name order by count(*) desc) x),
    'sections', (select coalesce(jsonb_agg(x), '[]') from (select name, count(distinct vid) visitors from ev where kind = 'section' group by name) x)
  );
$$;
revoke all on function public.site_analytics(int) from public, anon, authenticated;
grant execute on function public.site_analytics(int) to service_role;

create or replace function public.site_views_cleanup()
returns void language sql set search_path = public as $$
  delete from site_views where ts < now() - interval '400 days';
$$;
revoke all on function public.site_views_cleanup() from public, anon, authenticated;
grant execute on function public.site_views_cleanup() to service_role;
