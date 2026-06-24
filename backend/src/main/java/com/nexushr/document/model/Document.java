package com.nexushr.document.model;

import com.nexushr.auth.model.User;
import com.nexushr.common.entity.BaseEntity;
import com.nexushr.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Employee owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
