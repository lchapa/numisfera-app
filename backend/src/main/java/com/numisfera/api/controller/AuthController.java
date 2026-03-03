package com.numisfera.api.controller;

import com.numisfera.api.dto.request.LoginRequest;
import com.numisfera.api.dto.request.RegisterRequest;
import com.numisfera.api.dto.request.Web3LoginRequest;
import com.numisfera.api.dto.response.JwtResponse;
import com.numisfera.api.dto.response.MessageResponse;
import com.numisfera.api.model.Role;
import com.numisfera.api.model.User;
import com.numisfera.api.repository.UserRepository;
import com.numisfera.api.security.jwt.JwtUtils;
import com.numisfera.api.security.services.UserDetailsImpl;
import com.numisfera.api.security.services.Web3AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    Web3AuthService web3AuthService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse(Role.USER_SIMPLE.name());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getWalletAddress(),
                role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: El Email ya está en uso."));
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(Role.USER_SIMPLE);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/web3/login")
    public ResponseEntity<?> authenticateWeb3(@Valid @RequestBody Web3LoginRequest request) {
        // Validate EcRecover signature
        boolean isValid = web3AuthService.verifySignature(request.getPublicAddress(), request.getSignature(),
                request.getMessage());

        if (!isValid) {
            return ResponseEntity.status(401).body(new MessageResponse("Invalid cryptographic signature"));
        }

        // Search for user or register on the fly
        User user = userRepository.findByWalletAddress(request.getPublicAddress()).orElseGet(() -> {
            User newUser = new User();
            newUser.setWalletAddress(request.getPublicAddress());
            newUser.setRole(Role.USER_WALLET); // Auto-assign Metamask role
            return userRepository.save(newUser);
        });

        // We bypass traditional authentication manager because there is no password
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse(Role.USER_WALLET.name());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getWalletAddress(),
                role));
    }
}
