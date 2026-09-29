package com.loopin.userservice.dto;

import java.util.UUID;

public record MessagingProfileResponse(
        UUID id,
        String username,
        String name,
        String avatarGradient,
        boolean followsTarget
) {}
