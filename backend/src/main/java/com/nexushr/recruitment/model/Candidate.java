package com.nexushr.recruitment.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String resumeUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internal_employee_id")
    private com.nexushr.employee.model.Employee internalEmployee;
}
