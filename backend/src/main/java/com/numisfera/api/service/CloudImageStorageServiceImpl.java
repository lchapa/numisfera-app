package com.numisfera.api.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "cloud")
public class CloudImageStorageServiceImpl implements ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(CloudImageStorageServiceImpl.class);
    private final Storage storage;

    @Value("${gcp.bucket.id:numisfera-images-prod}")
    private String bucketName;

    public CloudImageStorageServiceImpl() {
        this.storage = StorageOptions.getDefaultInstance().getService();
        logger.info("Real Google Cloud Storage initialized.");
    }

    @Override
    public String storeImage(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file.jpg";
        }

        // Clean filename and create uniqueness
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

        BlobId blobId = BlobId.of(bucketName, uniqueFilename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(file.getContentType()).build();

        // Upload to GCS
        storage.create(blobInfo, file.getBytes());

        logger.info("Uploaded image to Google Cloud Storage: {}", uniqueFilename);

        // Return the public URL for the newly created blob
        return "https://storage.googleapis.com/" + bucketName + "/" + uniqueFilename;
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("https://storage.googleapis.com/")) {
            return;
        }

        try {
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            BlobId blobId = BlobId.of(bucketName, filename);
            boolean deleted = storage.delete(blobId);
            if (deleted) {
                logger.info("Deleted image from Cloud Storage: {}", filename);
            } else {
                logger.warn("Image not found in Cloud Storage for deletion: {}", filename);
            }
        } catch (Exception e) {
            logger.error("Error deleting image from GCS: {}", imageUrl, e);
        }
    }
}
