package com.numisfera.api.service;

import com.numisfera.api.model.Coin;
import com.numisfera.api.repository.CoinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CoinServiceImpl implements CoinService {

    private final CoinRepository coinRepository;

    @Autowired
    public CoinServiceImpl(CoinRepository coinRepository) {
        this.coinRepository = coinRepository;
    }

    @Override
    public List<Coin> getAllCoins() {
        return coinRepository.findAll();
    }

    @Override
    public Optional<Coin> getCoinById(Long id) {
        return coinRepository.findById(id);
    }
}
