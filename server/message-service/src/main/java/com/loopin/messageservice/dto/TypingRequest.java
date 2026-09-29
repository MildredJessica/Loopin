package com.loopin.messageservice.dto;

import java.util.UUID;

public record TypingRequest(
        UUID conversationId,
        boolean typing
) {}