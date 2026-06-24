package com.nexushr.enterprise.knowledge.service;

import com.nexushr.enterprise.knowledge.dto.CourseDto;
import com.nexushr.enterprise.knowledge.dto.CourseEnrollmentDto;
import com.nexushr.enterprise.knowledge.entity.Course;
import com.nexushr.enterprise.knowledge.entity.CourseEnrollment;
import com.nexushr.enterprise.knowledge.repository.CourseEnrollmentRepository;
import com.nexushr.enterprise.knowledge.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<CourseDto> getCourseCatalog() {
        return courseRepository.findAll().stream()
                .map(this::mapToCourseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseEnrollmentDto> getEmployeeEnrollments(UUID employeeId) {
        return enrollmentRepository.findByEmployeeIdWithCourse(employeeId).stream()
                .map(this::mapToEnrollmentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void launchCourse(UUID enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if ("NOT_STARTED".equals(enrollment.getStatus())) {
            enrollment.setStatus("IN_PROGRESS");
            enrollment.setProgress(5);
            enrollmentRepository.save(enrollment);
        }
    }

    private CourseDto mapToCourseDto(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .category(course.getCategory())
                .duration(course.getDuration())
                .totalModules(course.getTotalModules())
                .thumbnail(course.getThumbnail())
                .build();
    }

    private CourseEnrollmentDto mapToEnrollmentDto(CourseEnrollment enrollment) {
        return CourseEnrollmentDto.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .title(enrollment.getCourse().getTitle())
                .category(enrollment.getCourse().getCategory())
                .duration(enrollment.getCourse().getDuration())
                .totalModules(enrollment.getCourse().getTotalModules())
                .thumbnail(enrollment.getCourse().getThumbnail())
                .employeeId(enrollment.getEmployee().getId())
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .dueDate(enrollment.getDueDate())
                .completedAt(enrollment.getCompletedAt())
                .build();
    }
}
