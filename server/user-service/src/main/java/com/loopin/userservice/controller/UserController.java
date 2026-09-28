package com.loopin.userservice.controller;

import com.loopin.userservice.dto.SuggestionResponse;
import com.loopin.userservice.dto.UpdateProfileRequest;
import com.loopin.userservice.dto.UserProfileResponse;
import com.loopin.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

/**
 * X-User-Id / X-Username headers are attached by the API Gateway once it has
 * validated the caller's JWT — see gateway's JwtAuthFilter. They may be
 * absent for anonymous requests (e.g. viewing a public profile logged out).
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getProfile(
            @PathVariable String username,
            @RequestHeader(value = "X-User-Id", required = false) UUID viewerID
            ){
        return ResponseEntity.ok(userService.getProfile(username, viewerID));
    }

    @PutMapping("/{username}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable String username,
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ){
      return ResponseEntity.ok(userService.updateProfile(userId, username, request));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> follow(
            @PathVariable String username,
            @RequestHeader("X-User-Id") UUID followerId
    ) {
        userService.follow(followerId, username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{username}/follow")
    public ResponseEntity<Void> unfollow(
            @PathVariable String username,
            @RequestHeader("X-User-Id") UUID followerId
    ) {
        userService.unfollow(followerId, username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/avatar-gradient")
    public ResponseEntity<String> getAvatarGradient(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(userService.getAvatarGradient(userId));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<SuggestionResponse>> suggestions(
            @RequestHeader(value = "X-User-Id", required = false) UUID viewerId
    ) {
        return ResponseEntity.ok(userService.suggestions(viewerId));
    }
}
