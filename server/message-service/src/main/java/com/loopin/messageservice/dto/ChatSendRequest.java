package com.loopin.messageservice.dto;

import com.loopin.messageservice.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ChatSendRequest(
        @NotNull UUID conversationId,
        @NotNull MessageType type,
        @Size(max = 5000) String content,
        UUID clientMessageId
) {}
