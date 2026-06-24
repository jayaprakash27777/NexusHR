package com.nexushr.recruitment.model;

import com.nexushr.common.entity.BaseEntity;
import com.nexushr.department.model.Department;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private String location;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OPEN";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;
}
