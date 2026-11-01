-- Dabba schema. Run once in the Supabase SQL editor (or `supabase db push`).
-- Customers never read the orders table directly. They go through security-definer
-- functions that re-check prices, options, dates and daily capacity on the server:
--   place_order, request_custom, accept_quote, order_status, day_load.

-- Order codes use gen_random_uuid(), built into Postgres 13+, so no extension is needed.

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  name text not null check (char_length(name) between 2 and 60),
  tagline text default '',
  instagram text default '',
  whatsapp text not null,
  city text default 'Karachi',
  capacity int not null default 6 check (capacity between 1 and 500),
  lead_days int not null default 2 check (lead_days between 0 and 30),
  closed_days int[] not null default '{}',
  date_overrides jsonb not null default '{}',          -- {"2026-11-20": {"capacity": 12}} or {"closed": true}
  deposit_pct int not null default 100 check (deposit_pct between 0 and 100),
  payment_info text default '',
  pickup_enabled boolean not null default true,
  pickup_address text default '',
  delivery_zones jsonb not null default '[]',
  custom_enabled boolean not null default false,
  custom_lead_days int not null default 5 check (custom_lead_days between 0 and 60),
  custom_note text default '',
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text default '',
  price int not null check (price between 0 and 1000000),
  units int not null default 1 check (units between 1 and 50),
  image_url text default '',
  options jsonb not null default '[]',                  -- [{name, required, choices:[{label, price, units}]}]
  allow_message boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  due_date date not null,
  fulfilment text not null check (fulfilment in ('pickup','delivery')),
  zone text,
  delivery_fee int not null default 0,
  address text default '',
  customer_name text not null,
  customer_phone text not null,
  notes text default '',
  lines jsonb not null default '[]',
  subtotal int not null default 0,
  total int not null default 0,
  deposit_due int not null default 0,
  units int not null default 0,
  proof_path text,
  payment_status text not null default 'none' check (payment_status in ('none','submitted','verified','rejected')),
  status text not null default 'new' check (status in ('request','quoted','new','confirmed','ready','delivered','cancelled','declined')),
  request jsonb,                                        -- custom cake details: occasion, servings, flavour, details
  photos text[] not null default '{}',                  -- reference photo paths in the private proofs bucket
  quote_note text default '',
  quote_expires timestamptz
);
create index if not exists orders_shop_day on public.orders(shop_id, due_date);

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  shop_id uuid references public.shops(id) on delete set null,
  role text check (role in ('baker','customer','visitor')),
  rating int check (rating between 1 and 5),
  message text check (char_length(message) <= 2000),
  page text,
  contact text
);

-- Public view of a shop: what a customer needs, nothing about the owner.
create or replace view public.public_shops as
  select id, slug, name, tagline, instagram, whatsapp, city, capacity, lead_days, closed_days, date_overrides,
         deposit_pct, payment_info, pickup_enabled, pickup_address, delivery_zones,
         custom_enabled, custom_lead_days, custom_note, is_open
  from public.shops;
grant select on public.public_shops to anon, authenticated;

alter table public.shops enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "owner reads shop" on public.shops;
create policy "owner reads shop" on public.shops for select to authenticated using (owner = auth.uid());
drop policy if exists "owner creates shop" on public.shops;
create policy "owner creates shop" on public.shops for insert to authenticated with check (owner = auth.uid());
drop policy if exists "owner updates shop" on public.shops;
create policy "owner updates shop" on public.shops for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "anyone reads active items" on public.items;
create policy "anyone reads active items" on public.items for select using (
  active or exists (select 1 from public.shops s where s.id = shop_id and s.owner = auth.uid()));
drop policy if exists "owner writes items" on public.items;
create policy "owner writes items" on public.items for all to authenticated
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner = auth.uid()))
  with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner = auth.uid()));

drop policy if exists "owner reads orders" on public.orders;
create policy "owner reads orders" on public.orders for select to authenticated
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner = auth.uid()));
drop policy if exists "owner updates orders" on public.orders;
create policy "owner updates orders" on public.orders for update to authenticated
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner = auth.uid()));

