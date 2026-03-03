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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coins")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CoinController {

    private final CoinService coinService;
    private final UserRepository userRepository;

    @Autowired
    public CoinController(CoinService coinService, UserRepository userRepository) {
        this.coinService = coinService;
        this.userRepository = userRepository;
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

    @PostMapping
    public ResponseEntity<?> createCoin(@RequestBody Coin coin) {
        User user = getAuthenticatedUser();
        if (user == null || user.getRole() == Role.USER_SIMPLE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only wallets and admins can create coins.");
        }
        coin.setOwner(user);
        Coin savedCoin = coinService.createCoin(coin);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCoin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoin(@PathVariable Long id, @RequestBody Coin coinDetails) {
        User user = getAuthenticatedUser();
        Optional<Coin> existingCoin = coinService.getCoinById(id);

        if (existingCoin.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isOwnerOrAdmin(user, existingCoin.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to edit.");
        }

        Optional<Coin> updatedCoin = coinService.updateCoin(id, coinDetails);
        return updatedCoin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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
