package com.loopin.messageservice.dto;

import com.loopin.messageservice.model.MessageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(
        @NotNull MessageType type,
        @Size(max = 5000) String content,
        UUID clientMessageId
) {}