drop policy if exists "anyone sends feedback" on public.feedback;
create policy "anyone sends feedback" on public.feedback for insert to anon, authenticated with check (true);

-- Live order alerts in the baker dashboard.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object or undefined_object then null; end $$;

/* ---------------- helpers (not callable by customers) ---------------- */

create or replace function public._norm_phone(p text) returns text language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(p, ''), '\D', '', 'g');
begin
  d := regexp_replace(d, '^(0092|92|0)', '');
  if d !~ '^3[0-9]{9}$' then raise exception 'Enter a Pakistani mobile number, like 0300 1234567.'; end if;
  return '92' || d;
end $$;

-- Raises if the date can't be booked. p_units null = check the date only (custom requests).
create or replace function public._day_check(s public.shops, p_due date, p_units int, p_lead int)
returns void language plpgsql as $$
declare
  v_today date := (now() at time zone 'Asia/Karachi')::date;
  o jsonb := s.date_overrides -> p_due::text;
  v_cap int; v_closed boolean; v_load int;
begin
  if p_due is null then raise exception 'Pick a date.'; end if;
  if p_due < v_today + p_lead then raise exception 'Orders need % days notice.', p_lead; end if;
  if p_due > v_today + 60 then raise exception 'That date is too far ahead.'; end if;
  if o is not null and coalesce((o->>'closed')::boolean, false) then raise exception 'Closed that day.'; end if;
  if o is not null and o ? 'capacity' and coalesce(o->>'capacity', '') <> '' then
    v_cap := (o->>'capacity')::int; v_closed := false;
  else
    v_cap := s.capacity; v_closed := extract(dow from p_due)::int = any(s.closed_days);
  end if;
  if v_closed then raise exception 'Closed that day.'; end if;
  if p_units is null then return; end if;
  -- One booking at a time per shop and day, so two customers can't take the last slot.
  perform pg_advisory_xact_lock(hashtext(s.id::text || p_due::text));
  select coalesce(sum(units), 0) into v_load from public.orders
   where shop_id = s.id and due_date = p_due and status in ('new','confirmed','ready','delivered');
  if v_load + p_units > v_cap then raise exception 'Fully booked that day.'; end if;
end $$;

create or replace function public._fee(s public.shops, p jsonb) returns int language plpgsql as $$
declare z jsonb;
begin
  if p->>'fulfilment' = 'delivery' then
    select zz into z from jsonb_array_elements(s.delivery_zones) zz where zz->>'name' = p->>'zone' limit 1;
    if z is null then raise exception 'Choose a delivery area.'; end if;
    if char_length(trim(coalesce(p->>'address', ''))) < 8 then raise exception 'Enter the full delivery address.'; end if;
    return coalesce((z->>'fee')::int, 0);
  end if;
  if coalesce(p->>'fulfilment', '') <> 'pickup' or not s.pickup_enabled then raise exception 'Choose pickup or delivery.'; end if;
  return 0;
end $$;

revoke all on function public._norm_phone(text) from public, anon, authenticated;
revoke all on function public._day_check(public.shops, date, int, int) from public, anon, authenticated;
revoke all on function public._fee(public.shops, jsonb) from public, anon, authenticated;

/* ---------------- rate limiting ---------------- */

-- Tracks request counts per client IP and function name.
create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  client_ip inet not null,
  fn_name text not null,
  window_start timestamptz not null default now(),
  request_count int not null default 1,
  unique (client_ip, fn_name, window_start)
);
create index if not exists rate_limits_lookup on public.rate_limits (client_ip, fn_name, window_start);

