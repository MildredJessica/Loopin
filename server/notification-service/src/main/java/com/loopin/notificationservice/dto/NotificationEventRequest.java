package com.loopin.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Payload posted by other services (post-service, user-service) to create a notification. */
public record NotificationEventRequest(
        @NotBlank String recipientUsername,
        @NotNull UUID actorId,
        @NotBlank String actorUsername,
        @NotBlank String actorGradient,
        @NotBlank String type,
        @NotBlank String message
) {}
