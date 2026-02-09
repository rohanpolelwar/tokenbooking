-- Seed Data for Testing

-- 1. Insert Clinic
insert into clinics (name, address) 
values ('Care Clinic', '123 Health St, Bangalore');

-- 2. Insert Doctor
insert into doctors (clinic_id, name, specialization)
values (
    (select id from clinics limit 1), 
    'Dr. Smith', 
    'General Physician'
);

-- 3. Insert OPD Session for Today
insert into opd_sessions (doctor_id, date, start_time, end_time, max_tokens, status)
values (
    (select id from doctors limit 1),
    current_date,
    '09:00:00',
    '12:00:00',
    5,
    'OPEN'
);

-- 4. Insert OPD Session for Tomorrow
insert into opd_sessions (doctor_id, date, start_time, end_time, max_tokens, status)
values (
    (select id from doctors limit 1),
    current_date + interval '1 day',
    '09:00:00',
    '12:00:00',
    50,
    'OPEN'
);

-- 5. Book Tokens via RPC (Simulating Patient Booking)
select book_token(
    (select id from opd_sessions where date = current_date limit 1),
    'John Doe',
    '9876543210'
);

select book_token(
    (select id from opd_sessions where date = current_date limit 1),
    'Jane Smith',
    '9123456789'
);