-- Helper: get client IP from request headers (works behind Supabase edge).
create or replace function public._client_ip()
returns inet language plpgsql stable as $$
begin
  -- Try to get real IP from headers (Supabase sets these)
  if current_setting('request.headers', true) is not null then
    declare h jsonb := current_setting('request.headers')::jsonb;
    begin
      if h ? 'x-forwarded-for' then
        return (h->>'x-forwarded-for')::inet;
      end if;
      if h ? 'x-real-ip' then
        return (h->>'x-real-ip')::inet;
      end if;
    exception when others then null;
    end;
  end if;
  -- Fallback to PostgreSQL's client address
  return inet_client_addr();
exception when others then
  return '0.0.0.0'::inet;
end $$;

-- Checks and increments rate limit. Raises exception if exceeded.
-- p_max_requests: max requests allowed in the window
-- p_window_seconds: sliding window in seconds
create or replace function public._check_rate_limit(p_fn_name text, p_max_requests int, p_window_seconds int)
returns void language plpgsql as $$
declare
  v_ip inet := public._client_ip();
  v_window_start timestamptz := date_trunc('second', now()) - (p_window_seconds || ' seconds')::interval;
  v_count int;
begin
  -- Clean old entries (older than window)
  delete from public.rate_limits
   where window_start < v_window_start;

  -- Upsert current window count
  insert into public.rate_limits (client_ip, fn_name, window_start, request_count)
  values (v_ip, p_fn_name, date_trunc('second', now()), 1)
  on conflict (client_ip, fn_name, window_start) do update
    set request_count = rate_limits.request_count + 1
    where rate_limits.request_count < p_max_requests
  returning request_count into v_count;

  if v_count is null or v_count > p_max_requests then
    raise exception 'Rate limit exceeded. Please wait a moment and try again.';
  end if;
end $$;

revoke all on function public._client_ip() from public, anon, authenticated;
revoke all on function public._check_rate_limit(text, int, int) from public, anon, authenticated;
revoke all on table public.rate_limits from public, anon, authenticated;

/* ---------------- customer functions ---------------- */

create or replace function public.day_load(p_slug text)
returns table(day date, units int) language plpgsql security definer set search_path = public as $$
begin
  perform public._check_rate_limit('day_load', 30, 60);
  return query
  select o.due_date, sum(o.units)::int
  from orders o join shops s on s.id = o.shop_id
  where s.slug = p_slug and o.status in ('new','confirmed','ready','delivered')
    and o.due_date >= (now() at time zone 'Asia/Karachi')::date
  group by o.due_date;
end;
$$;

