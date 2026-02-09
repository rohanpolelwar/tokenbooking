-- Verification Tests for Clinic Token Booking System

-- 1. Verify FCFS Ordering
-- Should return tokens 1 and 2 for Today's session
select token_number, patient_name 
from tokens 
where session_id = (select id from opd_sessions where date = current_date limit 1)
order by token_number;

-- 2. Test Capacity Limit
-- Session for Today has max_tokens = 5. We already have 2.
-- Let's book 3 more. 
select book_token((select id from opd_sessions where date = current_date limit 1), 'Patient 3', '000');
select book_token((select id from opd_sessions where date = current_date limit 1), 'Patient 4', '000');
select book_token((select id from opd_sessions where date = current_date limit 1), 'Patient 5', '000');

-- The 6th booking should FAIL with 'Session is full'
-- select book_token((select id from opd_sessions where date = current_date limit 1), 'Patient 6', '000');


-- 3. Test Unplanned Leave (Same Day)
-- Insert unplanned leave for today
insert into doctor_leaves (doctor_id, leave_date, type, reason)
values (
    (select id from doctors limit 1),
    current_date,
    'UNPLANNED',
    'Emergency'
);

-- Verify session is cancelled
select status from opd_sessions where date = current_date;

-- Verify all tokens for today are cancelled
select count(*) from tokens 
where session_id = (select id from opd_sessions where date = current_date limit 1)
and status = 'CANCELLED';


-- 4. Test Planned Leave (Future)
-- Insert planned leave for tomorrow
insert into doctor_leaves (doctor_id, leave_date, type, reason)
values (
    (select id from doctors limit 1),
    current_date + interval '2 days',
    'PLANNED',
    'Conference'
);

-- Try to create a session on that date (Should FAIL)
-- insert into opd_sessions (doctor_id, date, start_time, end_time, max_tokens, status)
-- values ((select id from doctors limit 1), current_date + interval '2 days', '09:00', '12:00', 10, 'OPEN');
