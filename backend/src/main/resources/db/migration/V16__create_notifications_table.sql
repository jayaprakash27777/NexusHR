-- =============================================
-- V16: Create notifications table
-- =============================================

CREATE TABLE notifications (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    reference_id    UUID,
    reference_type  VARCHAR(50),
    is_read         BOOLEAN DEFAULT FALSE NOT NULL,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_notification_type CHECK (type IN (
        'LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED',
        'ATTENDANCE_REMINDER', 'ATTENDANCE_ALERT',
        'PAYROLL_PROCESSED', 'PAYROLL_PAID', 'PAYSLIP_GENERATED',
        'REVIEW_INITIATED', 'REVIEW_SELF_DUE', 'REVIEW_COMPLETED', 'REVIEW_ACKNOWLEDGED',
        'GOAL_ASSIGNED', 'GOAL_COMPLETED',
        'AI_INSIGHT', 'SYSTEM', 'ANNOUNCEMENT'
    ))
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
