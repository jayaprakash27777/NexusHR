package com.nexushr.announcement.service;

import com.nexushr.announcement.dto.AnnouncementDto;
import com.nexushr.announcement.dto.CreateAnnouncementRequest;
import com.nexushr.announcement.model.Announcement;
import com.nexushr.announcement.model.AnnouncementReaction;
import com.nexushr.announcement.model.AnnouncementType;
import com.nexushr.announcement.repository.AnnouncementReactionRepository;
import com.nexushr.announcement.repository.AnnouncementRepository;
import com.nexushr.auth.model.User;
import com.nexushr.auth.model.Role;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AnnouncementDto> getVisibleAnnouncements(UUID userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Employee employee = employeeRepository.findByUserId(userId).orElse(null);
        UUID departmentId = employee != null && employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        UUID managerId = employee != null && employee.getManager() != null ? employee.getManager().getId() : null;

        Page<Announcement> announcements = announcementRepository.findVisibleAnnouncements(
                departmentId, managerId, PageRequest.of(page, size));

        return PagedResponse.<AnnouncementDto>builder()
                .content(announcements.getContent().stream().map(a -> mapToDto(a, userId)).collect(Collectors.toList()))
                .page(announcements.getNumber())
                .size(announcements.getSize())
                .totalElements(announcements.getTotalElements())
                .totalPages(announcements.getTotalPages())
                .last(announcements.isLast())
                .first(announcements.isFirst())
                .build();
    }

    @Override
    @Transactional
    public AnnouncementDto createAnnouncement(UUID userId, CreateAnnouncementRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Set<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toSet());
        
        Employee employee = employeeRepository.findByUserId(userId).orElse(null);

        // RBAC Checks
        switch (request.getType()) {
            case GLOBAL:
                if (!roles.contains("ROLE_SUPER_ADMIN") && !roles.contains("ROLE_ADMIN") && !roles.contains("ROLE_HR_DIRECTOR")) {
                    throw new AccessDeniedException("You do not have permission to create GLOBAL announcements");
                }
                break;
            case HR:
                if (!roles.contains("ROLE_HR_DIRECTOR") && !roles.contains("ROLE_HR_EXECUTIVE")) {
                    throw new AccessDeniedException("You do not have permission to create HR announcements");
                }
                break;
            case FINANCE:
                if (!roles.contains("ROLE_FINANCE_MANAGER")) {
                    throw new AccessDeniedException("You do not have permission to create FINANCE announcements");
                }
                break;
            case DEPARTMENT:
                if (!roles.contains("ROLE_DEPARTMENT_MANAGER")) {
                    throw new AccessDeniedException("You do not have permission to create DEPARTMENT announcements");
                }
                break;
            case TEAM:
                if (!roles.contains("ROLE_MANAGER") && !roles.contains("ROLE_TEAM_LEAD")) {
                    throw new AccessDeniedException("You do not have permission to create TEAM announcements");
                }
                break;
        }

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .author(user)
                .targetDepartment(request.getType() == AnnouncementType.DEPARTMENT && employee != null ? employee.getDepartment() : null)
                .targetTeam(request.getType() == AnnouncementType.TEAM && employee != null ? employee : null)
                .build();

        announcement = announcementRepository.save(announcement);
        return mapToDto(announcement, userId);
    }

    @Override
    @Transactional
    public void reactToAnnouncement(UUID userId, UUID announcementId, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", announcementId));

        reactionRepository.findByAnnouncementIdAndUserIdAndType(announcementId, userId, type)
                .ifPresentOrElse(
                    // Toggle reaction: if it exists, remove it
                    reactionRepository::delete,
                    () -> {
                        AnnouncementReaction reaction = AnnouncementReaction.builder()
                                .announcement(announcement)
                                .user(user)
                                .type(type)
                                .build();
                        reactionRepository.save(reaction);
                    }
                );
    }

    private AnnouncementDto mapToDto(Announcement a, UUID currentUserId) {
        long count = a.getReactions().size();
        boolean userReacted = a.getReactions().stream()
                .anyMatch(r -> r.getUser().getId().equals(currentUserId));
        
        Employee authorEmployee = employeeRepository.findByUserId(a.getAuthor().getId()).orElse(null);
        String authorName = authorEmployee != null ? authorEmployee.getFullName() : a.getAuthor().getEmail();
        String authorAvatar = authorEmployee != null ? authorEmployee.getAvatarUrl() : null;

        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .type(a.getType())
                .authorId(a.getAuthor().getId())
                .authorName(authorName)
                .authorAvatar(authorAvatar)
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)
                .reactionCount((int) count)
                .userReacted(userReacted)
                .build();
    }
}
