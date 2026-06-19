package com.nexushr.common.storage;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;

public interface FileStorageService {
    String storeFile(MultipartFile file, String directory);
    Path loadFileAsResource(String fileName, String directory);
    void deleteFile(String fileName, String directory);
}
