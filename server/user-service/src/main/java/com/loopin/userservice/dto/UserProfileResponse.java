package com.loopin.userservice.dto;

public record UserProfileResponse (
    String username,
    String name,
    String bio,
    String avatarGradient,
    String gradeLabel,
    long followerCount,
    long followingCount,
    boolean followedByCurrentUser
) {}
