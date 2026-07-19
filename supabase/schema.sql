-- AURA Supabase schema
-- AI Unified Reasoning & Operations Assistant

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create type public.user_status as enum ('active', 'invited', 'suspended');
create type public.gate_status as enum ('open', 'restricted', 'closed', 'maintenance');
create type public.sensor_confidence as enum ('low', 'medium', 'high');
create type public.incident_status as enum ('new', 'triaged', 'assigned', 'mitigating', 'resolved', 'dismissed');
create type public.incident_severity as enum ('low', 'medium', 'high', 'critical');
create type public.recommendation_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'executed', 'expired');
create type public.notification_status as enum ('queued', 'sent', 'read', 'failed');
create type public.timeline_event_type as enum ('system', 'sensor', 'ai', 'operator', 'incident', 'recommendation');

create table public.stadiums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  city text not null,
  country text not null,
  timezone text not null,
  capacity integer not null check (capacity > 0),
  geo_boundary geography(polygon, 4326),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  stadium_id uuid references public.stadiums(id) on delete set null,
  full_name text not null,
  email text not null unique,
  status public.user_status not null default 'invited',
  last_seen_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gates (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  name text not null,
  code text not null,
  status public.gate_status not null default 'open',
  capacity_per_minute integer not null check (capacity_per_minute > 0),
  location geography(point, 4326),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stadium_id, code)
);

create table public.transportation (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  route_name text not null,
  provider text not null,
  mode text not null check (mode in ('rail', 'bus', 'shuttle', 'rideshare', 'parking', 'walk')),
  status text not null check (status in ('normal', 'delayed', 'surge', 'suspended', 'closed')),
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  capacity_utilization numeric(5,2) not null check (capacity_utilization >= 0 and capacity_utilization <= 100),
  last_reported_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  display_name text not null,
  team text not null,
  skill_tags text[] not null default '{}',
  current_zone text,
  available boolean not null default true,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crowd (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  gate_id uuid references public.gates(id) on delete set null,
  zone_name text not null,
  observed_at timestamptz not null default now(),
  density_percent numeric(5,2) not null check (density_percent >= 0 and density_percent <= 100),
  flow_rate_per_minute integer not null check (flow_rate_per_minute >= 0),
  wait_time_seconds integer not null check (wait_time_seconds >= 0),
  confidence public.sensor_confidence not null default 'medium',
  source text not null,
  metadata jsonb not null default '{}'
);

create table public.waste (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  zone_name text not null,
  bin_or_unit_code text not null,
  observed_at timestamptz not null default now(),
  fill_percent numeric(5,2) not null check (fill_percent >= 0 and fill_percent <= 100),
  contamination_percent numeric(5,2) check (contamination_percent >= 0 and contamination_percent <= 100),
  service_required boolean not null default false,
  metadata jsonb not null default '{}'
);

create table public.accessibility (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  assigned_volunteer_id uuid references public.volunteers(id) on delete set null,
  requester_reference text not null,
  zone_name text not null,
  request_type text not null,
  priority public.incident_severity not null default 'medium',
  status text not null check (status in ('requested', 'assigned', 'in_progress', 'completed', 'cancelled')),
  sla_due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= created_at)
);

create table public.energy (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  system_name text not null,
  observed_at timestamptz not null default now(),
  usage_kw numeric(12,3) not null check (usage_kw >= 0),
  renewable_percent numeric(5,2) check (renewable_percent >= 0 and renewable_percent <= 100),
  load_state text not null check (load_state in ('normal', 'elevated', 'peak', 'reduced')),
  metadata jsonb not null default '{}'
);

