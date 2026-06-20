package com.nexushr.config;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import redis.embedded.RedisServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.PriorityOrdered;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class EmbeddedInfrastructureConfig implements BeanFactoryPostProcessor, PriorityOrdered {
    
    private static final Logger log = LoggerFactory.getLogger(EmbeddedInfrastructureConfig.class);

    private static EmbeddedPostgres postgres;
    private static RedisServer redisServer;

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        if (postgres != null) return;
        
        if (System.getenv("SPRING_DATASOURCE_URL") != null) {
            log.info("SPRING_DATASOURCE_URL is present. Skipping embedded infrastructure.");
            return;
        }

        log.info("Starting local fallback infrastructure (PostgreSQL & Redis)...");

        // 1. Start Redis
        try {
            redisServer = new RedisServer(6379);
            redisServer.start();
            log.info("Embedded Redis started on port 6379");
        } catch (Exception e) {
            log.warn("Embedded Redis failed to start (may already be running): {}", e.getMessage());
        }

        // 2. Start PostgreSQL
        try {
            File dataDir = new File(System.getProperty("user.dir"), "postgres-data-4");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }

            postgres = EmbeddedPostgres.builder()
                    .setPort(5433)
                    .setDataDirectory(dataDir)
                    .setCleanDataDirectory(false)
                    .start();
            
            log.info("Embedded PostgreSQL started on port 5433");

            // 3. Initialize Database and User if needed
            DataSource defaultDs = postgres.getPostgresDatabase();
            try (Connection conn = defaultDs.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                try {
                    stmt.execute("CREATE USER nexushr WITH PASSWORD 'nexushr_secret'");
                    log.info("Created user 'nexushr'");
                } catch (Exception e) {}

                try {
                    stmt.execute("CREATE DATABASE nexushr OWNER nexushr");
                    log.info("Created database 'nexushr'");
                } catch (Exception e) {}
            }

            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try { if (postgres != null) postgres.close(); } catch (Exception e) {}
                try { if (redisServer != null) redisServer.stop(); } catch (Exception e) {}
            }));

        } catch (Exception e) {
            log.warn("Embedded PostgreSQL failed to start (may already be running): {}", e.getMessage());
        }
    }
}
