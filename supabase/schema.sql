-- Run this once in Supabase SQL Editor. Admin access is granted only to users
-- whose app_metadata.role is "admin". Do not use user_metadata for roles.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'Camisetas',
  price integer not null check (price >= 0),
  old_price integer,
  image_url text not null,
  gallery_urls text[] not null default '{}',
  video_url text,
  description text not null default '',
  sizes text[] not null default '{}',
  tag text,
  colors text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists gallery_urls text[] not null default '{}';
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists sizes text[] not null default '{}';

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.categories (name, slug, sort_order) values
  ('Camisetas', 'camisetas', 0), ('Busos', 'busos', 1),
  ('Sacos', 'sacos', 2), ('Accesorios', 'accesorios', 3)
on conflict (name) do nothing;

insert into public.store_settings (id, value) values ('storefront',
  '{"whatsapp":"+57 315 050 3171","nequi_name":"","nequi_account":"","nu_name":"","nu_account":"","instagram":"","tiktok":"","facebook":""}'::jsonb)
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Anyone can read active products" on public.products;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "OFF-SKY admins manage products" on public.products;
create policy "Public can read active products" on public.products
  for select to anon, authenticated using (active = true or (auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "OFF-SKY admins manage products" on public.products
  for all to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "OFF-SKY admins manage categories" on public.categories;
create policy "Public can read active categories" on public.categories
  for select to anon, authenticated using (active = true or (auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "OFF-SKY admins manage categories" on public.categories
  for all to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "Public can read storefront settings" on public.store_settings;
drop policy if exists "OFF-SKY admins manage storefront settings" on public.store_settings;
create policy "Public can read storefront settings" on public.store_settings
  for select to anon, authenticated using (id = 'storefront');
create policy "OFF-SKY admins manage storefront settings" on public.store_settings
  for all to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 104857600,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 104857600,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product media" on storage.objects;
drop policy if exists "OFF-SKY admins upload product media" on storage.objects;
drop policy if exists "OFF-SKY admins update product media" on storage.objects;
drop policy if exists "OFF-SKY admins delete product media" on storage.objects;
create policy "Public can view product media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-media');
create policy "OFF-SKY admins upload product media" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-media' and (auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "OFF-SKY admins update product media" on storage.objects
  for update to authenticated using (bucket_id = 'product-media' and (auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check (bucket_id = 'product-media' and (auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "OFF-SKY admins delete product media" on storage.objects
  for delete to authenticated using (bucket_id = 'product-media' and (auth.jwt()->'app_metadata'->>'role') = 'admin');
