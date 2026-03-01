package com.numisfera.api.config;

import com.numisfera.api.model.Coin;
import com.numisfera.api.repository.CoinRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(CoinRepository coinRepository) {
        return args -> {
            if (coinRepository.count() == 0) {
                Coin coin1 = new Coin();
                coin1.setName("Centenario");
                coin1.setCountry("Mexico");
                coin1.setYear(1921);
                coin1.setMaterial("Gold");
                coin1.setDescription(
                        "50 pesos gold coin commemorating the 100th anniversary of Mexico's independence.");
                coin1.setGrade("MS-62");
                coin1.setImageUrl("dummy-url-1.jpg");

                Coin coin2 = new Coin();
                coin2.setName("Morgan Dollar");
                coin2.setCountry("USA");
                coin2.setYear(1881);
                coin2.setMaterial("Silver");
                coin2.setDescription("Classic silver dollar minted from 1878 to 1904, and again in 1921.");
                coin2.setGrade("MS-64");
                coin2.setImageUrl("dummy-url-2.jpg");

                coinRepository.saveAll(List.of(coin1, coin2));
            }
        };
    }
}
