package com.nexushr.chat.model.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Converter
public class MessageAttributeConverter implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(MessageAttributeConverter.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final String PREFIX = "ENC::v1::";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private static byte[] keyBytes;
    private static SecretKeySpec secretKeySpec;
    private static final SecureRandom secureRandom = new SecureRandom();

    public static void setEncryptionKey(String key) {
        if (key == null || key.length() < 32) {
            log.error("Encryption key is too short! Must be at least 32 characters (256 bits).");
            throw new IllegalArgumentException("Invalid encryption key length");
        }
        // Use first 32 bytes for AES-256
        keyBytes = key.substring(0, 32).getBytes(StandardCharsets.UTF_8);
        secretKeySpec = new SecretKeySpec(keyBytes, "AES");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }

        if (secretKeySpec == null) {
            log.warn("Encryption key not set. Saving message as plain-text.");
            return attribute;
        }

        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, parameterSpec);
            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            String base64Iv = Base64.getEncoder().encodeToString(iv);
            String base64CipherText = Base64.getEncoder().encodeToString(cipherText);

            return PREFIX + base64Iv + "::" + base64CipherText;
        } catch (Exception e) {
            log.error("Failed to encrypt message content", e);
            throw new RuntimeException("Encryption error", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        if (!dbData.startsWith(PREFIX)) {
            // Legacy plain-text message
            return dbData;
        }

        if (secretKeySpec == null) {
            log.error("Encryption key not set. Cannot decrypt message.");
            return "[[Encrypted Message]]";
        }

        try {
            String[] parts = dbData.substring(PREFIX.length()).split("::");
            if (parts.length != 2) {
                log.error("Invalid encrypted message format");
                return "[[Corrupted Message]]";
            }

            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] cipherText = Base64.getDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, parameterSpec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt message content", e);
            return "[[Decryption Failed]]";
        }
    }
}
