package com.nexushr.enterprise.featureflag.repository;

import com.nexushr.enterprise.featureflag.model.FeatureFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, UUID> {

    Optional<FeatureFlag> findByFlagKey(String flagKey);

    boolean existsByFlagKey(String flagKey);

    List<FeatureFlag> findAllByEnvironmentAndEnabledTrue(String environment);

    @Query("SELECT f FROM FeatureFlag f WHERE " +
           "(:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(f.flagKey) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:environment IS NULL OR f.environment = :environment)")
    Page<FeatureFlag> searchFlags(
            @Param("search") String search,
            @Param("environment") String environment,
            Pageable pageable
    );
}
