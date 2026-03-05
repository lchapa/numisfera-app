package com.numisfera.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalImageStorageServiceImpl implements ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalImageStorageServiceImpl.class);

    private final Path uploadLocation;
    private final String baseUrl;

    public LocalImageStorageServiceImpl(@Value("${app.storage.local.upload-dir:uploads}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = "/api/uploads/";

        try {
            Files.createDirectories(this.uploadLocation);
            logger.info("Local storage initialized at: {}", this.uploadLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeImage(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file.jpg";
        }

        // Generate a unique file name
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetLocation = this.uploadLocation.resolve(uniqueFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored image locally: {}", targetLocation);

            // Return relative URL for frontend consumption
            return baseUrl + uniqueFilename;
        } catch (IOException ex) {
            throw new IOException("Could not store file " + uniqueFilename + ". Please try again!", ex);
        }
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(baseUrl)) {
            return;
        }

        String filename = imageUrl.substring(baseUrl.length());
        Path targetLocation = this.uploadLocation.resolve(filename);

        try {
            boolean deleted = Files.deleteIfExists(targetLocation);
            if (deleted) {
                logger.info("Deleted local image: {}", targetLocation);
            }
        } catch (IOException e) {
            logger.error("Failed to delete image: {}", targetLocation, e);
        }
    }
}
