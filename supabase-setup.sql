-- Run this in the Supabase SQL Editor to set up or update the duel page.
-- The browser uses only the project's publishable/anon key, never a service-role key.

create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-F0-9]{6}$'),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  is_public boolean not null default false,
  player1_name text not null check (char_length(player1_name) between 1 and 20),
  player2_name text check (player2_name is null or char_length(player2_name) between 1 and 20),
  player1_secret_hash text not null check (player1_secret_hash ~ '^[0-9a-f]{64}$'),
  player2_secret_hash text check (player2_secret_hash is null or player2_secret_hash ~ '^[0-9a-f]{64}$'),
  scrambles text[] not null check (cardinality(scrambles) = 5),
  turn_index smallint not null default 0 check (turn_index between 0 and 10),
  created_at timestamptz not null default now()
);

alter table public.duels
  add column if not exists is_public boolean not null default false;

create index if not exists duels_open_public_rooms_idx
  on public.duels (created_at desc)
  where is_public and status = 'waiting' and player2_secret_hash is null;

create table if not exists public.duel_results (
  duel_id uuid not null references public.duels(id) on delete cascade,
  round_number smallint not null check (round_number between 1 and 5),
  player_number smallint not null check (player_number in (1, 2)),
  time_ms integer not null check (time_ms between 1 and 3600000),
  created_at timestamptz not null default now(),
  primary key (duel_id, round_number, player_number)
);

alter table public.duels enable row level security;
alter table public.duel_results enable row level security;
revoke all on public.duels, public.duel_results from anon, authenticated;

create or replace function public.duel_create(
  p_player_name text,
  p_scrambles text[],
  p_secret_hash text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
begin
  if p_player_name is null
    or char_length(trim(p_player_name)) not between 1 and 20
    or p_scrambles is null
    or cardinality(p_scrambles) <> 5
    or exists (
      select 1
      from unnest(p_scrambles) as scrambles(scramble_text)
      where scramble_text is null
        or char_length(trim(scramble_text)) not between 1 and 200
    )
    or p_secret_hash is null
    or p_secret_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Invalid duel setup.';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.duels where code = v_code);
  end loop;

  insert into public.duels (
    code,
    player1_name,
    player1_secret_hash,
    scrambles
  )
  values (
    v_code,
    trim(p_player_name),
    p_secret_hash,
    p_scrambles
  );

  return v_code;
end;
$$;

create or replace function public.duel_create_public(
  p_player_name text,
  p_scrambles text[],
  p_secret_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
  v_room_id uuid;
begin
  if p_player_name is null
    or char_length(trim(p_player_name)) not between 1 and 20
    or p_scrambles is null
    or cardinality(p_scrambles) <> 5
    or exists (
      select 1
      from unnest(p_scrambles) as scrambles(scramble_text)
      where scramble_text is null
        or char_length(trim(scramble_text)) not between 1 and 200
    )
    or p_secret_hash is null
    or p_secret_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Invalid duel setup.';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.duels where code = v_code);
  end loop;

  insert into public.duels (
    code,
    is_public,
    player1_name,
    player1_secret_hash,
    scrambles
  )
  values (
    v_code,
    true,
    trim(p_player_name),
    p_secret_hash,
    p_scrambles
  )
  returning id into v_room_id;

  return jsonb_build_object('id', v_room_id, 'code', v_code);
end;
$$;

create or replace function public.duel_join(
  p_code text,
  p_player_name text,
  p_secret_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_player_name is null
    or char_length(trim(p_player_name)) not between 1 and 20
    or p_secret_hash is null
    or p_secret_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Invalid player details.';
  end if;

  update public.duels
  set
    player2_name = trim(p_player_name),
    player2_secret_hash = p_secret_hash,
    status = 'active'
  where code = upper(trim(p_code))
    and status = 'waiting'
    and not is_public
    and player2_secret_hash is null;

  if not found then
    raise exception 'Duel not found or already full.';
  end if;

  return true;
end;
$$;

create or replace function public.duel_list_public_rooms()
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', public_rooms.id,
        'player1Name', public_rooms.player1_name
      ) order by public_rooms.created_at desc
    ),
    '[]'::jsonb
  )
  from (
    select id, player1_name, created_at
    from public.duels
    where is_public
      and status = 'waiting'
      and player2_secret_hash is null
    order by created_at desc
    limit 25
  ) as public_rooms;
$$;

