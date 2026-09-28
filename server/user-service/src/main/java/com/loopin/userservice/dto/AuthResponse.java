package com.loopin.userservice.dto;

public record AuthResponse(
        String token,
        String username,
        String name,
        String avatarGradient
) {}
