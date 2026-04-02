-- Create the profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Create the anomalies_reference table
create table public.anomalies_reference (
  id bigserial primary key,
  title text not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- Create the user_cards table
create table public.user_cards (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  anomaly_id bigint not null references public.anomalies_reference(id) on delete cascade,
  found boolean not null default false,
  completed boolean not null default false,
  characteristics text not null default '',
  pathologies text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, anomaly_id)
);

-- Create the user_photos table
create table public.user_photos (
  id bigserial primary key,
  user_card_id bigint not null references public.user_cards(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_cards enable row level security;
alter table public.user_photos enable row level security;
alter table public.anomalies_reference enable row level security;

-- Policies for profiles
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

-- Policy for anomalies_reference
create policy "reference_read_authenticated"
on public.anomalies_reference
for select
using (auth.role() = 'authenticated');

-- Policies for user_cards
create policy "user_cards_select_own"
on public.user_cards
for select
using (auth.uid() = user_id);

create policy "user_cards_insert_own"
on public.user_cards
for insert
with check (auth.uid() = user_id);

create policy "user_cards_update_own"
on public.user_cards
for update
using (auth.uid() = user_id);

create policy "user_cards_delete_own"
on public.user_cards
for delete
using (auth.uid() = user_id);

-- Policies for user_photos
create policy "user_photos_select_own"
on public.user_photos
for select
using (
  exists (
    select 1
    from public.user_cards uc
    where uc.id = user_card_id
      and uc.user_id = auth.uid()
  )
);

create policy "user_photos_insert_own"
on public.user_photos
for insert
with check (
  exists (
    select 1
    from public.user_cards uc
    where uc.id = user_card_id
      and uc.user_id = auth.uid()
  )
);

create policy "user_photos_update_own"
on public.user_photos
for update
using (
  exists (
    select 1
    from public.user_cards uc
    where uc.id = user_card_id
      and uc.user_id = auth.uid()
  )
);

create policy "user_photos_delete_own"
on public.user_photos
for delete
using (
  exists (
    select 1
    from public.user_cards uc
    where uc.id = user_card_id
      and uc.user_id = auth.uid()
  )
);

-- Function and trigger for new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Insert initial anomalies data
INSERT INTO public.anomalies_reference (title, category) VALUES
('Schizocyte', 'Pathologies du globule rouge'),
('Drépanocyte', 'Pathologies du globule rouge'),
('Lymphocyte hyperbasophile', 'Pathologies du lymphocyte'),
('Cellule chevelue', 'Pathologies du lymphocyte'),
('Blaste myéloïde', 'Leucémies'),
('Auer rod', 'Leucémies');