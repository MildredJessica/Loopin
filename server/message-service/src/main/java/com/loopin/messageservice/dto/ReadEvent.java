package com.loopin.messageservice.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record ReadEvent(
        @NotNull UUID conversationId,
        @NotNull UUID userId,
        @NotNull Instant readAt
) {}
