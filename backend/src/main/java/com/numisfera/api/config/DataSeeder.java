package com.numisfera.api.config;

import com.numisfera.api.model.Coin;
import com.numisfera.api.model.Role;
import com.numisfera.api.model.User;
import com.numisfera.api.repository.CoinRepository;
import com.numisfera.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(CoinRepository coinRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setEmail("admin@numisfera.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setWalletAddress("0xAdminWallet123");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);


            }
        };
    }
}
