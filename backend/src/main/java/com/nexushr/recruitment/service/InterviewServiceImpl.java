package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.recruitment.dto.RecruitmentDtos.InterviewDto;
import com.nexushr.recruitment.model.Interview;
import com.nexushr.recruitment.model.JobApplication;
import com.nexushr.recruitment.repository.InterviewRepository;
import com.nexushr.recruitment.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EmployeeRepository employeeRepository;
    private final RecruitmentAuditService auditService;

    @Override
    public List<InterviewDto> getByApplication(UUID applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<InterviewDto> schedule(InterviewDto request) {
        JobApplication app = jobApplicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", request.getApplicationId()));
        
        Employee interviewer = null;
        if (request.getInterviewerId() != null) {
            interviewer = employeeRepository.findById(request.getInterviewerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInterviewerId()));
        }

        Interview interview = Interview.builder()
                .application(app)
                .interviewer(interviewer)
                .scheduledAt(request.getScheduledAt())
                .status("SCHEDULED")
                .build();

        Interview saved = interviewRepository.save(interview);
        auditService.logAction("INTERVIEW", saved.getId(), "SCHEDULED", "Interview scheduled for " + saved.getScheduledAt());

        return ApiResponse.<InterviewDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<InterviewDto> submitFeedback(UUID id, String feedback, Integer rating) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));
        
        interview.setFeedback(feedback);
        interview.setRating(rating);
        interview.setStatus("COMPLETED");

        Interview saved = interviewRepository.save(interview);
        auditService.logAction("INTERVIEW", saved.getId(), "FEEDBACK_SUBMITTED", "Feedback submitted with rating " + rating);

        return ApiResponse.<InterviewDto>builder().success(true).data(mapToDto(saved)).build();
    }

    private InterviewDto mapToDto(Interview i) {
        return InterviewDto.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .interviewerId(i.getInterviewer() != null ? i.getInterviewer().getId() : null)
                .interviewerName(i.getInterviewer() != null ? i.getInterviewer().getFirstName() + " " + i.getInterviewer().getLastName() : null)
                .scheduledAt(i.getScheduledAt())
                .status(i.getStatus())
                .feedback(i.getFeedback())
                .rating(i.getRating())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
