-- Aras Metal yönetim paneli şeması (aras Supabase projesi, web sitesi tablolarının yanında)
create extension if not exists pgcrypto;

-- ===== Kullanıcılar =====
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, role text not null default 'member' check (role in ('admin','manager','member','muhasebe')),
  department text, phone text, avatar_url text, created_at timestamptz default now()
);
create table if not exists pending_invites (
  email text primary key, full_name text, role text default 'member', department text, invited_at timestamptz default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager')) $$;
create or replace function public.has_role(r text[]) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = any(r)) $$;

-- Yeni kullanıcı: davet varsa onun rolü; hiç yönetici yoksa ilk kullanıcı yönetici olur.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare inv pending_invites%rowtype; r text;
begin
  select * into inv from pending_invites where lower(email) = lower(new.email);
  r := coalesce(inv.role, case when exists (select 1 from profiles where role = 'admin') then 'member' else 'admin' end);
  insert into profiles (id, full_name, role, department)
  values (new.id, coalesce(inv.full_name, new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), r, inv.department)
  on conflict (id) do nothing;
  delete from pending_invites where lower(email) = lower(new.email);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Rol yükseltmeyi yalnızca yönetici (ya da service role) yapabilir.
create or replace function public.guard_profile_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Rol değiştirme yetkiniz yok';
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_role on profiles;
create trigger guard_profile_role before update on profiles for each row execute function public.guard_profile_role();

