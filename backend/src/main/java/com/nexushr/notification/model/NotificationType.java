package com.nexushr.notification.model;

public enum NotificationType {
    // Leave
    LEAVE_APPLIED,
    LEAVE_APPROVED,
    LEAVE_REJECTED,
    LEAVE_CANCELLED,

    // Attendance
    ATTENDANCE_REMINDER,
    ATTENDANCE_ALERT,

    // Payroll
    PAYROLL_PROCESSED,
    PAYROLL_PAID,
    PAYSLIP_GENERATED,

    // Performance
    REVIEW_INITIATED,
    REVIEW_SELF_DUE,
    REVIEW_COMPLETED,
    REVIEW_ACKNOWLEDGED,
    GOAL_ASSIGNED,
    GOAL_COMPLETED,

    // Chat
    CHAT_DIRECT_MESSAGE,
    CHAT_TEAM_MESSAGE,
    CHAT_MENTION,

    // System
    AI_INSIGHT,
    SYSTEM,
    ANNOUNCEMENT
}
