package com.loopin.notificationservice.dto;

import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID actorId,
        String actorUsername,
        String actorGradient,
        String type,
        String message,
        boolean read,
        java.time.Instant createdAt
) {}
