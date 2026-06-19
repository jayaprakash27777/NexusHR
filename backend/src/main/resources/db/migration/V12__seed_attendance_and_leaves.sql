-- =============================================
-- V12: Seed attendance and leave balance data
-- =============================================

-- Seed leave balances for current year (2026) for all employees
INSERT INTO leave_balances (employee_id, leave_type, year, total_days, used_days)
SELECT e.id, lt.leave_type, 2026, lt.total_days, 0
FROM employees e
CROSS JOIN (
    VALUES
        ('CASUAL_LEAVE',    12.0),
        ('SICK_LEAVE',      10.0),
        ('EARNED_LEAVE',    15.0),
        ('WORK_FROM_HOME',  24.0)
) AS lt(leave_type, total_days)
WHERE e.status = 'ACTIVE';

-- Seed some used leave balances for demo
UPDATE leave_balances SET used_days = 3 WHERE employee_id = 'e1000001-0000-0000-0000-000000000004' AND leave_type = 'CASUAL_LEAVE' AND year = 2026;
UPDATE leave_balances SET used_days = 2 WHERE employee_id = 'e1000001-0000-0000-0000-000000000005' AND leave_type = 'SICK_LEAVE' AND year = 2026;
UPDATE leave_balances SET used_days = 5 WHERE employee_id = 'e1000001-0000-0000-0000-000000000006' AND leave_type = 'EARNED_LEAVE' AND year = 2026;
UPDATE leave_balances SET used_days = 8 WHERE employee_id = 'e1000001-0000-0000-0000-000000000007' AND leave_type = 'WORK_FROM_HOME' AND year = 2026;

-- Seed some attendance records for the past 5 working days
DO $$
DECLARE
    emp_id UUID;
    work_date DATE;
    day_offset INT;
BEGIN
    FOR emp_id IN SELECT id FROM employees WHERE status = 'ACTIVE'
    LOOP
        FOR day_offset IN 1..5
        LOOP
            work_date := CURRENT_DATE - day_offset;
            -- Skip weekends
            IF EXTRACT(DOW FROM work_date) NOT IN (0, 6) THEN
                INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, work_hours)
                VALUES (
                    emp_id,
                    work_date,
                    work_date + TIME '09:00:00' + (random() * INTERVAL '30 minutes'),
                    work_date + TIME '17:30:00' + (random() * INTERVAL '60 minutes'),
                    'PRESENT',
                    8.0 + round((random() * 2 - 1)::numeric, 1)
                )
                ON CONFLICT (employee_id, date) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add a couple of leave-based attendance records
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, reviewed_at)
VALUES
    ('e1000001-0000-0000-0000-000000000004', 'CASUAL_LEAVE', CURRENT_DATE - 10, CURRENT_DATE - 8, 3, 'Family function', 'APPROVED', 'e1000001-0000-0000-0000-000000000001', NOW() - INTERVAL '9 days'),
    ('e1000001-0000-0000-0000-000000000005', 'SICK_LEAVE', CURRENT_DATE - 15, CURRENT_DATE - 14, 2, 'Not feeling well', 'APPROVED', 'e1000001-0000-0000-0000-000000000001', NOW() - INTERVAL '14 days'),
    ('e1000001-0000-0000-0000-000000000006', 'WORK_FROM_HOME', CURRENT_DATE + 2, CURRENT_DATE + 2, 1, 'Internet installation at home', 'PENDING', NULL, NULL);
