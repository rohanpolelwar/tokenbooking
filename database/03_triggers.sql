-- Leave Management and Automation Logic

-- 1. Function to handle Unplanned Leave (Same day cancellation)
create or replace function handle_unplanned_leave()
returns trigger
language plpgsql
as $$
begin
    if NEW.type = 'UNPLANNED' and NEW.leave_date = current_date then
        -- Cancel the session for today
        update opd_sessions
        set status = 'CANCELLED'
        where doctor_id = NEW.doctor_id
        and date = NEW.leave_date;

        -- Cancel all booked tokens for cancelled sessions
        update tokens
        set status = 'CANCELLED'
        where session_id in (
            select id from opd_sessions 
            where doctor_id = NEW.doctor_id 
            and date = NEW.leave_date
        )
        and status in ('BOOKED', 'NOW_SERVING');
    end if;
    return NEW;
end;
$$;

create trigger trg_unplanned_leave
after insert on doctor_leaves
for each row
execute function handle_unplanned_leave();


-- 2. Function to prevent session creation on leave dates (Planned Leave)
create or replace function block_session_on_leave_date()
returns trigger
language plpgsql
as $$
begin
    if exists (
        select 1 from doctor_leaves
        where doctor_id = NEW.doctor_id
        and leave_date = NEW.date
    ) then
        raise exception 'Cannot create or open session; Doctor is on leave on %', NEW.date;
    end if;
    return NEW;
end;
$$;

create trigger trg_block_session_on_leave
before insert or update on opd_sessions
for each row
when (NEW.status = 'OPEN')
execute function block_session_on_leave_date();
