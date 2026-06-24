package com.nexushr.announcement.repository;

import com.nexushr.announcement.model.Announcement;
import com.nexushr.announcement.model.AnnouncementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    @Query("SELECT a FROM Announcement a " +
           "WHERE a.type IN ('GLOBAL', 'HR', 'FINANCE') " +
           "OR (a.type = 'DEPARTMENT' AND a.targetDepartment.id = :departmentId) " +
           "OR (a.type = 'TEAM' AND a.targetTeam.id = :managerId) " +
           "ORDER BY a.createdAt DESC")
    Page<Announcement> findVisibleAnnouncements(
            @Param("departmentId") UUID departmentId,
            @Param("managerId") UUID managerId,
            Pageable pageable);
}
