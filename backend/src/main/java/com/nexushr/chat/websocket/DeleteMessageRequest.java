package com.nexushr.chat.websocket;

import lombok.Data;
import java.util.UUID;

@Data
public class DeleteMessageRequest {
    private UUID messageId;
}
