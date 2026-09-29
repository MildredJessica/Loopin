package com.loopin.messageservice.dto;

import com.loopin.messageservice.model.ConversationStatus;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID otherUserId,
        String username,
        String name,
        String avatarGradient,
        ConversationStatus status,
        UUID requestedBy,
        String lastMessage,
        String lastMessageType,
        Instant lastMessageAt,
        long unreadCount
) {}
