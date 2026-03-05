package com.numisfera.api.repository;

import com.numisfera.api.model.Coin;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
public class CoinRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CoinRepository coinRepository;

    @Test
    public void testSaveAndRetrieveCoin() {
        Coin coin = new Coin();
        coin.setName("Morgan Dollar");
        coin.setCountry("USA");
        coin.setYear(1881);
        coin.setMaterial("Silver");
        coin.setDescription("A famous silver dollar.");
        coin.setGrade("MS-65");
        coin.setImageUrls(java.util.List.of("http://example.com/morgan.jpg"));

        Coin savedCoin = coinRepository.save(coin);

        assertThat(savedCoin.getId()).isNotNull();

        Coin retrievedCoin = entityManager.find(Coin.class, savedCoin.getId());
        assertThat(retrievedCoin).isNotNull();
        assertThat(retrievedCoin.getName()).isEqualTo("Morgan Dollar");
    }
}
