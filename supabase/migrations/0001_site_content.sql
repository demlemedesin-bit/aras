-- Aras Metal site içeriği. Okuma herkese açık, yazma yalnızca service role (panel).
create table if not exists site_texts (
  ns text not null,            -- t | ui | auth | meta
  key text not null,
  value jsonb not null default '{}'::jsonb,  -- {"tr":"..","en":".."}
  primary key (ns, key)
);
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);
create table if not exists site_collections (
  id text primary key, world text not null check (world in ('home','garden')),
  href text not null, title_key text not null, desc_key text not null,
  count int not null default 0, img text not null, pos text,
  subs text[] not null default '{}', sort int not null default 0, active boolean not null default true
);
create table if not exists site_products (
  id text primary key, code text not null, name_key text not null, cat_key text not null,
  world text not null check (world in ('home','garden')), img text not null, href text not null,
  sort int not null default 0, active boolean not null default true
);
create table if not exists site_gallery_groups (
  id text primary key, label_key text not null, sort int not null default 0, active boolean not null default true
);
create table if not exists site_gallery_images (
  id bigint generated always as identity primary key,
  group_id text not null references site_gallery_groups(id) on delete cascade,
  src text not null, alt jsonb not null default '{}'::jsonb,
  sort int not null default 0, active boolean not null default true
);
create table if not exists site_news (
  id bigint generated always as identity primary key,
  href text not null, date_key text, year text, head_key text not null, badge_key text,
  award boolean not null default false, sort int not null default 0, active boolean not null default true
);
create table if not exists site_partners (
  id bigint generated always as identity primary key,
  name text not null, href text not null, img text not null,
  sort int not null default 0, active boolean not null default true
);
create table if not exists submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 200),
  company text check (char_length(company) <= 200),
  topic text check (char_length(topic) <= 100),
  message text not null check (char_length(message) between 1 and 5000),
  lang text, status text not null default 'new'
);
create table if not exists dealers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company text, approved boolean not null default false, created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['site_texts','site_settings','site_collections','site_products','site_gallery_groups','site_gallery_images','site_news','site_partners'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

alter table submissions enable row level security;
create policy "anyone can submit" on submissions for insert to anon, authenticated with check (status = 'new');
alter table dealers enable row level security;
create policy "own dealer row" on dealers for select to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('site-media','site-media', true) on conflict (id) do nothing;
create policy "site-media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
