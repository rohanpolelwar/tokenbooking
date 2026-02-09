-- Core logic functions for token management

-- 1. Atomic Token Booking (FCFS)
create or replace function book_token(
  p_session_id uuid,
  p_name text,
  p_phone text
)
returns int
language plpgsql
security definer -- Runs with privileges of the creator
as $$
declare
  next_token int;
  session_capacity int;
begin
  -- Lock the OPD session row (single source of truth)
  -- This prevents race conditions under heavy concurrent booking
  select max_tokens
  into session_capacity
  from opd_sessions
  where id = p_session_id
    and status = 'OPEN'
  for update; -- EXCLUSIVE LOCK

  if not found then
    raise exception 'Session not open or does not exist';
  end if;

  -- Determine next token number (FCFS)
  -- Count current tokens for this session
  select coalesce(max(token_number), 0) + 1
  into next_token
  from tokens
  where session_id = p_session_id;

  -- Capacity check
  if next_token > session_capacity then
    raise exception 'Session is full';
  end if;

  -- Insert token
  insert into tokens (
    session_id,
    token_number,
    patient_name,
    patient_phone,
    status
  )
  values (
    p_session_id,
    next_token,
    p_name,
    p_phone,
    'BOOKED'
  );

  return next_token;
end;
$$;

-- 2. Staff Action: Serve Token
create or replace function serve_token(p_token_id uuid)
returns void
language plpgsql
security definer
as $$
begin
    -- Mark previous 'NOW_SERVING' as 'SERVED' for the same session
    update tokens
    set status = 'SERVED', served_at = now()
    where status = 'NOW_SERVING'
    and session_id = (select session_id from tokens where id = p_token_id);

    -- Mark this token as 'NOW_SERVING'
    update tokens
    set status = 'NOW_SERVING'
    where id = p_token_id;
end;
$$;

-- 3. Staff Action: Skip Token
create or replace function skip_token(p_token_id uuid)
returns void
language plpgsql
security definer
as $$
begin
    update tokens
    set status = 'SKIPPED'
    where id = p_token_id;
end;
$$;

-- 4. Staff Action: Cancel Token
create or replace function cancel_token(p_token_id uuid)
returns void
language plpgsql
security definer
as $$
begin
    update tokens
    set status = 'CANCELLED'
    where id = p_token_id;
end;
$$;
