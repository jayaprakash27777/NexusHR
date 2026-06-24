package com.nexushr.settings.service;

import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.settings.model.OrganizationSetting;
import com.nexushr.settings.repository.OrganizationSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final OrganizationSettingRepository settingsRepository;

    public List<OrganizationSetting> getAllSettings() {
        return settingsRepository.findAll();
    }

    public List<OrganizationSetting> getPublicSettings() {
        return settingsRepository.findByIsPublicTrue();
    }

    public OrganizationSetting getSettingByKey(String key) {
        return settingsRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("OrganizationSetting", "key", key));
    }

    @Transactional
    public OrganizationSetting updateSetting(String key, String value) {
        OrganizationSetting setting = getSettingByKey(key);
        setting.setSettingValue(value);
        return settingsRepository.save(setting);
    }
}
