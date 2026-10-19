-- Gelişmiş analitik: oturum, tekrar eden ziyaretçi (yalnızca onayla), kampanya ve cihaz ayrıntıları.
alter table public.site_views add column if not exists sid text;
alter table public.site_views add column if not exists uid text;
alter table public.site_views add column if not exists meta jsonb not null default '{}'::jsonb;
create index if not exists site_views_sid_idx on public.site_views (sid, ts);
create index if not exists site_views_uid_idx on public.site_views (uid, ts) where uid is not null;
