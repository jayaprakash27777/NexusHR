package com.nexushr.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RecruitmentDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobPostingDto {
        private UUID id;
        private String title;
        private UUID departmentId;
        private String departmentName;
        private String location;
        private String status;
        private String description;
        private String requirements;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String resumeUrl;
        private UUID internalEmployeeId;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobApplicationDto {
        private UUID id;
        private UUID candidateId;
        private CandidateDto candidate;
        private UUID jobPostingId;
        private JobPostingDto jobPosting;
        private String status; // NEW, SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED
        private String notes;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewDto {
        private UUID id;
        private UUID applicationId;
        private JobApplicationDto application;
        private UUID interviewerId;
        private String interviewerName;
        private LocalDateTime scheduledAt;
        private String status;
        private String feedback;
        private Integer rating;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfferDto {
        private UUID id;
        private UUID candidateId;
        private CandidateDto candidate;
        private UUID jobPostingId;
        private JobPostingDto jobPosting;
        private BigDecimal salary;
        private String status;
        private String fileUrl;
        private String notes;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }
}