-- ===== İş =====
create table if not exists clients (
  id uuid primary key default gen_random_uuid(), name text not null, brand_name text, email text, phone text, company text,
  status text default 'active', notes text, created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(), name text not null, client_id uuid references clients(id) on delete set null,
  status text default 'active', progress int default 0, priority text default 'normal', budget numeric, deadline date, description text,
  created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists project_stages (
  id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, name text, order_index int default 0, status text default 'pending', created_at timestamptz default now()
);
create table if not exists project_files (
  id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete cascade, name text, file_path text, file_url text, file_size bigint, mime_type text,
  is_client_visible boolean default false, uploaded_by uuid references profiles(id), uploaded_by_client boolean default false, created_at timestamptz default now()
);
create table if not exists task_templates (
  id uuid primary key default gen_random_uuid(), title text not null, description text, client_id uuid references clients(id) on delete set null, project_id uuid references projects(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null, assigned_users uuid[] default '{}', priority text default 'normal', deadline_offset_days int default 0, is_active boolean default true,
  created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text, project_id uuid references projects(id) on delete cascade, client_id uuid references clients(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null, reviewer_id uuid references profiles(id) on delete set null, template_id uuid references task_templates(id) on delete set null,
  status text default 'todo', priority text default 'normal', due_date timestamptz, completed_at timestamptz, created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists task_comments (id uuid primary key default gen_random_uuid(), task_id uuid references tasks(id) on delete cascade, user_id uuid references profiles(id), content text, created_at timestamptz default now());
create table if not exists task_files (id uuid primary key default gen_random_uuid(), task_id uuid references tasks(id) on delete cascade, user_id uuid references profiles(id), file_name text, file_url text, file_size bigint, file_type text, created_at timestamptz default now());
create table if not exists time_logs (id uuid primary key default gen_random_uuid(), task_id uuid references tasks(id) on delete cascade, user_id uuid references profiles(id), started_at timestamptz, ended_at timestamptz, duration_min int);
create table if not exists contents (
  id uuid primary key default gen_random_uuid(), title text not null, client_id uuid references clients(id) on delete set null, type text default 'post', platform text, caption text,
  status text default 'draft', assigned_to uuid references profiles(id) on delete set null, publish_date date, notes text, created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists content_files (id uuid primary key default gen_random_uuid(), content_id uuid references contents(id) on delete cascade, file_name text, file_url text, file_size bigint, version int default 1, note text, uploaded_by uuid references profiles(id), created_at timestamptz default now());
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(), title text, type text, status text default 'pending', content_id uuid references contents(id) on delete set null, client_id uuid references clients(id) on delete set null,
  requested_by uuid references profiles(id), approved_by uuid references profiles(id), internal_note text, notes text, link text, portal_link text, client_status text, client_sent_at timestamptz, resolved_at timestamptz, created_at timestamptz default now()
);
create table if not exists client_portal_tokens (
  id uuid primary key default gen_random_uuid(), token text unique not null default encode(gen_random_bytes(24),'hex'), client_id uuid references clients(id) on delete cascade, project_id uuid references projects(id) on delete cascade,
  approval_id uuid references approvals(id) on delete cascade, content_id uuid references contents(id) on delete cascade, is_client_token boolean default false, decision text, client_decision text, client_note text, client_decided_at timestamptz,
  expires timestamptz, expires_at timestamptz, created_at timestamptz default now()
);
create table if not exists shares (id uuid primary key default gen_random_uuid(), title text not null, status text default 'pending', created_by uuid references profiles(id), created_at timestamptz default now());
create table if not exists social_media_reports (id uuid primary key default gen_random_uuid(), client_id uuid references clients(id) on delete cascade, week_start date, data jsonb default '{}'::jsonb, created_at timestamptz default now());
create table if not exists tools (id uuid primary key default gen_random_uuid(), name text not null, url text, username text, status text default 'active', notes text, created_by uuid references profiles(id), created_at timestamptz default now());
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(), type text, amount numeric default 0, category text, description text, status text default 'pending', date date default current_date,
  client_id uuid references clients(id) on delete set null, project_id uuid references projects(id) on delete set null, created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(), title text not null, description text, start_time timestamptz, end_time timestamptz, status text default 'scheduled', meet_link text, google_event_id text,
  client_id uuid references clients(id) on delete set null, created_by uuid references profiles(id), created_at timestamptz default now()
);
create table if not exists meeting_participants (meeting_id uuid references meetings(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, primary key (meeting_id, user_id));
create table if not exists google_tokens (id uuid primary key default gen_random_uuid(), user_id uuid unique references profiles(id) on delete cascade, access_token text, refresh_token text, expires_at timestamptz);

-- ===== Kişisel / sistem =====
create table if not exists notes (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, title text, content text, reminder_at timestamptz, sms_enabled boolean default false, sms_sent boolean default false, created_at timestamptz default now());
create table if not exists daily_checklist (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, date date default current_date, items jsonb default '[]'::jsonb, updated_at timestamptz default now(), unique (user_id, date));
create table if not exists notifications (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, title text, body text, type text, entity_type text, entity_id text, is_read boolean default false, created_at timestamptz default now());
create table if not exists push_subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, endpoint text unique, auth text, p256dh text, user_agent text, updated_at timestamptz default now());
create table if not exists support_tickets (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id), title text, type text, note text, status text default 'open', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists system_settings (key text primary key, value text);
create table if not exists automations (id uuid primary key default gen_random_uuid(), name text, trigger_event text, trigger_hours int, action text, message_template text, active boolean default true, run_count int default 0, created_at timestamptz default now());
create table if not exists automation_logs (id uuid primary key default gen_random_uuid(), automation_id uuid, status text, text text, response text, created_at timestamptz default now());
create table if not exists activities (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete set null, action text not null, entity_type text, entity_id text, entity_title text, created_at timestamptz default now());
create table if not exists user_login_logs (id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id) on delete cascade, email text, action text, created_at timestamptz default now());

-- Kullanıcı listesi (auth bilgisiyle birleşik) yalnızca yönetici/müdüre açık
create or replace view public.user_sessions as
select p.id, p.full_name, p.role, p.department, p.phone, u.email, u.created_at as registered_at, u.last_sign_in_at,
  case when u.last_sign_in_at is null then 'never' when u.last_sign_in_at > now() - interval '15 minutes' then 'online'
       when u.last_sign_in_at > now() - interval '1 day' then 'today' when u.last_sign_in_at > now() - interval '7 days' then 'this_week' else 'inactive' end as session_status
from profiles p join auth.users u on u.id = p.id where public.is_staff();
revoke all on public.user_sessions from anon;
grant select on public.user_sessions to authenticated;

-- ===== RLS =====
do $$ declare t text; begin
  foreach t in array array['profiles','pending_invites','clients','projects','project_stages','project_files','task_templates','tasks','task_comments','task_files','time_logs','contents','content_files','approvals','client_portal_tokens','shares','social_media_reports','tools','transactions','meetings','meeting_participants','google_tokens','notes','daily_checklist','notifications','push_subscriptions','support_tickets','system_settings','automations','automation_logs','activities','user_login_logs'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Ekip verileri: giriş yapmış her personel
do $$ declare t text; begin
  foreach t in array array['clients','projects','project_stages','project_files','task_templates','tasks','task_comments','task_files','time_logs','contents','content_files','approvals','client_portal_tokens','shares','social_media_reports','meetings','meeting_participants','activities'] loop
    execute format('create policy %I on %I for all to authenticated using (true) with check (true)', t || '_staff', t);
  end loop;
end $$;
create policy profiles_read on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy invites_admin on pending_invites for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- Kişisel veriler: yalnızca sahibi
do $$ declare t text; begin
  foreach t in array array['notes','daily_checklist','notifications','push_subscriptions','google_tokens'] loop
    execute format('create policy %I on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_own', t);
  end loop;
end $$;
create policy notifications_insert on notifications for insert to authenticated with check (true);
create policy tickets_own on support_tickets for all to authenticated using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());
-- Finans: yalnızca yönetici ve muhasebe
create policy transactions_fin on transactions for all to authenticated using (public.has_role(array['admin','muhasebe'])) with check (public.has_role(array['admin','muhasebe']));
-- Ayarlar (SMS/SMTP şifreleri dahil), araçlar, otomasyonlar: yönetici ve müdür
create policy settings_staff on system_settings for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy tools_staff on tools for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy automations_staff on automations for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy automation_logs_staff on automation_logs for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy logins_read on user_login_logs for select to authenticated using (public.is_staff() or user_id = auth.uid());
create policy logins_insert on user_login_logs for insert to authenticated with check (user_id = auth.uid());

-- Dosya kovaları (özel)
insert into storage.buckets (id, name, public) values ('project-files','project-files',false),('content-files','content-files',false),('task-files','task-files',false) on conflict (id) do nothing;
create policy "panel files" on storage.objects for all to authenticated using (bucket_id in ('project-files','content-files','task-files')) with check (bucket_id in ('project-files','content-files','task-files'));
