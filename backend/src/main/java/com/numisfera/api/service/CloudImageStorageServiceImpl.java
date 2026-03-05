package com.numisfera.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "cloud")
public class CloudImageStorageServiceImpl implements ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(CloudImageStorageServiceImpl.class);

    // Constructor could inject AWS S3 or Google Cloud Storage clients

    public CloudImageStorageServiceImpl() {
        logger.info("Cloud storage initialized. (Mock configured for future S3/GCS implementation)");
    }

    @Override
    public String storeImage(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file.jpg";
        }

        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

        // Mock implementation for future cloud upload
        // e.g., s3client.putObject(new PutObjectRequest(bucketName, uniqueFilename,
        // file.getInputStream(), metadata));

        logger.info("MOCK: Uploaded image to cloud storage: {}", uniqueFilename);

        // Return the mock public URL
        return "https://storage.googleapis.com/numisfera-images-prod/" + uniqueFilename;
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("https://storage.googleapis.com/")) {
            return;
        }

        // Mock implementation for future cloud deletion
        logger.info("MOCK: Deleted image from cloud storage: {}", imageUrl);
    }
}
