package com.loopin.messageservice.dto;

import java.util.UUID;

public record ConversationActionRequest(
        UUID conversationId
) {}