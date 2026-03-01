package com.numisfera.api.service;

import com.numisfera.api.model.Coin;
import java.util.List;
import java.util.Optional;

public interface CoinService {
    List<Coin> getAllCoins();

    Optional<Coin> getCoinById(Long id);
}
