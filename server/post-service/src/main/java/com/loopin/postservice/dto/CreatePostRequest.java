package com.loopin.postservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank @Size(max = 2000) String body,
        @Size(max = 60) String tag,
        @Size(max = 120) String mediaLabel,
        String mediaGradient
) {}