create or replace function public.duel_join_public(
  p_room_id uuid,
  p_player_name text,
  p_secret_hash text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
begin
  if p_player_name is null
    or char_length(trim(p_player_name)) not between 1 and 20
    or p_secret_hash is null
    or p_secret_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Invalid player details.';
  end if;

  update public.duels
  set
    player2_name = trim(p_player_name),
    player2_secret_hash = p_secret_hash,
    status = 'active'
  where id = p_room_id
    and is_public
    and status = 'waiting'
    and player2_secret_hash is null
  returning code into v_code;

  if not found then
    raise exception 'Public room not found or already full.';
  end if;

  return v_code;
end;
$$;

create or replace function public.duel_get_state(
  p_code text,
  p_secret_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_duel public.duels%rowtype;
  v_player_number smallint;
begin
  select *
  into v_duel
  from public.duels
  where code = upper(trim(p_code));

  if not found then
    raise exception 'Duel not found or participant key is invalid.';
  end if;

  if v_duel.player1_secret_hash = p_secret_hash then
    v_player_number := 1;
  elsif v_duel.player2_secret_hash = p_secret_hash then
    v_player_number := 2;
  else
    raise exception 'Duel not found or participant key is invalid.';
  end if;

  return jsonb_build_object(
    'code', v_duel.code,
    'status', v_duel.status,
    'player1Name', v_duel.player1_name,
    'player2Name', v_duel.player2_name,
    'playerNumber', v_player_number,
    'scrambles', to_jsonb(v_duel.scrambles),
    'turnIndex', v_duel.turn_index,
    'roundNumber', least((v_duel.turn_index / 2) + 1, 5),
    'activePlayer',
      case
        when v_duel.turn_index >= 10 then null
        when mod(v_duel.turn_index, 4) in (0, 3) then 1
        else 2
      end,
    'results', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'round', round_number,
            'player', player_number,
            'timeMs', time_ms
          )
          order by round_number, player_number
        )
        from public.duel_results
        where duel_id = v_duel.id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

create or replace function public.duel_submit_time(
  p_code text,
  p_secret_hash text,
  p_time_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_duel public.duels%rowtype;
  v_player_number smallint;
  v_expected_player smallint;
  v_round_number smallint;
begin
  if p_time_ms is null or p_time_ms not between 1 and 3600000 then
    raise exception 'Solve time is out of range.';
  end if;

  select *
  into v_duel
  from public.duels
  where code = upper(trim(p_code))
  for update;

  if not found or v_duel.status <> 'active' or v_duel.turn_index >= 10 then
    raise exception 'This duel is not accepting a solve.';
  end if;

  if v_duel.player1_secret_hash = p_secret_hash then
    v_player_number := 1;
  elsif v_duel.player2_secret_hash = p_secret_hash then
    v_player_number := 2;
  else
    raise exception 'Participant key is invalid.';
  end if;

  v_expected_player :=
    case when mod(v_duel.turn_index, 4) in (0, 3) then 1 else 2 end;
  v_round_number := (v_duel.turn_index / 2) + 1;

  if v_player_number <> v_expected_player then
    raise exception 'It is not your turn.';
  end if;

  insert into public.duel_results (duel_id, round_number, player_number, time_ms)
  values (v_duel.id, v_round_number, v_player_number, p_time_ms);

  update public.duels
  set
    turn_index = turn_index + 1,
    status = case when turn_index + 1 >= 10 then 'finished' else 'active' end
  where id = v_duel.id;

  return public.duel_get_state(v_duel.code, p_secret_hash);
end;
$$;

revoke all on function public.duel_create(text, text[], text) from public;
revoke all on function public.duel_create_public(text, text[], text) from public;
revoke all on function public.duel_join(text, text, text) from public;
revoke all on function public.duel_list_public_rooms() from public;
revoke all on function public.duel_join_public(uuid, text, text) from public;
revoke all on function public.duel_get_state(text, text) from public;
revoke all on function public.duel_submit_time(text, text, integer) from public;

grant execute on function public.duel_create(text, text[], text) to anon, authenticated;
grant execute on function public.duel_create_public(text, text[], text) to anon, authenticated;
grant execute on function public.duel_join(text, text, text) to anon, authenticated;
grant execute on function public.duel_list_public_rooms() to anon, authenticated;
grant execute on function public.duel_join_public(uuid, text, text) to anon, authenticated;
grant execute on function public.duel_get_state(text, text) to anon, authenticated;
grant execute on function public.duel_submit_time(text, text, integer) to anon, authenticated;

notify pgrst, 'reload schema';
