package com.loopin.userservice.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateProfileRequest (
        @Size(max = 60) String name,
        @Size(max = 280) String bio,
        String avatarGradient,
        String gradeLabel,
        LocalDateTime updatedAt
) {}