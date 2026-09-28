package com.loopin.userservice.dto;

public record SuggestionResponse(
    String username,
    String name,
    String avatarGradient,
    boolean following
) {}
