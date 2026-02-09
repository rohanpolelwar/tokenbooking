-- Core Schema for Clinic Token Booking System

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type session_status as enum ('OPEN', 'CLOSED', 'CANCELLED');
create type token_status as enum ('BOOKED', 'NOW_SERVING', 'SERVED', 'SKIPPED', 'CANCELLED');
create type leave_type as enum ('PLANNED', 'UNPLANNED');

-- 1. Clinics
create table clinics (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    address text,
    created_at timestamp with time zone default now()
);

-- 2. Doctors
create table doctors (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references clinics(id) on delete cascade,
    name text not null,
    specialization text,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 3. OPD Sessions
create table opd_sessions (
    id uuid primary key default uuid_generate_v4(),
    doctor_id uuid references doctors(id) on delete cascade,
    date date not null,
    start_time time not null,
    end_time time not null,
    max_tokens int not null check (max_tokens > 0),
    status session_status default 'OPEN',
    created_at timestamp with time zone default now()
);

-- 4. Tokens (FCFS Engine)
create table tokens (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references opd_sessions(id) on delete cascade,
    token_number int not null,
    patient_name text not null,
    patient_phone text not null,
    status token_status default 'BOOKED',
    created_at timestamp with time zone default now(),
    served_at timestamp with time zone,
    
    unique (session_id, token_number)
);

-- 5. Doctor Leaves
create table doctor_leaves (
    id uuid primary key default uuid_generate_v4(),
    doctor_id uuid references doctors(id) on delete cascade,
    leave_date date not null,
    type leave_type not null,
    reason text,
    created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_tokens_session_id on tokens (session_id);
create index idx_opd_sessions_doctor_date on opd_sessions (doctor_id, date);
create index idx_tokens_status on tokens (status);
