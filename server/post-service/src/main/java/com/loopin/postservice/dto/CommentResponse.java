package com.loopin.postservice.dto;

import java.util.UUID;

public record CommentResponse(
        UUID id,
        String authorUsername,
        String authorGradient,
        String text,
        java.time.Instant createdAt
) {}
