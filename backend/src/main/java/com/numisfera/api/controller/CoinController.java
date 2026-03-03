package com.numisfera.api.controller;

import com.numisfera.api.model.Coin;
import com.numisfera.api.service.CoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/coins")
@CrossOrigin(origins = "http://localhost:5173")
public class CoinController {

    private final CoinService coinService;

    @Autowired
    public CoinController(CoinService coinService) {
        this.coinService = coinService;
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
    public ResponseEntity<Coin> createCoin(@RequestBody Coin coin) {
        Coin savedCoin = coinService.createCoin(coin);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCoin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coin> updateCoin(@PathVariable Long id, @RequestBody Coin coinDetails) {
        Optional<Coin> updatedCoin = coinService.updateCoin(id, coinDetails);
        return updatedCoin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoin(@PathVariable Long id) {
        if (coinService.deleteCoin(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
