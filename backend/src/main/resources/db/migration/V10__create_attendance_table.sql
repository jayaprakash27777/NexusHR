-- =============================================
-- V10: Create attendance table
-- =============================================
CREATE TABLE attendance (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    check_in_time   TIMESTAMP WITH TIME ZONE,
    check_out_time  TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(20) DEFAULT 'PRESENT' NOT NULL,
    work_hours      DECIMAL(4, 2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
