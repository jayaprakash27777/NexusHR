package com.nexushr.config;

import com.nexushr.chat.model.converter.MessageAttributeConverter;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionConfig {

    @Value("${nexushr.security.encryption.master-key:0123456789abcdef0123456789abcdef}")
    private String masterKey;

    @PostConstruct
    public void init() {
        MessageAttributeConverter.setEncryptionKey(masterKey);
    }
}
