package com.loopin.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest (
        @NotBlank @Pattern(regexp = "^[a-zA-Z0-9._]{3,30}$", message = "3-30 characters: letters, numbers, dot, underscore")
        String username,

        @NotBlank @Size(max=60)
        String name,

        @NotBlank @Size(min=8, message = "Password must be at least 8 characters long")
        String password
) {}