create or replace function public.place_order(p_slug text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s shops; it items; l jsonb; g jsonb; ch jsonb;
  v_lines jsonb := '[]'; v_choices jsonb; v_sub int := 0; v_units int := 0; v_q int;
  v_price int; v_u int; v_label text; v_msg text; v_fee int; v_total int; v_phone text; v_row orders;
begin
  perform public._check_rate_limit('place_order', 5, 60);
  select * into s from shops where slug = p_slug and is_open;
  if not found then raise exception 'This shop isn''t taking orders right now.'; end if;
  v_phone := _norm_phone(p->>'customer_phone');
  if char_length(trim(coalesce(p->>'customer_name', ''))) < 1 then raise exception 'Enter your name.'; end if;

  for l in select * from jsonb_array_elements(coalesce(p->'lines', '[]')) loop
    v_q := floor((l->>'qty')::numeric);
    if v_q is null or v_q = 0 then continue; end if;
    if v_q < 1 or v_q > 50 then raise exception 'Choose between 1 and 50 of each item.'; end if;
    select * into it from items where id = (l->>'item_id')::uuid and shop_id = s.id and active;
    if not found then raise exception 'One of the items is no longer available. Refresh and try again.'; end if;
    v_price := it.price; v_u := it.units; v_choices := '[]';
    for g in select * from jsonb_array_elements(coalesce(it.options, '[]')) loop
      v_label := l->'choices'->>(g->>'name');
      if v_label is null or v_label = '' then
        if coalesce((g->>'required')::boolean, true) then raise exception 'Choose % for %.', lower(g->>'name'), it.name; end if;
        continue;
      end if;
      ch := null;
      select c into ch from jsonb_array_elements(coalesce(g->'choices', '[]')) c where c->>'label' = v_label limit 1;
      if ch is null then raise exception 'That % isn''t available for %.', lower(g->>'name'), it.name; end if;
      v_price := v_price + coalesce(nullif(ch->>'price', '')::int, 0);
      v_u := v_u + coalesce(nullif(ch->>'units', '')::int, 0);
      v_choices := v_choices || jsonb_build_array(jsonb_build_object('group', g->>'name', 'label', ch->>'label'));
    end loop;
    v_u := greatest(v_u, 1);
    v_msg := case when it.allow_message then left(trim(coalesce(l->>'message', '')), 60) else '' end;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object('item_id', it.id, 'name', it.name, 'price', v_price, 'qty', v_q,
                                            'units', v_u, 'choices', v_choices, 'message', v_msg));
    v_sub := v_sub + v_price * v_q;
    v_units := v_units + v_u * v_q;
  end loop;
  if v_units = 0 then raise exception 'Add at least one item.'; end if;

  v_fee := _fee(s, p);
  perform _day_check(s, (p->>'due_date')::date, v_units, s.lead_days);

  v_total := v_sub + v_fee;
  insert into orders (shop_id, code, due_date, fulfilment, zone, delivery_fee, address, customer_name, customer_phone,
                      notes, lines, subtotal, total, deposit_due, units, proof_path, payment_status, status)
  values (s.id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), (p->>'due_date')::date, p->>'fulfilment',
          case when p->>'fulfilment' = 'delivery' then p->>'zone' end, v_fee, left(coalesce(p->>'address', ''), 300),
          left(trim(p->>'customer_name'), 80), v_phone, left(coalesce(p->>'notes', ''), 500), v_lines, v_sub, v_total,
          ceil(v_total * s.deposit_pct / 100.0)::int, v_units,
          case when (p->>'proof_path') like s.id::text || '/%' then p->>'proof_path' end,
          case when (p->>'proof_path') like s.id::text || '/%' then 'submitted' else 'none' end, 'new')
  returning * into v_row;
  return to_jsonb(v_row);
end $$;

create or replace function public.request_custom(p_slug text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s shops; v_phone text; v_fee int; v_photos text[]; v_row orders;
begin
  perform public._check_rate_limit('request_custom', 3, 60);
  select * into s from shops where slug = p_slug and is_open and custom_enabled;
  if not found then raise exception 'This shop isn''t taking custom requests right now.'; end if;
  v_phone := _norm_phone(p->>'customer_phone');
  if char_length(trim(coalesce(p->>'customer_name', ''))) < 1 then raise exception 'Enter your name.'; end if;
  if char_length(trim(coalesce(p->'request'->>'details', ''))) < 10 then raise exception 'Describe the cake you want in a sentence or two.'; end if;
  perform _day_check(s, (p->>'due_date')::date, null, s.custom_lead_days);
  v_fee := _fee(s, p);
  select coalesce(array_agg(x), '{}') into v_photos
    from (select jsonb_array_elements_text(coalesce(p->'photos', '[]')) x limit 3) t
   where x like s.id::text || '/%';
  insert into orders (shop_id, code, due_date, fulfilment, zone, delivery_fee, address, customer_name, customer_phone,
                      notes, status, request, photos)
  values (s.id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), (p->>'due_date')::date, p->>'fulfilment',
          case when p->>'fulfilment' = 'delivery' then p->>'zone' end, v_fee, left(coalesce(p->>'address', ''), 300),
          left(trim(p->>'customer_name'), 80), v_phone, '', 'request',
          jsonb_build_object('occasion', left(coalesce(p->'request'->>'occasion', ''), 40),
                             'servings', left(coalesce(p->'request'->>'servings', ''), 60),
                             'flavour', left(coalesce(p->'request'->>'flavour', ''), 80),
                             'details', left(trim(p->'request'->>'details'), 1000)),
          v_photos)
  returning * into v_row;
  return to_jsonb(v_row);
