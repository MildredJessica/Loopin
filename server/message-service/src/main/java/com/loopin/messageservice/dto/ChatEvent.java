package com.loopin.messageservice.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatEvent(
        String event,
        UUID conversationId,
        MessageResponse message,
        UUID actorId,
        Instant timestamp
) {}
