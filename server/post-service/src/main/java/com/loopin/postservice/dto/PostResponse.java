package com.loopin.postservice.dto;

import java.util.UUID;

public record PostResponse(
        UUID id,
        String authorUsername,
        String authorGradient,
        String body,
        String tag,
        String mediaLabel,
        String mediaGradient,
        long likeCount,
        boolean likedByCurrentUser,
        long commentCount,
        java.time.Instant createdAt
) {}
