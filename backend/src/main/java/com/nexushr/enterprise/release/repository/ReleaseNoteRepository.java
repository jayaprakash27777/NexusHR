package com.nexushr.enterprise.release.repository;

import com.nexushr.enterprise.release.model.ReleaseNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReleaseNoteRepository extends JpaRepository<ReleaseNote, UUID> {

    Optional<ReleaseNote> findByVersion(String version);

    boolean existsByVersion(String version);

    @Query("SELECT r FROM ReleaseNote r WHERE " +
           "(:search IS NULL OR LOWER(r.version) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:published IS NULL OR r.published = :published)")
    Page<ReleaseNote> searchReleases(
            @Param("search") String search,
            @Param("published") Boolean published,
            Pageable pageable
    );
}
