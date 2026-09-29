package com.loopin.messageservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateConversationRequest(
        @NotBlank
        @Size(max = 30)
        String username
) {}
