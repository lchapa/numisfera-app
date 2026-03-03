package com.numisfera.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String walletAddress;
    private String role;

    public JwtResponse(String accessToken, Long id, String email, String walletAddress, String role) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.walletAddress = walletAddress;
        this.role = role;
    }
}
