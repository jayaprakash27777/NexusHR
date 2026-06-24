ALTER TABLE attendance DROP CONSTRAINT IF EXISTS chk_attendance_status;
ALTER TABLE attendance ADD CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'WORK_FROM_HOME', 'ON_LEAVE', 'HALF_DAY', 'LEAVE'));
