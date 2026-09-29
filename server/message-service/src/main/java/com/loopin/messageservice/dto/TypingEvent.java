package com.loopin.messageservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TypingEvent(
        @NotNull UUID conversationId,
        @NotNull UUID userId,
        @NotNull boolean typing
) {}
