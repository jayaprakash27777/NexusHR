package com.nexushr.chat.websocket;

import lombok.Data;
import java.util.UUID;

@Data
public class EditMessageRequest {
    private UUID messageId;
    private String newContent;
}
