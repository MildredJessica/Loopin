package com.loopin.messageservice.dto;

import java.util.UUID;

public record UserMessagingProfile(
        UUID id,
        String username,
        String name,
        String avatarGradient,
        boolean followsTarget
) {}
