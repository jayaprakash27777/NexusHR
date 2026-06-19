package com.nexushr.chat.dto;

import com.nexushr.chat.model.enums.ConversationType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateConversationRequest {

    @NotNull
    private ConversationType type;

    private String name;

    @NotNull
    @Size(min = 1, message = "At least one participant must be specified")
    private List<UUID> participantIds;
}
