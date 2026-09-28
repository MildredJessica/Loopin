package com.loopin.postservice.client;

import java.util.UUID;

public record NotificationEvent(
        String recipientUsername,
        UUID actorId,
        String actorUsername,
        String actorGradient,
        String type,   // LIKE | COMMENT
        String message
) {}