create table public.weather (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  observed_at timestamptz not null default now(),
  temperature_c numeric(5,2) not null,
  humidity_percent numeric(5,2) not null check (humidity_percent >= 0 and humidity_percent <= 100),
  wind_speed_kph numeric(6,2) not null check (wind_speed_kph >= 0),
  precipitation_mm numeric(7,2) not null default 0 check (precipitation_mm >= 0),
  condition text not null,
  alert_level public.incident_severity default 'low',
  metadata jsonb not null default '{}'
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  gate_id uuid references public.gates(id) on delete set null,
  assigned_volunteer_id uuid references public.volunteers(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  category text not null,
  severity public.incident_severity not null,
  status public.incident_status not null default 'new',
  zone_name text,
  description text not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (resolved_at is null or resolved_at >= detected_at)
);

create table public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  model_name text not null,
  prompt_version text not null,
  input_summary text not null,
  output_summary text not null,
  confidence numeric(5,2) not null check (confidence >= 0 and confidence <= 100),
  evidence jsonb not null default '[]',
  risks jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  ai_analysis_id uuid references public.ai_analysis(id) on delete set null,
  title text not null,
  action text not null,
  rationale text not null,
  severity public.incident_severity not null,
  confidence numeric(5,2) not null check (confidence >= 0 and confidence <= 100),
  status public.recommendation_status not null default 'pending_review',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  recipient_user_id uuid references public.users(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete cascade,
  title text not null,
  body text not null,
  channel text not null check (channel in ('in_app', 'email', 'sms', 'push', 'radio')),
  status public.notification_status not null default 'queued',
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.timeline (
  id uuid primary key default gen_random_uuid(),
  stadium_id uuid not null references public.stadiums(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type public.timeline_event_type not null,
  title text not null,
  detail text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  stadium_id uuid references public.stadiums(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id uuid;
  stadium_scope uuid;
begin
  record_id = coalesce(new.id, old.id);
  stadium_scope = coalesce(new.stadium_id, old.stadium_id);

  insert into public.audit_logs (
    actor_user_id,
    stadium_id,
    action,
    entity_table,
    entity_id,
    old_values,
    new_values
  )
  values (
    auth.uid(),
    stadium_scope,
    tg_op,
    tg_table_name,
    record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_stadiums_updated_at before update on public.stadiums
for each row execute function public.set_updated_at();

create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

create trigger set_gates_updated_at before update on public.gates
for each row execute function public.set_updated_at();

create trigger set_transportation_updated_at before update on public.transportation
for each row execute function public.set_updated_at();

create trigger set_volunteers_updated_at before update on public.volunteers
for each row execute function public.set_updated_at();

create trigger set_accessibility_updated_at before update on public.accessibility
for each row execute function public.set_updated_at();

create trigger set_incidents_updated_at before update on public.incidents
for each row execute function public.set_updated_at();

create trigger set_recommendations_updated_at before update on public.recommendations
for each row execute function public.set_updated_at();

create trigger audit_stadiums after insert or update or delete on public.stadiums
for each row execute function public.write_audit_log();

create trigger audit_users after insert or update or delete on public.users
for each row execute function public.write_audit_log();

create trigger audit_gates after insert or update or delete on public.gates
for each row execute function public.write_audit_log();

create trigger audit_transportation after insert or update or delete on public.transportation
for each row execute function public.write_audit_log();

create trigger audit_volunteers after insert or update or delete on public.volunteers
for each row execute function public.write_audit_log();

create trigger audit_accessibility after insert or update or delete on public.accessibility
for each row execute function public.write_audit_log();

create trigger audit_incidents after insert or update or delete on public.incidents
for each row execute function public.write_audit_log();

create trigger audit_recommendations after insert or update or delete on public.recommendations
for each row execute function public.write_audit_log();

create index idx_users_role_id on public.users(role_id);
create index idx_users_stadium_id on public.users(stadium_id);
create index idx_gates_stadium_id on public.gates(stadium_id);
create index idx_gates_location on public.gates using gist(location);
create index idx_transportation_stadium_status on public.transportation(stadium_id, status);
create index idx_volunteers_stadium_available on public.volunteers(stadium_id, available);
create index idx_crowd_stadium_observed_at on public.crowd(stadium_id, observed_at desc);
create index idx_crowd_gate_observed_at on public.crowd(gate_id, observed_at desc);
create index idx_waste_stadium_observed_at on public.waste(stadium_id, observed_at desc);
create index idx_accessibility_stadium_status on public.accessibility(stadium_id, status);
create index idx_energy_stadium_observed_at on public.energy(stadium_id, observed_at desc);
create index idx_weather_stadium_observed_at on public.weather(stadium_id, observed_at desc);
create index idx_incidents_stadium_status_severity on public.incidents(stadium_id, status, severity);
create index idx_incidents_detected_at on public.incidents(detected_at desc);
create index idx_ai_analysis_incident_id on public.ai_analysis(incident_id);
create index idx_recommendations_incident_status on public.recommendations(incident_id, status);
create index idx_recommendations_stadium_status on public.recommendations(stadium_id, status);
create index idx_notifications_recipient_status on public.notifications(recipient_user_id, status);
create index idx_timeline_incident_occurred_at on public.timeline(incident_id, occurred_at desc);
create index idx_audit_logs_actor_created_at on public.audit_logs(actor_user_id, created_at desc);
create index idx_audit_logs_entity on public.audit_logs(entity_table, entity_id);

create or replace function public.current_user_stadium_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select stadium_id from public.users where id = auth.uid()
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    join public.role_permissions rp on rp.role_id = u.role_id
    join public.permissions p on p.id = rp.permission_id
    where u.id = auth.uid()
      and u.status = 'active'
      and p.key = permission_key
  )
$$;

alter table public.stadiums enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.users enable row level security;
alter table public.gates enable row level security;
alter table public.transportation enable row level security;
alter table public.volunteers enable row level security;
alter table public.crowd enable row level security;
alter table public.waste enable row level security;
alter table public.accessibility enable row level security;
alter table public.energy enable row level security;
alter table public.weather enable row level security;
alter table public.incidents enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.recommendations enable row level security;
alter table public.notifications enable row level security;
alter table public.timeline enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their own profile" on public.users
for select using (id = auth.uid() or public.has_permission('users.read'));

create policy "Admins can manage users" on public.users
for all using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

create policy "Authenticated users can read roles" on public.roles
for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read permissions" on public.permissions
for select using (auth.role() = 'authenticated');

create policy "Admins can manage role permissions" on public.role_permissions
for all using (public.has_permission('roles.manage'))
with check (public.has_permission('roles.manage'));

create policy "Operators can read assigned stadium" on public.stadiums
for select using (id = public.current_user_stadium_id() or public.has_permission('stadiums.read_all'));

create policy "Admins can manage stadiums" on public.stadiums
for all using (public.has_permission('stadiums.manage'))
with check (public.has_permission('stadiums.manage'));

create policy "Read stadium operational tables" on public.gates
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('operations.read_all'));

create policy "Manage gates" on public.gates
for all using (public.has_permission('operations.manage'))
with check (public.has_permission('operations.manage'));

create policy "Read transportation" on public.transportation
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('operations.read_all'));

create policy "Manage transportation" on public.transportation
for all using (public.has_permission('transportation.manage'))
with check (public.has_permission('transportation.manage'));

create policy "Read volunteers" on public.volunteers
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('operations.read_all'));

create policy "Manage volunteers" on public.volunteers
for all using (public.has_permission('volunteers.manage'))
with check (public.has_permission('volunteers.manage'));

create policy "Read crowd telemetry" on public.crowd
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('telemetry.read_all'));

create policy "Insert crowd telemetry" on public.crowd
for insert with check (public.has_permission('telemetry.ingest'));

create policy "Read waste telemetry" on public.waste
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('telemetry.read_all'));

