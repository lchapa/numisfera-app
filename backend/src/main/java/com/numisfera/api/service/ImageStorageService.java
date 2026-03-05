package com.numisfera.api.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ImageStorageService {
    /**
     * Stores an image file and returns the public URL or relative path to access
     * it.
     */
    String storeImage(MultipartFile file) throws IOException;

    /**
     * Deletes an image given its URL or path.
     */
    void deleteImage(String imageUrl);
}