end $$;

-- Customer accepts the baker's quote and uploads the advance payment screenshot.
create or replace function public.accept_quote(p_code text, p_proof text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o orders; s shops; v_row orders;
begin
  perform public._check_rate_limit('accept_quote', 5, 60);
  select * into o from orders where code = upper(p_code) and status = 'quoted' for update;
  if not found then raise exception 'This quote is no longer open.'; end if;
  if o.quote_expires is not null and o.quote_expires < now() then raise exception 'This quote has expired. Ask the baker for a new one.'; end if;
  select * into s from shops where id = o.shop_id;
  if o.deposit_due > 0 and (p_proof is null or p_proof not like s.id::text || '/%') then
    raise exception 'Upload a screenshot of your payment.';
  end if;
  perform _day_check(s, o.due_date, greatest(o.units, 1), 0);
  update orders set status = 'new',
         proof_path = case when p_proof like s.id::text || '/%' then p_proof end,
         payment_status = case when p_proof like s.id::text || '/%' then 'submitted' else 'none' end
   where id = o.id returning * into v_row;
  return to_jsonb(v_row);
end $$;

-- What a customer may see about their own order, looked up by its code.
create or replace function public.order_status(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._check_rate_limit('order_status', 30, 60);
  return query
  select jsonb_build_object(
    'order', jsonb_build_object('code', o.code, 'status', o.status, 'payment_status', o.payment_status,
      'due_date', o.due_date, 'fulfilment', o.fulfilment, 'zone', o.zone, 'delivery_fee', o.delivery_fee,
      'lines', o.lines, 'subtotal', o.subtotal, 'total', o.total, 'deposit_due', o.deposit_due,
      'request', o.request, 'quote_note', o.quote_note, 'quote_expires', o.quote_expires,
      'customer_name', split_part(o.customer_name, ' ', 1), 'created_at', o.created_at),
    'shop', jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug, 'whatsapp', s.whatsapp,
      'payment_info', s.payment_info, 'deposit_pct', s.deposit_pct, 'pickup_address', s.pickup_address, 'instagram', s.instagram))
  from orders o join shops s on s.id = o.shop_id
  where o.code = upper(p_code) and char_length(p_code) = 6;
end;
$$;

revoke all on function public.place_order(text, jsonb) from public;
revoke all on function public.request_custom(text, jsonb) from public;
revoke all on function public.accept_quote(text, text) from public;
grant execute on function public.place_order(text, jsonb) to anon, authenticated;
grant execute on function public.request_custom(text, jsonb) to anon, authenticated;
grant execute on function public.accept_quote(text, text) to anon, authenticated;
grant execute on function public.order_status(text) to anon, authenticated;
grant execute on function public.day_load(text) to anon, authenticated;

/* ---------------- storage ---------------- */

-- Payment screenshots and cake reference photos: private. Customers upload, only the owner views.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proofs', 'proofs', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Menu photos: public, so the order page can show them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Customers can't read the shops table, so the upload check runs as a definer function.
create or replace function public.shop_accepts_proofs(p_folder text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from shops where id::text = p_folder and is_open);
$$;
grant execute on function public.shop_accepts_proofs(text) to anon, authenticated;

drop policy if exists "customers upload proofs" on storage.objects;
create policy "customers upload proofs" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'proofs' and public.shop_accepts_proofs((storage.foldername(name))[1]));
drop policy if exists "owners read proofs" on storage.objects;
create policy "owners read proofs" on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] in (select id::text from public.shops where owner = auth.uid()));

drop policy if exists "owners upload menu photos" on storage.objects;
create policy "owners upload menu photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu' and (storage.foldername(name))[1] in (select id::text from public.shops where owner = auth.uid()));
drop policy if exists "owners delete menu photos" on storage.objects;
create policy "owners delete menu photos" on storage.objects for delete to authenticated
  using (bucket_id = 'menu' and (storage.foldername(name))[1] in (select id::text from public.shops where owner = auth.uid()));
