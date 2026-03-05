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

    @Override
    public Coin createCoin(Coin coin) {
        return coinRepository.save(coin);
    }

    @Override
    public Optional<Coin> updateCoin(Long id, Coin coinDetails) {
        return coinRepository.findById(id).map(existingCoin -> {
            existingCoin.setName(coinDetails.getName());
            existingCoin.setCountry(coinDetails.getCountry());
            existingCoin.setYear(coinDetails.getYear());
            existingCoin.setMaterial(coinDetails.getMaterial());
            existingCoin.setDescription(coinDetails.getDescription());
            existingCoin.setGrade(coinDetails.getGrade());
            existingCoin.setImageUrls(coinDetails.getImageUrls());
            return coinRepository.save(existingCoin);
        });
    }

    @Override
    public boolean deleteCoin(Long id) {
        return coinRepository.findById(id).map(existingCoin -> {
            coinRepository.delete(existingCoin);
            return true;
        }).orElse(false);
    }
}
