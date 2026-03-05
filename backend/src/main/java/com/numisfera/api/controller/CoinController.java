package com.numisfera.api.controller;

import com.numisfera.api.model.Coin;
import com.numisfera.api.model.Role;
import com.numisfera.api.model.User;
import com.numisfera.api.repository.UserRepository;
import com.numisfera.api.security.services.UserDetailsImpl;
import com.numisfera.api.service.CoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.numisfera.api.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coins")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CoinController {

    private final CoinService coinService;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper;

    @Value("${app.images.max-uploads:3}")
    private int maxUploads;

    @Autowired
    public CoinController(CoinService coinService, UserRepository userRepository,
            ImageStorageService imageStorageService, ObjectMapper objectMapper) {
        this.coinService = coinService;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
        this.objectMapper = objectMapper;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return userRepository.findById(userDetails.getId()).orElse(null);
        }
        return null;
    }

    private boolean isOwnerOrAdmin(User user, Coin coin) {
        if (user == null)
            return false;
        if (user.getRole() == Role.ADMIN)
            return true;
        return coin.getOwner() != null && coin.getOwner().getId().equals(user.getId());
    }

    @GetMapping
    public ResponseEntity<List<Coin>> getAllCoins() {
        return ResponseEntity.ok(coinService.getAllCoins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coin> getCoinById(@PathVariable Long id) {
        Optional<Coin> coin = coinService.getCoinById(id);
        return coin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = { "multipart/form-data", "application/json" })
    public ResponseEntity<?> createCoin(
            @RequestPart(value = "coin", required = false) String coinJsonStr,
            @RequestBody(required = false) Coin coinBody,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        try {
            User user = getAuthenticatedUser();
            if (user == null || user.getRole() == Role.USER_SIMPLE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only wallets and admins can create coins.");
            }

            Coin coin = coinBody != null ? coinBody : objectMapper.readValue(coinJsonStr, Coin.class);
            coin.setOwner(user);

            if (images != null && images.length > maxUploads) {
                return ResponseEntity.badRequest().body("Maximum " + maxUploads + " images allowed.");
            }

            List<String> imageUrls = new ArrayList<>();
            if (images != null) {
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        String url = imageStorageService.storeImage(file);
                        imageUrls.add(url);
                    }
                }
            }
            coin.setImageUrls(imageUrls);

            Coin savedCoin = coinService.createCoin(coin);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCoin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing request: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data", "application/json" })
    public ResponseEntity<?> updateCoin(
            @PathVariable Long id,
            @RequestPart(value = "coin", required = false) String coinJsonStr,
            @RequestBody(required = false) Coin coinBody,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        try {
            User user = getAuthenticatedUser();
            Optional<Coin> existingCoinOpt = coinService.getCoinById(id);

            if (existingCoinOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Coin existingCoin = existingCoinOpt.get();
            if (!isOwnerOrAdmin(user, existingCoin)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to edit.");
            }

            Coin coinDetails = coinBody != null ? coinBody : objectMapper.readValue(coinJsonStr, Coin.class);

            if (images != null && images.length > maxUploads) {
                return ResponseEntity.badRequest().body("Maximum " + maxUploads + " images allowed.");
            }

            if (images != null && images.length > 0) {
                for (String oldImg : existingCoin.getImageUrls()) {
                    imageStorageService.deleteImage(oldImg);
                }

                List<String> imageUrls = new ArrayList<>();
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        String url = imageStorageService.storeImage(file);
                        imageUrls.add(url);
                    }
                }
                coinDetails.setImageUrls(imageUrls);
            } else {
                coinDetails.setImageUrls(existingCoin.getImageUrls());
            }

            Optional<Coin> updatedCoin = coinService.updateCoin(id, coinDetails);
            return updatedCoin.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing request: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoin(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Optional<Coin> existingCoin = coinService.getCoinById(id);

        if (existingCoin.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwnerOrAdmin(user, existingCoin.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to delete.");
        }

        coinService.deleteCoin(id);
        return ResponseEntity.noContent().build();
    }
}
