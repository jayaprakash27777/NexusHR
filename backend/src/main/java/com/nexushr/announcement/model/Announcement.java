package com.nexushr.announcement.model;

import com.nexushr.auth.model.User;
import com.nexushr.common.entity.BaseEntity;
import com.nexushr.department.model.Department;
import com.nexushr.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AnnouncementType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_department_id")
    private Department targetDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_team_id")
    private Employee targetTeam; // The manager whose team this belongs to

    @Builder.Default
    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnouncementReaction> reactions = new ArrayList<>();
}
