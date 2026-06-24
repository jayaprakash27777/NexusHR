package com.nexushr.config.repository;

import com.nexushr.config.model.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, UUID> {
    List<SystemConfiguration> findByIsActiveTrue();
}
