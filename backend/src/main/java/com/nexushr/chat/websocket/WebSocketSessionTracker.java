package com.nexushr.chat.websocket;

import com.nexushr.auth.model.User;
import com.nexushr.auth.model.enums.PresenceStatus;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.PresenceUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketSessionTracker {

    // Maps sessionId -> email
    private final Map<String, String> sessionMap = new ConcurrentHashMap<>();
    
    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final RedisPubSubService redisPubSubService;

    private static final String SESSIONS_KEY_PREFIX = "user:sessions:";

    @EventListener
    @Transactional
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        if (event.getUser() != null) {
            String email = event.getUser().getName();
            sessionMap.put(sessionId, email);
            log.info("WebSocket Session Connected: {} for user: {}", sessionId, email);
            
            userRepository.findByEmail(email).ifPresent(user -> {
                String key = SESSIONS_KEY_PREFIX + user.getId();
                Long activeSessions = redisTemplate.opsForValue().increment(key);
                
                if (activeSessions != null && activeSessions == 1L) {
                    // First session connected, mark ONLINE
                    user.setPresenceStatus(PresenceStatus.ONLINE);
                    userRepository.save(user);
                    
                    PresenceUpdateDto dto = PresenceUpdateDto.builder()
                            .userId(user.getId())
                            .status(PresenceStatus.ONLINE)
                            .lastSeenAt(null)
                            .build();
                    redisPubSubService.broadcastPresence(dto);
                }
            });
        }
    }

    @EventListener
    @Transactional
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        String email = sessionMap.remove(sessionId);
        if (email != null) {
            log.info("WebSocket Session Disconnected: {} for user: {}", sessionId, email);
            
            userRepository.findByEmail(email).ifPresent(user -> {
                String key = SESSIONS_KEY_PREFIX + user.getId();
                Long activeSessions = redisTemplate.opsForValue().decrement(key);
                
                if (activeSessions != null && activeSessions <= 0L) {
                    // Last session disconnected, mark OFFLINE
                    redisTemplate.delete(key);
                    user.setPresenceStatus(PresenceStatus.OFFLINE);
                    user.setLastSeenAt(java.time.LocalDateTime.now());
                    userRepository.save(user);
                    
                    PresenceUpdateDto dto = PresenceUpdateDto.builder()
                            .userId(user.getId())
                            .status(PresenceStatus.OFFLINE)
                            .lastSeenAt(user.getLastSeenAt())
                            .build();
                    redisPubSubService.broadcastPresence(dto);
                }
            });
        }
    }

    public int getActiveSessionCount() {
        return sessionMap.size();
    }
}
