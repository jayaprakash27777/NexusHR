package com.nexushr.settings.repository;

import com.nexushr.settings.model.OrganizationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationSettingRepository extends JpaRepository<OrganizationSetting, UUID> {
    Optional<OrganizationSetting> findBySettingKey(String settingKey);
    List<OrganizationSetting> findByIsPublicTrue();
}
