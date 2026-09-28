package com.loopin.userservice.client;

import java.util.UUID;

public record NotificationEvent(
        String recipientUsername,
        UUID actorId,
        String actorUsername,
        String actorGradient,
        String type,
        String message
) {}
