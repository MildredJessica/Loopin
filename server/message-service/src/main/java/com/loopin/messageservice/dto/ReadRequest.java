package com.loopin.messageservice.dto;

import java.util.UUID;

public record ReadRequest(
        UUID conversationId
) {}