create policy "Insert waste telemetry" on public.waste
for insert with check (public.has_permission('telemetry.ingest'));

create policy "Read accessibility requests" on public.accessibility
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('accessibility.read_all'));

create policy "Manage accessibility requests" on public.accessibility
for all using (public.has_permission('accessibility.manage'))
with check (public.has_permission('accessibility.manage'));

create policy "Read energy telemetry" on public.energy
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('telemetry.read_all'));

create policy "Insert energy telemetry" on public.energy
for insert with check (public.has_permission('telemetry.ingest'));

create policy "Read weather telemetry" on public.weather
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('telemetry.read_all'));

create policy "Insert weather telemetry" on public.weather
for insert with check (public.has_permission('telemetry.ingest'));

create policy "Read incidents" on public.incidents
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('incidents.read_all'));

create policy "Manage incidents" on public.incidents
for all using (public.has_permission('incidents.manage'))
with check (public.has_permission('incidents.manage'));

create policy "Read AI analysis" on public.ai_analysis
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('ai.read_all'));

create policy "Insert AI analysis" on public.ai_analysis
for insert with check (public.has_permission('ai.generate'));

create policy "Read recommendations" on public.recommendations
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('recommendations.read_all'));

create policy "Review recommendations" on public.recommendations
for update using (public.has_permission('recommendations.review'))
with check (public.has_permission('recommendations.review'));

create policy "Insert recommendations" on public.recommendations
for insert with check (public.has_permission('ai.generate'));

