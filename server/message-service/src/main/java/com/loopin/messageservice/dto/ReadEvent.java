package com.loopin.messageservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReadEvent(
        @NotNull UUID conversationId
) {}
