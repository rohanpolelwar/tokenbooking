-- Row Level Security (RLS) Configuration

-- Enable RLS on all tables
alter table clinics enable row level security;
alter table doctors enable row level security;
alter table opd_sessions enable row level security;
alter table tokens enable row level security;
alter table doctor_leaves enable row level security;

-- 1. Clinics Policies
create policy "Clinics are viewable by everyone" 
on clinics for select using (true);

create policy "Clinics can be modified by staff" 
on clinics for all to authenticated using (true);

-- 2. Doctors Policies
create policy "Doctors are viewable by everyone" 
on doctors for select using (true);

create policy "Doctors can be modified by staff" 
on doctors for all to authenticated using (true);

-- 3. OPD Sessions Policies
create policy "Sessions are viewable by everyone" 
on opd_sessions for select using (true);

create policy "Sessions can be modified by staff" 
on opd_sessions for all to authenticated using (true);

-- 4. Tokens Policies
create policy "Tokens are viewable by everyone" 
on tokens for select using (true);

-- Insertion is handled by the 'book_token' RPC function (security definer)
-- Direct inserts are blocked for public/anon
create policy "Tokens cannot be inserted directly" 
on tokens for insert with check (false);

create policy "Tokens can be updated by staff" 
on tokens for update to authenticated using (true);

-- 5. Doctor Leaves Policies
create policy "Leaves only viewable/managed by staff" 
on doctor_leaves for all to authenticated using (true);
