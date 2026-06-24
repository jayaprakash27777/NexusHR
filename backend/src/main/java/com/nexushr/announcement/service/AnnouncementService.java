package com.nexushr.announcement.service;

import com.nexushr.announcement.dto.AnnouncementDto;
import com.nexushr.announcement.dto.CreateAnnouncementRequest;
import com.nexushr.common.dto.PagedResponse;
import java.util.UUID;

public interface AnnouncementService {
    PagedResponse<AnnouncementDto> getVisibleAnnouncements(UUID userId, int page, int size);
    AnnouncementDto createAnnouncement(UUID userId, CreateAnnouncementRequest request);
    void reactToAnnouncement(UUID userId, UUID announcementId, String type);
}
