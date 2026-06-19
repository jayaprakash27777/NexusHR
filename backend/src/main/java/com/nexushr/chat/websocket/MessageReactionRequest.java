package com.nexushr.chat.websocket;

import lombok.Data;
import java.util.UUID;

@Data
public class MessageReactionRequest {
    private UUID messageId;
    private String reaction;
}
