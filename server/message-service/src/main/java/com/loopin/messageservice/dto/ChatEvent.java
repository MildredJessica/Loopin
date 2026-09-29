package com.loopin.messageservice.dto;

import com.loopin.messageservice.model.MessageType;

import java.time.Instant;
import java.util.UUID;

public record ChatEvent(
        UUID id,
        UUID conversationId,
        UUID senderId,
        MessageType type,
        String content,
        UUID clientMessageId,
        Instant createdAt
) {}