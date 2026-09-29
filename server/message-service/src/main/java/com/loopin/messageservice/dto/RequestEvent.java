package com.loopin.messageservice.dto;

import com.loopin.messageservice.model.ConversationStatus;

import java.util.UUID;

public record RequestEvent(
        UUID conversationId,
        UUID userId,
        ConversationStatus status
) {}