package com.nexushr.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import redis.embedded.RedisServer;

@Slf4j
@Configuration
public class EmbeddedRedisConfig {

    private RedisServer redisServer;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @PostConstruct
    public void startRedis() {
        try {
            redisServer = new RedisServer(redisPort);
            redisServer.start();
            log.info("Embedded Redis started on port {}", redisPort);
        } catch (Exception e) {
            log.error("Failed to start embedded Redis. It might already be running.", e);
        }
    }

    @PreDestroy
    public void stopRedis() {
        if (redisServer != null) {
            redisServer.stop();
            log.info("Embedded Redis stopped");
        }
    }
}
