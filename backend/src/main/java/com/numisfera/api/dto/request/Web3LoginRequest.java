package com.numisfera.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Web3LoginRequest {
    @NotBlank
    private String publicAddress;

    @NotBlank
    private String signature;

    @NotBlank
    private String message;
}
