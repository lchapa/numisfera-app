package com.numisfera.api.security.services;

import com.numisfera.api.model.User;
import com.numisfera.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Our username could be an email (Simple User) or walletAddress (Web3 User)
        User user = userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByWalletAddress(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with account: " + username)));

        return UserDetailsImpl.build(user);
    }
}