create policy "Read own notifications" on public.notifications
for select using (recipient_user_id = auth.uid() or public.has_permission('notifications.read_all'));

create policy "Manage notifications" on public.notifications
for all using (public.has_permission('notifications.manage'))
with check (public.has_permission('notifications.manage'));

create policy "Read timeline" on public.timeline
for select using (stadium_id = public.current_user_stadium_id() or public.has_permission('timeline.read_all'));

create policy "Append timeline" on public.timeline
for insert with check (public.has_permission('timeline.append'));

create policy "Read audit logs" on public.audit_logs
for select using (public.has_permission('audit.read'));

create policy "Append audit logs" on public.audit_logs
for insert with check (public.has_permission('audit.append'));

insert into public.permissions (key, description) values
  ('users.read', 'Read user profiles'),
  ('users.manage', 'Manage users'),
  ('roles.manage', 'Manage roles and permissions'),
  ('stadiums.read_all', 'Read all stadiums'),
  ('stadiums.manage', 'Manage stadium records'),
  ('operations.read_all', 'Read all operational records'),
  ('operations.manage', 'Manage core operations'),
  ('transportation.manage', 'Manage transportation data'),
  ('volunteers.manage', 'Manage volunteers'),
  ('telemetry.read_all', 'Read all telemetry'),
  ('telemetry.ingest', 'Insert telemetry records'),
  ('accessibility.read_all', 'Read all accessibility requests'),
  ('accessibility.manage', 'Manage accessibility requests'),
  ('incidents.read_all', 'Read all incidents'),
  ('incidents.manage', 'Create and update incidents'),
  ('ai.read_all', 'Read all AI analysis'),
  ('ai.generate', 'Create AI analysis and recommendations'),
  ('recommendations.read_all', 'Read all recommendations'),
  ('recommendations.review', 'Approve or reject recommendations'),
  ('notifications.read_all', 'Read all notifications'),
  ('notifications.manage', 'Create and update notifications'),
  ('timeline.read_all', 'Read all timeline events'),
  ('timeline.append', 'Append timeline events'),
  ('audit.read', 'Read audit logs'),
  ('audit.append', 'Append audit logs')
on conflict (key) do nothing;

insert into public.roles (name, description) values
  ('Tournament Director', 'Global command authority across venues'),
  ('Venue Operations Lead', 'Primary operator for one stadium'),
  ('Crowd Manager', 'Crowd flow and gate operations'),
  ('Transport Coordinator', 'Transport and shuttle operations'),
  ('Accessibility Coordinator', 'Accessibility assistance workflows'),
  ('Sustainability Manager', 'Energy and waste operations'),
  ('Read Only Analyst', 'Read-only operational visibility')
on conflict (name) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Tournament Director'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'users.read',
  'operations.read_all',
  'operations.manage',
  'transportation.manage',
  'volunteers.manage',
  'telemetry.read_all',
  'accessibility.read_all',
  'accessibility.manage',
  'incidents.read_all',
  'incidents.manage',
  'ai.read_all',
  'recommendations.read_all',
  'recommendations.review',
  'notifications.manage',
  'timeline.read_all',
  'timeline.append',
  'audit.read'
)
where r.name = 'Venue Operations Lead'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'operations.read_all',
  'operations.manage',
  'telemetry.read_all',
  'incidents.read_all',
  'incidents.manage',
  'recommendations.read_all',
  'recommendations.review',
  'timeline.read_all',
  'timeline.append'
)
where r.name = 'Crowd Manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'operations.read_all',
  'transportation.manage',
  'incidents.read_all',
  'recommendations.read_all',
  'timeline.read_all',
  'timeline.append'
)
where r.name = 'Transport Coordinator'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'accessibility.read_all',
  'accessibility.manage',
  'volunteers.manage',
  'incidents.read_all',
  'recommendations.read_all',
  'timeline.read_all',
  'timeline.append'
)
where r.name = 'Accessibility Coordinator'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'telemetry.read_all',
  'incidents.read_all',
  'recommendations.read_all',
  'timeline.read_all',
  'timeline.append'
)
where r.name = 'Sustainability Manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'operations.read_all',
  'telemetry.read_all',
  'accessibility.read_all',
  'incidents.read_all',
  'ai.read_all',
  'recommendations.read_all',
  'timeline.read_all'
)
where r.name = 'Read Only Analyst'
on conflict do nothing;
