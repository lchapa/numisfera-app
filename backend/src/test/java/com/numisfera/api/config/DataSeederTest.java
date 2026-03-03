package com.numisfera.api.config;

import com.numisfera.api.repository.CoinRepository;
import com.numisfera.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class DataSeederTest {

    @Autowired
    private CoinRepository coinRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testDataSeeding() {
        // Assert that at least some data is seeded by the DataSeeder on startup
        long coinCount = coinRepository.count();
        assertThat(coinCount).isGreaterThan(0);

        long userCount = userRepository.count();
        assertThat(userCount).isGreaterThan(0);
    }
}
